"""
GitHub repository ingester using the free GitHub REST API.
Fetches README, issues, PRs, commits, and extracts entities for graph.
"""
import asyncio
import re
import base64
from typing import List, Dict, Any
from datetime import datetime
import httpx

from models.ingestion_schemas import (
    IngestionDocument, IngestionResult, GraphData,
    GraphEntity, GraphRelationship
)
from config.settings import settings


class GitHubIngester:
    """Ingest public GitHub repositories using REST API."""
    
    BASE_URL = "https://api.github.com"
    
    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Niyanta-RAG/1.0"
        }
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
    
    async def ingest(self, owner: str, repo: str) -> IngestionResult:
        """
        Ingest a complete GitHub repository.
        Fetches README, issues, PRs, commits, and builds graph.
        """
        documents = []
        source_name = f"{owner}/{repo}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Fetch repository metadata
            repo_data = await self._fetch_repo_metadata(client, owner, repo)
            
            # Fetch README
            readme_doc = await self._fetch_readme(client, owner, repo)
            if readme_doc:
                documents.append(readme_doc)
            
            # Fetch issues
            issue_docs = await self._fetch_issues(client, owner, repo)
            documents.extend(issue_docs)
            
            # Fetch pull requests
            pr_docs = await self._fetch_pull_requests(client, owner, repo)
            documents.extend(pr_docs)
            
            # Fetch commits
            commit_docs = await self._fetch_commits(client, owner, repo)
            documents.extend(commit_docs)
            
            # Try to fetch CHANGELOG
            changelog_doc = await self._fetch_changelog(client, owner, repo)
            if changelog_doc:
                documents.append(changelog_doc)
        
        # Extract entities and relationships for Neo4j
        graph_data = self._extract_entities_and_relationships(
            documents, owner, repo, repo_data
        )
        
        return IngestionResult(
            documents=documents,
            graph_data=graph_data,
            source_name=source_name,
            source_type="github_repo"
        )
    
    async def _fetch_repo_metadata(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> Dict[str, Any]:
        """Fetch repository metadata."""
        try:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Failed to fetch repo metadata: {e}")
        return {}
    
    async def _fetch_readme(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> IngestionDocument:
        """Fetch and decode README.md."""
        try:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/readme",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                content = base64.b64decode(data['content']).decode('utf-8')
                
                return IngestionDocument(
                    content=content,
                    metadata={
                        "source_type": "github_readme",
                        "source_url": data.get('html_url', f"https://github.com/{owner}/{repo}"),
                        "source_id": "README.md",
                        "repo": f"{owner}/{repo}",
                        "title": "README",
                        "created_at": datetime.utcnow().isoformat()
                    }
                )
        except Exception as e:
            print(f"Failed to fetch README: {e}")
        return None
    
    async def _fetch_issues(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> List[IngestionDocument]:
        """Fetch issues with comments."""
        documents = []
        try:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/issues",
                headers=self.headers,
                params={
                    "state": "all",
                    "per_page": min(settings.MAX_INGESTION_ISSUES, 100)
                }
            )
            
            if response.status_code == 200:
                issues = response.json()
                
                for issue in issues:
                    # Skip pull requests (they appear in issues endpoint)
                    if 'pull_request' in issue:
                        continue
                    
                    # Build issue content
                    content_parts = [
                        f"# Issue #{issue['number']}: {issue['title']}",
                        f"\n**Author:** {issue['user']['login']}",
                        f"**State:** {issue['state']}",
                        f"**Created:** {issue['created_at']}",
                    ]
                    
                    if issue.get('labels'):
                        labels = [label['name'] for label in issue['labels']]
                        content_parts.append(f"**Labels:** {', '.join(labels)}")
                    
                    if issue.get('body'):
                        content_parts.append(f"\n## Description\n{issue['body']}")
                    
                    # Fetch comments
                    if issue.get('comments', 0) > 0:
                        comments = await self._fetch_issue_comments(
                            client, owner, repo, issue['number']
                        )
                        if comments:
                            content_parts.append("\n## Comments")
                            for comment in comments[:10]:  # Limit to 10 comments
                                content_parts.append(
                                    f"\n**{comment['user']['login']}:** {comment['body'][:500]}"
                                )
                    
                    documents.append(IngestionDocument(
                        content="\n".join(content_parts),
                        metadata={
                            "source_type": "github_issue",
                            "source_url": issue['html_url'],
                            "source_id": f"issue#{issue['number']}",
                            "author": issue['user']['login'],
                            "created_at": issue['created_at'],
                            "repo": f"{owner}/{repo}",
                            "title": issue['title'],
                            "state": issue['state'],
                            "labels": ', '.join([label['name'] for label in issue.get('labels', [])])
                        }
                    ))
                    
                    # Rate limiting
                    await asyncio.sleep(0.1)
        
        except Exception as e:
            print(f"Failed to fetch issues: {e}")
        
        return documents
    
    async def _fetch_issue_comments(
        self, client: httpx.AsyncClient, owner: str, repo: str, issue_number: int
    ) -> List[Dict]:
        """Fetch comments for a specific issue."""
        try:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/issues/{issue_number}/comments",
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass
        return []
    
    async def _fetch_pull_requests(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> List[IngestionDocument]:
        """Fetch pull requests."""
        documents = []
        try:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/pulls",
                headers=self.headers,
                params={
                    "state": "all",
                    "per_page": min(settings.MAX_INGESTION_PRS, 100)
                }
            )
            
            if response.status_code == 200:
                prs = response.json()
                
                for pr in prs:
                    content_parts = [
                        f"# Pull Request #{pr['number']}: {pr['title']}",
                        f"\n**Author:** {pr['user']['login']}",
                        f"**State:** {pr['state']}",
                        f"**Created:** {pr['created_at']}",
                    ]
                    
                    if pr.get('merged_at'):
                        content_parts.append(f"**Merged:** {pr['merged_at']}")
                    
                    if pr.get('labels'):
                        labels = [label['name'] for label in pr['labels']]
                        content_parts.append(f"**Labels:** {', '.join(labels)}")
                    
                    if pr.get('body'):
                        content_parts.append(f"\n## Description\n{pr['body']}")
                    
                    documents.append(IngestionDocument(
                        content="\n".join(content_parts),
                        metadata={
                            "source_type": "github_pr",
                            "source_url": pr['html_url'],
                            "source_id": f"pr#{pr['number']}",
                            "author": pr['user']['login'],
                            "created_at": pr['created_at'],
                            "repo": f"{owner}/{repo}",
                            "title": pr['title'],
                            "state": pr['state'],
                            "merged": pr.get('merged_at') is not None
                        }
                    ))
                    
                    await asyncio.sleep(0.1)
        
        except Exception as e:
            print(f"Failed to fetch PRs: {e}")
        
        return documents
    
    async def _fetch_commits(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> List[IngestionDocument]:
        """Fetch recent commits."""
        documents = []
        try:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/commits",
                headers=self.headers,
                params={"per_page": min(settings.MAX_INGESTION_COMMITS, 50)}
            )
            
            if response.status_code == 200:
                commits = response.json()
                
                for commit in commits:
                    sha_short = commit['sha'][:7]
                    message = commit['commit']['message']
                    author = commit['commit']['author']['name']
                    date = commit['commit']['author']['date']
                    
                    content = f"Commit {sha_short}: {message}\nAuthor: {author}\nDate: {date}"
                    
                    documents.append(IngestionDocument(
                        content=content,
                        metadata={
                            "source_type": "github_commit",
                            "source_url": commit['html_url'],
                            "source_id": f"commit#{sha_short}",
                            "author": author,
                            "created_at": date,
                            "repo": f"{owner}/{repo}",
                            "title": message.split('\n')[0][:100]
                        }
                    ))
        
        except Exception as e:
            print(f"Failed to fetch commits: {e}")
        
        return documents
    
    async def _fetch_changelog(
        self, client: httpx.AsyncClient, owner: str, repo: str
    ) -> IngestionDocument:
        """Try to fetch CHANGELOG file."""
        for filename in ['CHANGELOG.md', 'CHANGELOG', 'CHANGES.md', 'CHANGES']:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/repos/{owner}/{repo}/contents/{filename}",
                    headers=self.headers
                )
                if response.status_code == 200:
                    data = response.json()
                    content = base64.b64decode(data['content']).decode('utf-8')
                    
                    return IngestionDocument(
                        content=content,
                        metadata={
                            "source_type": "github_changelog",
                            "source_url": data.get('html_url', f"https://github.com/{owner}/{repo}"),
                            "source_id": filename,
                            "repo": f"{owner}/{repo}",
                            "title": filename,
                            "created_at": datetime.utcnow().isoformat()
                        }
                    )
            except Exception:
                continue
        return None
    
    def _extract_entities_and_relationships(
        self, documents: List[IngestionDocument], owner: str, repo: str, repo_data: Dict
    ) -> GraphData:
        """Extract entities and relationships for Neo4j graph."""
        entities = []
        relationships = []
        
        # Add repository entity
        repo_name = f"{owner}/{repo}"
        entities.append(GraphEntity(
            name=repo_name,
            entity_type="repo",
            properties={
                "description": repo_data.get('description', ''),
                "language": repo_data.get('language', ''),
                "stars": repo_data.get('stargazers_count', 0)
            }
        ))
        
        # Track unique authors and labels
        authors = set()
        labels = set()
        
        # Extract from documents
        for doc in documents:
            metadata = doc.metadata
            source_type = metadata.get('source_type')
            
            # Extract author
            if 'author' in metadata:
                author = metadata['author']
                authors.add(author)
                
                # Create CREATED relationship
                if source_type in ['github_issue', 'github_pr', 'github_commit']:
                    relationships.append(GraphRelationship(
                        from_entity=author,
                        to_entity=metadata.get('source_id', ''),
                        relationship_type="CREATED",
                        properties={"created_at": metadata.get('created_at', '')}
                    ))
            
            # Extract labels
            if 'labels' in metadata:
                for label in metadata['labels']:
                    labels.add(label)
                    
                    # Create TAGGED relationship
                    relationships.append(GraphRelationship(
                        from_entity=metadata.get('source_id', ''),
                        to_entity=label,
                        relationship_type="TAGGED",
                        properties={}
                    ))
            
            # Extract "fixes #N" or "closes #N" from PR bodies
            if source_type == 'github_pr':
                content = doc.content.lower()
                issue_refs = re.findall(r'(?:fixes|closes|resolves)\s+#(\d+)', content)
                for issue_num in issue_refs:
                    relationships.append(GraphRelationship(
                        from_entity=metadata.get('source_id', ''),
                        to_entity=f"issue#{issue_num}",
                        relationship_type="RESOLVES",
                        properties={}
                    ))
        
        # Add author entities
        for author in authors:
            entities.append(GraphEntity(
                name=author,
                entity_type="author",
                properties={}
            ))
        
        # Add label entities
        for label in labels:
            entities.append(GraphEntity(
                name=label,
                entity_type="label",
                properties={}
            ))
        
        return GraphData(entities=entities, relationships=relationships)


# Global GitHub ingester instance
github_ingester = GitHubIngester()
