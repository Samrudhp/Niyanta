"""
Agent Worker - Executes steps from RabbitMQ queue.
Consumes messages, executes them, stores results in Redis.
Does NOT plan or decide - only executes.
"""
import time
import asyncio
import os
import uuid
from typing import List
from datetime import datetime
from groq import AsyncGroq

from database.redis_client import redis_client
from database.chroma_client import chroma_client
from database.neo4j_client import neo4j_client
from services.embedding_service import embedding_service
from services.entity_matcher import entity_matcher
from utils.rabbitmq_client import rabbitmq_client
from models.schemas import AgentStep, StepResult, StepType, Document
from config.settings import settings


class AgentWorker:
    """
    RabbitMQ consumer that executes agent steps.
    Runs independently, processes ONE step at a time.
    """
    
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.running = False
        # Worker identification for tracking and monitoring
        self.worker_id = os.getenv("WORKER_ID") or os.getenv("HOSTNAME") or f"worker-{uuid.uuid4().hex[:8]}"
        print(f"🆔 Worker ID: {self.worker_id}")
    
    async def start(self):
        """Start consuming steps from RabbitMQ."""
        self.running = True
        print("Agent Worker started, waiting for steps...")
        
        # Start consuming
        await rabbitmq_client.consume_steps(self._process_step)
        
        # Keep alive
        while self.running:
            await asyncio.sleep(1)
    
    async def stop(self):
        """Stop worker gracefully."""
        self.running = False
    
    async def _process_step(self, step: AgentStep):
        """
        Process a single step from the queue.
        Execute it and store result in Redis.
        """
        start_time = time.time()
        started_at = datetime.utcnow()
        
        try:
            # Route to appropriate handler
            if step.step_type == StepType.RETRIEVE:
                result_data = await self._execute_retrieval(step)
                status = "success"
                error = None
            
            elif step.step_type == StepType.REASON:
                result_data = await self._execute_reasoning(step)
                status = "success"
                error = None
            
            else:
                result_data = None
                status = "failure"
                error = f"Unknown step type: {step.step_type}"
        
        except Exception as e:
            result_data = None
            status = "failure"
            error = str(e)
            print(f"Error processing step: {error}")
            
            # Retry logic
            if step.attempt < step.max_attempts:
                print(f"Retrying step {step.step_id} (attempt {step.attempt + 1}/{step.max_attempts})")
                # Re-publish with incremented attempt
                step_dict = step.model_dump()
                step_dict['attempt'] = step.attempt + 1
                retry_step = AgentStep(**step_dict)
                await rabbitmq_client.publish_step(retry_step)
                return  # Don't store result yet
        
        # Store result in Redis
        execution_time = (time.time() - start_time) * 1000
        completed_at = datetime.utcnow()
        
        result = StepResult(
            step_id=step.step_id,
            status=status,
            data=result_data,
            error=error,
            execution_time_ms=execution_time,
            worker_id=self.worker_id,
            started_at=started_at,
            completed_at=completed_at
        )
        
        result_key = f"step_result:{step.step_id}"
        await redis_client.set_json(
            result_key,
            result.model_dump(),
            ttl=600  # 10 minutes
        )
        
        print(f"Step {step.step_id} completed: {status}")
    
    async def _execute_retrieval(self, step: AgentStep) -> dict:
        """
        Execute retrieval step.
        Supports vector and graph retrieval.
        """
        # Validate payload
        if "query" not in step.payload:
            raise ValueError(f"Missing 'query' in payload. Got: {list(step.payload.keys())}")
        
        query = step.payload["query"]
        retrieval_mode = step.payload.get("retrieval_mode", "vector_only")
        entities = step.payload.get("entities", [])
        
        documents = []
        
        # Vector retrieval
        if retrieval_mode in ["vector_only", "hybrid"]:
            query_embedding = embedding_service.embed_text(query)
            
            results = chroma_client.query(
                query_embeddings=[query_embedding],
                n_results=settings.RETRIEVAL_TOP_K
            )
            
            for i, doc_id in enumerate(results['ids'][0]):
                documents.append({
                    "doc_id": doc_id,
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'][0] else {},
                    "score": 1.0 - results['distances'][0][i]
                })
        
        # Graph retrieval (if entities present)
        if retrieval_mode in ["graph", "hybrid"] and entities:
            print(f"  🔍 Graph search for entities: {entities[:3]}")
            
            # Use semantic entity matcher to find Neo4j entities
            matched_entities = await entity_matcher.find_matching_entities(
                query_entities=entities[:5],  # Limit to first 5 entities
                threshold=0.6,  # Similarity threshold
                top_k=2  # Top 2 matches per query entity
            )
            
            print(f"  🎯 Found {len(matched_entities)} semantic matches")
            
            # If semantic matching found entities, retrieve their relationships
            if matched_entities:
                for match in matched_entities:
                    entity_name = match['matched_entity']
                    similarity = match['similarity']
                    
                    print(f"  📍 {match['query_entity']} → {entity_name} (score: {similarity:.2f})")
                    
                    # Get relationships for matched entity
                    relationships = await neo4j_client.find_entity_relationships(
                        entity=entity_name,
                        max_depth=2
                    )
                    
                    if relationships:
                        graph_content = f"Entity '{entity_name}' (matched from '{match['query_entity']}', similarity: {similarity:.2f}):\n"
                        for rel in relationships[:5]:
                            graph_content += f"- Connected to {rel['target']} ({rel['target_type']}) via {rel['relationships']}\n"
                        
                        documents.append({
                            "doc_id": f"graph_{entity_name.replace(' ', '_')}",
                            "content": graph_content,
                            "metadata": {
                                "source": "neo4j",
                                "entity": entity_name,
                                "type": match['entity_type'],
                                "match_method": match['match_method'],
                                "similarity": similarity
                            },
                            "score": 0.8 + (similarity * 0.2)  # Boost score based on similarity
                        })
            
            # Fallback: If no good semantic matches, use keyword-based type inference
            if not matched_entities or len(matched_entities) < 2:
                print(f"  🔄 Fallback: Using keyword-based type inference")
                fallback_matches = await entity_matcher.find_related_by_type(
                    query_entities=entities[:3],
                    limit=3
                )
                
                for match in fallback_matches:
                    entity_name = match['matched_entity']
                    
                    # Avoid duplicates
                    if any(d.get('metadata', {}).get('entity') == entity_name for d in documents):
                        continue
                    
                    relationships = await neo4j_client.find_entity_relationships(
                        entity=entity_name,
                        max_depth=2
                    )
                    
                    if relationships:
                        graph_content = f"Entity '{entity_name}' (type-inferred):\n"
                        for rel in relationships[:5]:
                            graph_content += f"- Connected to {rel['target']} ({rel['target_type']}) via {rel['relationships']}\n"
                        
                        documents.append({
                            "doc_id": f"graph_{entity_name.replace(' ', '_')}",
                            "content": graph_content,
                            "metadata": {
                                "source": "neo4j",
                                "entity": entity_name,
                                "type": match['entity_type'],
                                "match_method": match['match_method']
                            },
                            "score": 0.75
                        })
        
        return {
            "documents": documents,
            "retrieval_mode": retrieval_mode,
            "num_results": len(documents)
        }
    
    async def _execute_reasoning(self, step: AgentStep) -> dict:
        """
        Execute reasoning step using LLM.
        Analyzes relationships and draws conclusions.
        """
        entities = step.payload.get("entities", [])
        previous_context = step.payload.get("previous_context")
        
        # Build reasoning prompt
        prompt = f"""Analyze the relationships between these entities: {', '.join(entities)}

Previous context:
{previous_context if previous_context else 'None'}

Provide a reasoning analysis focusing on:
1. How these entities are connected
2. Any important relationships or patterns
3. Relevant conclusions

Keep your analysis concise and factual."""
        
        response = await self.groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an analytical AI assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=400
        )
        
        reasoning_output = response.choices[0].message.content
        
        # Check for contradictions in Neo4j
        contradictions = []
        if len(entities) >= 2:
            contradictions = await neo4j_client.find_contradictions(
                entities[0],
                entities[1]
            )
        
        return {
            "reasoning": reasoning_output,
            "entities_analyzed": entities,
            "contradictions_found": len(contradictions),
            "relationships": contradictions[:3] if contradictions else []
        }


# Global worker instance
agent_worker = AgentWorker()
