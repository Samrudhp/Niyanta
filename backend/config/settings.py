"""
Configuration management using Pydantic Settings.
Loads from environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Agentic RAG System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  
    
    # Embedding Model
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # Semantic Cache
    CACHE_SIMILARITY_THRESHOLD: float = 0.92
    CACHE_TTL_SECONDS: int = 3600  # 1 hour
    
    # RabbitMQ
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_QUEUE: str = "agent_step_queue"
    
    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./data/chromadb"
    CHROMA_COLLECTION: str = "knowledge_base"
    
    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    
    # RAG Configuration
    RETRIEVAL_TOP_K: int = 5
    HYBRID_SEARCH_ENABLED: bool = True
    
    # Agentic RAG
    MAX_AGENT_STEPS: int = 5
    MAX_REPLANS: int = 1
    MAX_STEP_RETRIES: int = 2
    AGENT_TIMEOUT_SECONDS: int = 120
    
    # Router Thresholds
    COMPLEXITY_THRESHOLD: float = 0.6  # Above this → Agentic RAG
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
