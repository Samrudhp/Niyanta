"""
Pydantic models for ingestion system.
Handles URL ingestion, PDF uploads, and digest generation.
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class IngestionDocument(BaseModel):
    """Single document extracted from an ingestion source."""
    content: str
    metadata: Dict[str, Any]  # source_type, source_url, source_id, author, created_at, title, repo


class GraphEntity(BaseModel):
    """Entity node for Neo4j graph."""
    name: str
    entity_type: str  # "repo", "author", "label", "package", "issue", "pr"
    properties: Dict[str, Any]


class GraphRelationship(BaseModel):
    """Relationship edge for Neo4j graph."""
    from_entity: str
    to_entity: str
    relationship_type: str  # "RESOLVES", "TAGGED", "CREATED", "CHANGES", "MENTIONS"
    properties: Dict[str, Any] = {}


class GraphData(BaseModel):
    """Complete graph structure extracted from ingestion."""
    entities: List[GraphEntity]
    relationships: List[GraphRelationship]


class IngestionResult(BaseModel):
    """Result of ingestion operation."""
    documents: List[IngestionDocument]
    graph_data: GraphData
    source_name: str
    source_type: str


class IngestURLRequest(BaseModel):
    """Request to ingest a URL."""
    url: str
    recursive: bool = False  # for webpage crawling


class IngestStatusResponse(BaseModel):
    """Status of an ingestion operation."""
    ingestion_id: str
    status: str  # "running", "complete", "failed"
    source_url: str
    source_type: str
    source_name: str
    total_docs: int
    processed_docs: int
    entity_count: int
    created_at: str
    message: Optional[str] = None


class DigestRequest(BaseModel):
    """Request to generate a digest."""
    ingestion_id: str
    days_back: int = 7


class DigestSection(BaseModel):
    """Section of a digest (e.g., Issues, PRs, Commits)."""
    type: str
    count: int
    summary: str


class DigestResponse(BaseModel):
    """Generated digest of an ingested source."""
    source_name: str
    period: str
    sections: List[DigestSection]
    stats: Dict[str, Any]
    generated_at: str


class IngestionListResponse(BaseModel):
    """List of all ingestions."""
    ingestions: List[IngestStatusResponse]
    total: int
