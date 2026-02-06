"""
Normal RAG Pipeline - Simple and Fast
No LangGraph, No RabbitMQ, No loops.
Just: embed → retrieve → generate → return
"""
import time
from typing import List
from groq import AsyncGroq
from database.chroma_client import chroma_client
from services.embedding_service import embedding_service
from models.schemas import Document, RetrievalResult, RetrievalMode
from config.settings import settings


class NormalRAG:
    """
    Simple RAG pipeline for straightforward queries.
    Single retrieval + single LLM call.
    """
    
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    
    async def process_query(self, query: str, request_id: str) -> dict:
        """
        Execute complete Normal RAG pipeline.
        Returns answer with metadata.
        """
        start_time = time.time()
        
        # Step 1: Embed query
        query_embedding = embedding_service.embed_text(query)
        
        # Step 2: Retrieve relevant documents
        retrieval_result = self._retrieve_documents(query_embedding)
        
        # Step 3: Generate answer using LLM
        answer = await self._generate_answer(query, retrieval_result.documents)
        
        processing_time = (time.time() - start_time) * 1000
        
        # Format sources for response
        sources = [{
            "id": doc.doc_id,
            "content": doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
            "similarity": doc.score,
            **doc.metadata
        } for doc in retrieval_result.documents]
        
        return {
            "answer": answer,
            "confidence": self._calculate_confidence(retrieval_result),
            "sources": sources,
            "metadata": {
                "num_documents": len(retrieval_result.documents),
                "retrieval_mode": retrieval_result.retrieval_mode.value,
                "model": settings.GROQ_MODEL
            },
            "processing_time_ms": processing_time
        }
    
    def _retrieve_documents(self, query_embedding: List[float]) -> RetrievalResult:
        """Retrieve top-k relevant documents from ChromaDB."""
        results = chroma_client.query(
            query_embeddings=[query_embedding],
            n_results=settings.RETRIEVAL_TOP_K
        )
        
        # Convert to Document models
        documents = []
        for i, doc_id in enumerate(results['ids'][0]):
            documents.append(Document(
                doc_id=doc_id,
                content=results['documents'][0][i],
                metadata=results['metadatas'][0][i] if results['metadatas'][0] else {},
                score=1.0 - results['distances'][0][i]  # Convert distance to similarity
            ))
        
        return RetrievalResult(
            documents=documents,
            retrieval_mode=RetrievalMode.VECTOR_ONLY,
            query_embedding=query_embedding
        )
    
    async def _generate_answer(self, query: str, documents: List[Document]) -> str:
        """Generate answer using Groq with retrieved context."""
        # Build context from documents
        context = "\n\n".join([
            f"[Source {i+1}] {doc.content}"
            for i, doc in enumerate(documents)
        ])
        
        # Construct prompt
        system_prompt = """You are a helpful AI assistant. Answer the user's question based on the provided context.
If the context doesn't contain relevant information, say so clearly.
Be concise and accurate."""
        
        user_prompt = f"""Context:
{context}

Question: {query}

Answer:"""
        
        # Call Groq
        response = await self.groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    def _calculate_confidence(self, retrieval_result: RetrievalResult) -> float:
        """Calculate confidence based on retrieval scores."""
        if not retrieval_result.documents:
            return 0.0
        
        # Average of top document scores
        avg_score = sum(doc.score for doc in retrieval_result.documents) / len(retrieval_result.documents)
        return min(avg_score, 1.0)


# Global Normal RAG instance
normal_rag = NormalRAG()
