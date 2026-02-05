# Niyanta - Agentic RAG System

> **Production-ready Retrieval-Augmented Generation (RAG) system with dual-pipeline architecture for intelligent query processing.**

## 📋 Overview

Niyanta is a comprehensive RAG system that intelligently routes queries between **Normal RAG** and **Agentic RAG** pipelines based on query complexity. The system combines vector databases, graph databases, and LLM reasoning to provide accurate, context-aware answers for financial services domain.

### Key Features

- **Dual Pipeline Architecture**: Automatic routing between Normal RAG (fast, simple queries) and Agentic RAG (complex, multi-hop reasoning)
- **Hybrid Database Strategy**: ChromaDB (vector search) + Neo4j (graph reasoning)
- **Semantic Caching**: 25-60x speedup with embedding-based similarity matching
- **Async Task Processing**: RabbitMQ-based worker system for complex queries
- **Admin Dashboard**: Full system monitoring, analytics, and management
- **Production Ready**: 80% robustness, comprehensive error handling

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        U[User Interface]
        A[Admin Dashboard]
    end
    
    subgraph "API Layer"
        API[FastAPI Server<br/>Port 8000]
    end
    
    subgraph "Intelligence Layer"
        R[Query Router<br/>LLM-based Classification]
        NR[Normal RAG Pipeline]
        AR[Agentic RAG Pipeline]
    end
    
    subgraph "Data Layer"
        C[ChromaDB<br/>Vector Store<br/>100 docs]
        N[Neo4j<br/>Graph DB<br/>56 nodes, 78 rels]
        RD[Redis<br/>Cache & State]
    end
    
    subgraph "Processing Layer"
        RMQ[RabbitMQ<br/>Message Queue]
        W[Worker Process<br/>Async Tasks]
        LG[LangGraph<br/>Planning & Reasoning]
    end
    
    subgraph "LLM Layer"
        G[Groq API<br/>llama-3.3-70b-versatile]
        E[SentenceTransformers<br/>all-MiniLM-L6-v2]
    end
    
    U --> API
    A --> API
    API --> R
    R --> NR
    R --> AR
    NR --> C
    AR --> LG
    LG --> RMQ
    RMQ --> W
    W --> C
    W --> N
    W --> G
    NR --> RD
    AR --> RD
    API --> E
    NR --> G
    AR --> G
    
    style API fill:#4CAF50
    style R fill:#FF9800
    style NR fill:#2196F3
    style AR fill:#9C27B0
    style C fill:#00BCD4
    style N fill:#E91E63
    style RD fill:#FF5722
    style G fill:#FFC107
```

---

## 📊 System Flow

### 1️⃣ Query Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Cache
    participant Router
    participant NormalRAG
    participant AgenticRAG
    participant ChromaDB
    participant Neo4j
    participant LLM
    
    User->>API: Submit Query
    API->>Cache: Check Cache
    
    alt Cache Hit
        Cache-->>API: Return Cached Answer
        API-->>User: Response (25-60x faster)
    else Cache Miss
        Cache-->>API: Not Found
        API->>Router: Classify Query
        Router->>LLM: Analyze Complexity
        LLM-->>Router: Classification Result
        
        alt Simple Query
            Router->>NormalRAG: Route to Normal Pipeline
            NormalRAG->>ChromaDB: Vector Search
            ChromaDB-->>NormalRAG: Top-K Documents
            NormalRAG->>LLM: Generate Answer
            LLM-->>NormalRAG: Response
            NormalRAG-->>API: Answer
        else Complex Query
            Router->>AgenticRAG: Route to Agentic Pipeline
            AgenticRAG->>AgenticRAG: Extract Entities
            AgenticRAG->>ChromaDB: Vector Search
            AgenticRAG->>Neo4j: Graph Traversal
            ChromaDB-->>AgenticRAG: 5 Documents
            Neo4j-->>AgenticRAG: 9 Graph Documents
            AgenticRAG->>LLM: Synthesize Answer
            LLM-->>AgenticRAG: Response
            AgenticRAG-->>API: Answer
        end
        
        API->>Cache: Store Answer
        API-->>User: Response
    end
```

---

## 🎯 Pipeline Comparison

| Feature | Normal RAG | Agentic RAG |
|---------|-----------|-------------|
| **Use Case** | Simple factual queries | Complex multi-hop reasoning |
| **Speed** | ~500ms | ~2000ms |
| **Database** | ChromaDB only | ChromaDB + Neo4j (Hybrid) |
| **Accuracy** | 85-90% | 95-98% |
| **Reasoning** | Direct retrieval | Multi-step planning |
| **Cache Rate** | High (60%) | Lower (30%) |

---

## 🗂️ Project Structure

```
Niyanta/
├── backend/               # FastAPI backend server
│   ├── config/           # Settings and configuration
│   ├── database/         # DB clients (Redis, Neo4j, ChromaDB)
│   ├── models/           # Pydantic schemas
│   ├── services/         # Business logic
│   │   ├── agentic_rag/  # Agentic pipeline components
│   │   ├── normal_rag.py
│   │   ├── router.py
│   │   ├── semantic_cache.py
│   │   └── admin_analytics.py
│   ├── utils/            # RabbitMQ, helpers
│   ├── main.py           # FastAPI app entry
│   ├── worker_main.py    # RabbitMQ worker
│   └── tests/            # Test suite
│
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # User & Admin dashboards
│   │   └── components/   # Reusable components
│   └── package.json
│
└── docs/                 # Documentation (this folder)
    ├── README.md         # This file
    ├── BACKEND.md        # Backend detailed docs
    └── FRONTEND.md       # Frontend detailed docs
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (for Redis, RabbitMQ)
- Neo4j Desktop or Server

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start infrastructure
docker run -d -p 6379:6379 redis:latest
docker run -d -p 5672:15672 rabbitmq:management

# Start Neo4j (configure at localhost:7474)

# Run server
python main.py  # Port 8000

# Run worker (in another terminal)
python worker_main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Port 5173
```

---

## 📈 System Metrics

- **Total Documents**: 100 (Financial Services)
- **Graph Nodes**: 56 entities
- **Graph Relationships**: 78 (15 types)
- **Cache Hit Rate**: 45-60%
- **Average Response Time**: 
  - Cached: 10-50ms
  - Normal RAG: 500-800ms
  - Agentic RAG: 1500-2500ms
- **Robustness Score**: 80% (4/5 tests passing)

---

## 🔑 Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Framework** | FastAPI | REST API server |
| **Frontend Framework** | React + Vite | User & Admin UI |
| **LLM** | Groq (llama-3.3-70b) | Query processing & generation |
| **Embeddings** | SentenceTransformers | Semantic similarity |
| **Vector DB** | ChromaDB | Document storage & retrieval |
| **Graph DB** | Neo4j | Entity relationships |
| **Cache** | Redis | Semantic caching & state |
| **Queue** | RabbitMQ | Async task processing |
| **Orchestration** | LangGraph | Agentic workflow planning |

---

## 📚 Documentation Index

1. **[Backend Architecture](./BACKEND.md)** - Detailed backend components, pipelines, and flows
2. **[Frontend Guide](./FRONTEND.md)** - UI components, routing, and admin features

---

## 🎓 Learning Path

### For Understanding the System:
1. Start with **Normal RAG Pipeline** (simpler)
2. Understand **Semantic Caching** mechanism
3. Study **Query Router** classification logic
4. Deep dive into **Agentic RAG** with LangGraph
5. Explore **Hybrid Retrieval** (Vector + Graph)

### For Development:
1. Review `backend/main.py` - API endpoints
2. Check `services/router.py` - Query classification
3. Study `services/agentic_rag/langgraph_planner.py` - Planning logic
4. Examine `worker_main.py` - Async processing

---

## 🔒 Admin Access

- **URL**: http://localhost:5173/admin/login
- **Password**: `admin123`

**Admin Features:**
- System health monitoring
- Document ingestion
- Cache management
- Queue & task monitoring
- Analytics & charts
- Router statistics

---

## 🧪 Testing

```bash
# Test cache endpoints
python tests/test_cache_management.py

# Test admin endpoints
python tests/test_admin_endpoints.py

# Test robustness
python tests/test_robustness.py

# Test hybrid mode
python tests/test_hybrid_quick.py
```

---

## 📞 API Endpoints

### User Endpoints
- `POST /query` - Main query endpoint
- `POST /agent/async` - Submit async agentic task
- `GET /agent/status/{task_id}` - Check task status
- `GET /health` - Health check

### Admin Endpoints (9)
- `GET /admin/stats` - System statistics
- `GET /admin/health-detailed` - Detailed health
- `POST /admin/ingest` - Ingest documents
- `GET /admin/chromadb/stats` - Vector DB stats
- `GET /admin/neo4j/stats` - Graph DB stats
- `GET /admin/rabbitmq/status` - Queue status
- `GET /admin/tasks` - Task list
- `GET /admin/router-stats` - Router analytics
- `GET /admin/analytics` - Charts data

### Cache Endpoints (5)
- `GET /cache/stats` - Cache metrics
- `GET /cache/keys` - List cached queries
- `GET /cache/search?q=keyword` - Search cache
- `POST /cache/clear` - Clear all cache
- `DELETE /cache/query?query=...` - Delete specific entry

---

## 🎯 Production Roadmap

See [ROBUSTNESS_ROADMAP.md](../backend/docs/ROBUSTNESS_ROADMAP.md) for:
- Priority 1: Concurrent load handling, error recovery
- Priority 2: Advanced caching, monitoring
- Priority 3: ML optimization, auto-scaling

---

## 📄 License

This project is for educational and development purposes.

---

## 🤝 Contributing

This is a demonstration project showcasing:
- Modern RAG architecture
- LLM-powered query routing
- Hybrid database strategies
- Production-ready system design

---

**Built with ❤️ using FastAPI, React, Groq, Neo4j, and ChromaDB**
