"""
Redis client for semantic caching and short-lived agent state.
Handles connection pooling and async operations.
"""
import json
import asyncio
from typing import Optional, Any
from redis.asyncio import Redis, ConnectionPool
from config.settings import settings


class RedisClient:
    """Async Redis client wrapper."""
    
    def __init__(self):
        self.pool: Optional[ConnectionPool] = None
        self.client: Optional[Redis] = None
    
    async def connect(self):
        """Initialize Redis connection pool."""
        self.pool = ConnectionPool(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=False,  # Handle binary for embeddings
            max_connections=20
        )
        self.client = Redis(connection_pool=self.pool)
    
    async def disconnect(self):
        """Close Redis connections."""
        if self.client:
            await self.client.close()
        if self.pool:
            await self.pool.disconnect()
    
    async def get(self, key: str) -> Optional[bytes]:
        """Get value by key."""
        return await self.client.get(key)
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value with optional TTL (seconds)."""
        await self.client.set(key, value, ex=ttl)
    
    async def set_json(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set JSON-serializable value."""
        await self.set(key, json.dumps(value), ttl)
    
    async def get_json(self, key: str) -> Optional[Any]:
        """Get and deserialize JSON value."""
        value = await self.get(key)
        return json.loads(value) if value else None
    
    async def delete(self, key: str):
        """Delete key."""
        await self.client.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        return await self.client.exists(key) > 0
    
    async def increment(self, key: str) -> int:
        """Increment counter."""
        return await self.client.incr(key)
    
    async def health_check(self) -> bool:
        """Check Redis connection health."""
        try:
            await self.client.ping()
            return True
        except Exception:
            return False


# Global Redis client instance
redis_client = RedisClient()
