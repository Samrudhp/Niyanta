"""
Reddit thread ingester using public JSON API.
No OAuth required - just append .json to any Reddit URL.
"""
from typing import List, Dict
import httpx

from models.ingestion_schemas import (
    IngestionDocument, IngestionResult, GraphData,
    GraphEntity, GraphRelationship
)


class RedditIngester:
    """Ingest Reddit threads using public JSON API."""
    
    def __init__(self):
        self.headers = {"User-Agent": "Niyanta/1.0"}
    
    async def ingest(self, url: str) -> IngestionResult:
        """
        Ingest a Reddit post and its comments.
        
        Args:
            url: Reddit post URL (e.g., https://www.reddit.com/r/Python/comments/abc123/title/)
        """
        documents = []
        
        # Ensure URL ends with .json
        json_url = url.rstrip('/') + '.json'
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(json_url, headers=self.headers)
                
                if response.status_code != 200:
                    raise Exception(f"Failed to fetch Reddit data: {response.status_code}")
                
                data = response.json()
                
                # Reddit returns [post_data, comments_data]
                post_data = data[0]['data']['children'][0]['data']
                comments_data = data[1]['data']['children'] if len(data) > 1 else []
                
                # Extract post
                post_doc = self._extract_post(post_data)
                documents.append(post_doc)
                
                # Extract comments
                comment_docs = self._extract_comments(comments_data, post_data)
                documents.extend(comment_docs)
        
        except Exception as e:
            print(f"Failed to ingest Reddit post: {e}")
            # Return minimal result
            return IngestionResult(
                documents=[],
                graph_data=GraphData(entities=[], relationships=[]),
                source_name=url,
                source_type="reddit"
            )
        
        # Build graph data
        subreddit = post_data.get('subreddit', 'unknown')
        graph_data = GraphData(
            entities=[
                GraphEntity(name=subreddit, entity_type="subreddit", properties={}),
                GraphEntity(name=post_data.get('author', 'unknown'), entity_type="reddit_user", properties={})
            ],
            relationships=[]
        )
        
        return IngestionResult(
            documents=documents,
            graph_data=graph_data,
            source_name=f"r/{subreddit}",
            source_type="reddit"
        )
    
    def _extract_post(self, post_data: Dict) -> IngestionDocument:
        """Extract Reddit post as document."""
        title = post_data.get('title', '')
        selftext = post_data.get('selftext', '')
        author = post_data.get('author', '[deleted]')
        score = post_data.get('score', 0)
        subreddit = post_data.get('subreddit', '')
        created_utc = post_data.get('created_utc', 0)
        permalink = f"https://www.reddit.com{post_data.get('permalink', '')}"
        
        content = f"# {title}\n\n**Author:** u/{author}\n**Score:** {score}\n**Subreddit:** r/{subreddit}\n\n{selftext}"
        
        return IngestionDocument(
            content=content,
            metadata={
                "source_type": "reddit_post",
                "source_url": permalink,
                "author": author,
                "score": score,
                "subreddit": subreddit,
                "created_at": str(created_utc),
                "title": title
            }
        )
    
    def _extract_comments(self, comments_data: List, post_data: Dict) -> List[IngestionDocument]:
        """Extract top comments as documents."""
        documents = []
        
        # Flatten and sort comments by score
        comments = self._flatten_comments(comments_data)
        comments.sort(key=lambda c: c.get('score', 0), reverse=True)
        
        # Take top 50 comments
        for comment in comments[:50]:
            if comment.get('body') and comment['body'] not in ['[deleted]', '[removed]']:
                content = f"**Comment by u/{comment.get('author', 'unknown')}** (Score: {comment.get('score', 0)})\n\n{comment['body']}"
                
                documents.append(IngestionDocument(
                    content=content,
                    metadata={
                        "source_type": "reddit_comment",
                        "source_url": f"https://www.reddit.com{post_data.get('permalink', '')}",
                        "author": comment.get('author', 'unknown'),
                        "score": comment.get('score', 0),
                        "subreddit": post_data.get('subreddit', ''),
                        "created_at": str(comment.get('created_utc', 0))
                    }
                ))
        
        return documents
    
    def _flatten_comments(self, comments_data: List) -> List[Dict]:
        """Recursively flatten nested comment tree."""
        flat_comments = []
        
        for item in comments_data:
            if item['kind'] == 't1':  # Comment
                comment = item['data']
                flat_comments.append(comment)
                
                # Recursively process replies
                if 'replies' in comment and comment['replies']:
                    if isinstance(comment['replies'], dict):
                        replies = comment['replies'].get('data', {}).get('children', [])
                        flat_comments.extend(self._flatten_comments(replies))
        
        return flat_comments


# Global Reddit ingester instance
reddit_ingester = RedditIngester()
