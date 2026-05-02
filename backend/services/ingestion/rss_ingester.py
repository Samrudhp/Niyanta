"""
RSS/Atom feed ingester.
Parses feeds and optionally fetches full article content.
"""
from typing import List
from datetime import datetime, timedelta
import feedparser

from models.ingestion_schemas import (
    IngestionDocument, IngestionResult, GraphData,
    GraphEntity, GraphRelationship
)


class RSSIngester:
    """Ingest RSS/Atom feeds."""
    
    async def ingest(self, url: str, days_back: int = 30) -> IngestionResult:
        """
        Ingest RSS/Atom feed entries.
        
        Args:
            url: Feed URL
            days_back: Only include entries from last N days
        """
        documents = []
        
        # Parse feed
        feed = feedparser.parse(url)
        
        if not feed.entries:
            raise ValueError("No entries found in feed")
        
        # Calculate cutoff date
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        
        feed_title = feed.feed.get('title', 'Unknown Feed')
        
        # Process entries
        for entry in feed.entries:
            # Check date
            published = self._parse_date(entry)
            if published and published < cutoff_date:
                continue
            
            # Extract content
            content_parts = [f"# {entry.get('title', 'Untitled')}"]
            
            # Get content (try different fields)
            content = (
                entry.get('content', [{}])[0].get('value', '') or
                entry.get('summary', '') or
                entry.get('description', '')
            )
            
            if content:
                content_parts.append(content)
            
            # Extract tags
            tags = [tag.get('term', '') for tag in entry.get('tags', [])]
            
            documents.append(IngestionDocument(
                content='\n\n'.join(content_parts),
                metadata={
                    "source_type": "rss_entry",
                    "source_url": entry.get('link', url),
                    "feed_title": feed_title,
                    "published_at": published.isoformat() if published else '',
                    "author": entry.get('author', ''),
                    "tags": ', '.join(tags) if tags else '',
                    "title": entry.get('title', 'Untitled')
                }
            ))
        
        # Build graph data
        graph_data = GraphData(
            entities=[
                GraphEntity(name=feed_title, entity_type="rss_feed", properties={})
            ],
            relationships=[]
        )
        
        return IngestionResult(
            documents=documents,
            graph_data=graph_data,
            source_name=feed_title,
            source_type="rss"
        )
    
    def _parse_date(self, entry: dict) -> datetime:
        """Parse entry date from various fields."""
        for field in ['published_parsed', 'updated_parsed', 'created_parsed']:
            if field in entry and entry[field]:
                try:
                    time_struct = entry[field]
                    return datetime(*time_struct[:6])
                except Exception:
                    continue
        return None


# Global RSS ingester instance
rss_ingester = RSSIngester()
