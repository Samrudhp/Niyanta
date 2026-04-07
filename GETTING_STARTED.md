# 🚀 Niyanta - Getting Started Guide

**Complete Setup & Deployment Guide for Agentic RAG System**

---

## 📋 Quick Navigation

- **First Time?** → Jump to [5-Minute Setup](#-5-minute-setup)
- **Need Production?** → Go to [Deployment Options](#-deployment-options)
- **Want to Understand?** → Read [Architecture Overview](#-architecture-overview)
- **Already Running?** → Check [Verification & Testing](#-verification--testing)
- **Got Issues?** → See [Troubleshooting](#-troubleshooting)

---

## 🎯 5-Minute Setup

### Step 1: Prerequisites
```bash
# Check requirements
docker --version        # Should be 20.10+
docker-compose --version  # Should be 2.0+
node --version          # Should be 16+ (for frontend)
git --version           # For version control
```

**Not installed?**
- **Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Node.js**: [Install Node.js](https://nodejs.org)
- **Git**: [Install Git](https://git-scm.com)

### Step 2: Clone & Configure
```bash
# Clone repository
git clone <your-repo-url>
cd Niyanta

# Create environment file
cp docker/config/.env.example .env

# Add your API key
nano .env  # Edit GROQ_API_KEY=your_api_key_here
```

**Don't have a Groq API key?** → [Get one free here](https://console.groq.com)

### Step 3: Start Everything
```bash
# Navigate to docker directory
cd docker

# Start all services (takes 1-2 minutes)
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### Step 4: Access Everything
```
🌐 Frontend:         http://localhost:3000
🔧 Backend API:      http://localhost:8000
📚 API Docs:         http://localhost:8000/docs
📊 Grafana:          http://localhost:3000 (admin/admin)
📈 Prometheus:       http://localhost:9090
```

**✅ Done!** You now have Niyanta running locally.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│              React Frontend (Port 3000)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Backend API (Port 8000)                         │
│  • LangGraph Planner (Intelligent Decision Making)           │
│  • Orchestrator (Task Coordination)                          │
│  • Query Router (Route to Right Tool)                        │
│  • Semantic Cache (45-60% hit rate)                          │
└────────────────────┬────────────────────┬───────────────────┘
                     │                    │
        ┌────────────┴─────────┬──────────┴──────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼────┐         ┌──────▼────┐
    │RabbitMQ│          │  Redis  │         │Neo4j/Chro-│
    │(Queue) │          │(Cache)  │         │maDB(Store)│
    └────┬───┘          └─────────┘         └───────────┘
         │
    ┌────▼──────────────────────┐
    │  Worker Pool (3-10)        │
    │  • Semantic Search         │
    │  • Graph Queries           │
    │  • Entity Matching         │
    │  • LLM Reasoning           │
    └───────────────────────────┘
```

**Key Components:**
- **LangGraph**: Intelligent planning with state management
- **RabbitMQ**: Distributes tasks to workers
- **Redis**: Caches results, stores state
- **Neo4j**: Graph database for relationships
- **ChromaDB**: Vector embeddings for semantic search
- **Workers**: Distributed executors (scales horizontally)

---

## 🐳 Deployment Options

### Option 1: Docker Compose (Local/Dev) ⭐ RECOMMENDED FOR STARTING OUT

**When to use:**
- Local development
- Testing features
- Small deployments (<10 concurrent users)
- Learning the system

**Pros:** Simple, all-in-one, quick setup  
**Cons:** Single machine, limited scaling

**Setup:**
```bash
cd docker
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

**Configuration:** Edit `.env` file for customization

---

### Option 2: Kubernetes (Production) 🚀 FOR ENTERPRISE

**When to use:**
- Production deployments
- High availability needed (100+ users)
- Auto-scaling required
- Multi-machine clusters
- Enterprise infrastructure

**Pros:** Scalable, resilient, distributed  
**Cons:** More complex setup, requires K8s knowledge

**Setup:**
```bash
# Apply all manifests to K8s cluster
kubectl apply -f k8s/

# Wait for rollout
kubectl rollout status deployment/backend -n niyanta

# Port forward for local access
kubectl port-forward -n niyanta svc/backend 8000:8000

# View logs
kubectl logs -f deployment/backend -n niyanta

# Scale workers
kubectl scale deployment/worker --replicas=5 -n niyanta
```

**Auto-Scaling:** Configured automatically (3-10 workers based on load)

---

### Option 3: Hybrid (Docker + Native) 🔧 ADVANCED

Mix Docker (Redis, RabbitMQ) with native Neo4j installation.

**Setup:**
```bash
cd backend
bash setup_hybrid.sh
```

**Best for:** Complex development setups, native database requirements

---

## 📊 Verification & Testing

### Health Check
```bash
# API Health
curl http://localhost:8000/health

# Expected Response:
# {
#   "status": "healthy",
#   "services": {
#     "redis": true,
#     "chromadb": true,
#     "neo4j": true,
#     "rabbitmq": true
#   }
# }
```

### View Service Status
```bash
# Docker
docker-compose ps

# Kubernetes
kubectl get pods -n niyanta
kubectl get svc -n niyanta
```

### Access All Services
```bash
# View all endpoints
curl http://localhost:8000/

# Get cache statistics  
curl http://localhost:8000/cache/stats

# List cached queries
curl http://localhost:8000/cache/keys
```

### Test Query Submission
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the main components?"}'
```

### Monitor Performance
```
Grafana Dashboard:    http://localhost:3000
Prometheus Metrics:   http://localhost:9090
RabbitMQ Queue UI:    http://localhost:15672 (guest/guest)
LogViewer:            http://localhost:3100 (Loki)
```

---

## 🔧 Common Operations

### View Logs

**Docker:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker-1

# Last 100 lines
docker-compose logs --tail=100 backend
```

**Kubernetes:**
```bash
# All backend pods
kubectl logs -f deployment/backend -n niyanta

# Specific pod
kubectl logs -f pod/backend-xyz123 -n niyanta

# Stream logs from all workers
kubectl logs -f deployment/worker -n niyanta
```

### Scale Workers

**Docker:**
```bash
# Scale to 5 workers
docker-compose up -d --scale worker=5

# View current workers
docker-compose ps | grep worker
```

**Kubernetes:**
```bash
# Scale to 5 workers (manual)
kubectl scale deployment/worker --replicas=5 -n niyanta

# Check HPA status (auto-scaling)
kubectl get hpa -n niyanta
kubectl describe hpa worker -n niyanta
```

### Database Operations

**Redis (Cache):**
```bash
# Connect to Redis
docker exec niyanta_redis redis-cli

# Check size
> INFO memory

# Flush cache
> FLUSHALL
```

**Neo4j (Graph):**
```bash
# Browser: http://localhost:7474
# Default: neo4j/neo4j (change password!)

# Or via bolt:
cypher-shell -u neo4j -p password
```

### Clear Data

**Clear Cache:**
```bash
curl -X POST http://localhost:8000/cache/clear
```

**Reset Everything:**
```bash
# Docker
docker-compose down -v  # -v removes volumes

# Kubernetes
kubectl delete namespace niyanta  # Or specific resources
```

---

## 🐛 Troubleshooting

### Services Not Starting

**Problem:** Containers keep restarting  
**Solution:** Check logs and resource constraints
```bash
docker-compose logs backend  # Check error messages
docker system df              # Check disk space
free -h                       # Check memory
```

### Connections Failing

**Problem:** "Connection refused" errors  
**Solution:** Wait for all services, check ports
```bash
# Wait longer (containers take 30-60 seconds)
sleep 30 && docker-compose ps

# Check ports in use
lsof -i :8000
lsof -i :6379
lsof -i :5672

# Free up ports if needed
sudo lsof -ti:8000 | xargs kill -9
```

### API Requests Timing Out

**Problem:** `curl` hangs or times out  
**Solution:** Add timeout, check backend logs
```bash
# Add timeout
curl --max-time 5 http://localhost:8000/health

# Check backend logs
docker-compose logs --tail=50 backend

# Verify backend is running
docker-compose ps | grep backend
```

### Race Conditions / Lost Updates

**Problem:** Stats seem to lose values under load  
**Solution:** Already fixed! Verify atomic operations
```bash
# Test with load
for i in {1..100}; do
  curl http://localhost:8000/cache/stats > /dev/null &
done
wait

# Check stats - should all count correctly
curl http://localhost:8000/cache/stats
```

### Workers Not Processing

**Problem:** Tasks queue up but don't execute  
**Solution:** Check RabbitMQ and worker health
```bash
# Check RabbitMQ UI
# http://localhost:15672 (guest/guest)
# Look for: Ready jobs, Unacked jobs

# Check worker logs
docker-compose logs worker

# Verify workers are running
docker-compose ps | grep worker
```

### Out of Memory

**Problem:** Services crash with OOM error  
**Solution:** Increase allocations
```bash
# Docker limits
# Edit docker-compose.yml, add memory limits under "deploy":
# deploy:
#   resources:
#     limits:
#       memory: 2G

# Restart with new limits
docker-compose up -d
```

---

## 📚 Documentation Structure

All documentation is organized in the `docs/` folder:

```
docs/
├── AGENTIC_ARCHITECTURE.md          # System design details
├── BACKEND.md                       # Backend API documentation
├── DEPLOYMENT.md                    # Deployment guide
│
├── architecture/                    # System design docs
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── FRONTEND_IMPLEMENTATION_SUMMARY.md
│   └── ADMIN_MONITORING_SUMMARY.md
│
├── deployment/                      # How to deploy
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── DOCKER_ORGANIZATION.md
│   ├── SYSTEM_STARTUP_REPORT.md
│   └── SERVICES_RUNNING.md
│
├── guides/                          # How-to guides
│   ├── QUICK_REFERENCE.md
│   ├── MULTI_USER_GUIDE.md
│   └── SESSION_SUMMARY.md
│
└── troubleshooting/                 # Problem solving
    ├── RACE_CONDITIONS_ANALYSIS.md
    ├── RACE_CONDITIONS_FIXES.md
    ├── RACE_CONDITION_VISUAL_GUIDE.md
    └── RACE_CONDITIONS_IMPLEMENTATION_COMPLETE.md
```

**Where to go for:**
- **"How do I deploy to production?"** → `docs/deployment/DEPLOYMENT_CHECKLIST.md`
- **"How does the system work?"** → `docs/AGENTIC_ARCHITECTURE.md`
- **"I have multiple users"** → `docs/guides/MULTI_USER_GUIDE.md`
- **"Something's broken"** → `docs/troubleshooting/`
- **"What are common commands?"** → `docs/guides/QUICK_REFERENCE.md`

---

## 🎯 Next Steps

### After First Setup
1. ✅ Verify all services are running (`docker-compose ps`)
2. ✅ Check API health (`curl http://localhost:8000/health`)
3. ✅ Access frontend (`http://localhost:3000`)
4. ✅ Read [QUICK_REFERENCE.md](docs/guides/QUICK_REFERENCE.md)

### For Development
1. Create `.env` from template
2. Add your API keys
3. Run `docker-compose up -d`
4. Start modifying code
5. Services auto-reload

### For Production
1. Read [DEPLOYMENT_CHECKLIST.md](docs/deployment/DEPLOYMENT_CHECKLIST.md)
2. Choose deployment: **Docker** (simple) or **Kubernetes** (scalable)
3. Configure environment variables
4. Set up monitoring (Prometheus/Grafana)
5. Configure backups (Redis, Neo4j)
6. Enable SSL/TLS
7. Set up CI/CD pipeline

### Understanding the System
1. **Architecture**: Read [AGENTIC_ARCHITECTURE.md](docs/AGENTIC_ARCHITECTURE.md)
2. **Frontend**: Read [FRONTEND_IMPLEMENTATION_SUMMARY.md](docs/architecture/FRONTEND_IMPLEMENTATION_SUMMARY.md)
3. **Backend**: Read [BACKEND.md](docs/BACKEND.md)
4. **Multi-user**: Read [MULTI_USER_GUIDE.md](docs/guides/MULTI_USER_GUIDE.md)

### Production Deployment
```bash
# For Docker (simple)
./docker/scripts/deploy.sh

# For Kubernetes (enterprise)
kubectl apply -f k8s/
kubectl get pods -n niyanta -w
```

---

## 🌟 Key Features

### ✅ **Agentic RAG**
- LangGraph planning for intelligent queries
- Multi-step reasoning with feedback loops
- Automatic replanning if results unsatisfactory

### ✅ **Distributed Architecture**
- Scalable workers via RabbitMQ
- Horizontal scaling (3-10 workers in K8s)
- Load balanced task distribution

### ✅ **High Performance**
- Semantic caching (45-60% hit rate)
- Redis for fast lookups
- Neo4j for graph relationships
- ChromaDB for vector embeddings

### ✅ **Reliability**
- Race condition fixes (atomic operations)
- Connection pooling (50 Redis, 100 Neo4j)
- Health checks for all services
- Automatic service recovery

### ✅ **Observability**
- Prometheus metrics
- Grafana dashboards
- Loki log aggregation
- Request/error tracking

### ✅ **Production Ready**
- Docker & Kubernetes support
- Multi-environment configs (dev/staging/prod)
- Security best practices
- Monitoring & alerting

---

## 📞 Quick Reference Commands

```bash
# Start/Stop
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View logs in real-time

# Status
docker-compose ps              # View service status
curl http://localhost:8000/health  # Backend health

# Database
curl http://localhost:8000/cache/stats    # Cache stats
curl http://localhost:8000/cache/keys     # Cached queries
curl -X POST http://localhost:8000/cache/clear  # Clear cache

# Scale
docker-compose up -d --scale worker=5   # Scale to 5 workers
kubectl scale deployment/worker --replicas=5  # K8s scaling

# Logs
docker-compose logs backend    # Backend logs
docker logs niyanta_redis      # Redis logs
kubectl logs deployment/backend -n niyanta  # K8s logs

# Cleanup
docker-compose down -v         # Stop + remove volumes
docker system prune            # Clean up everything
```

---

## 🎓 Learning Path

1. **Beginner**: Start with 5-Minute Setup → Access frontend/backend
2. **Intermediate**: Read QUICK_REFERENCE → Understand components
3. **Advanced**: Read AGENTIC_ARCHITECTURE → Deploy to Kubernetes
4. **Expert**: Contribute to codebase → Optimize for your needs

---

## ❓ FAQ

**Q: Do I need Kubernetes?**  
A: No! Start with Docker Compose. Use Kubernetes only for production at scale.

**Q: What's the minimum hardware?**  
A: 4GB RAM, 10GB disk. More = better performance.

**Q: Can I run on macOS/Windows?**  
A: Yes! Use Docker Desktop (includes everything).

**Q: How do I add my own data?**  
A: Use the data ingestion endpoints in the API. See `docs/BACKEND.md`.

**Q: Is there a UI for admin tasks?**  
A: Yes! Grafana, RabbitMQ UI, Neo4j Browser all available.

**Q: How do I deploy to production?**  
A: Read `docs/deployment/DEPLOYMENT_CHECKLIST.md` then choose Docker or Kubernetes.

---

## 📞 Support

**Having issues?**
1. Check [Troubleshooting](#-troubleshooting) section above
2. Review relevant docs in `docs/` folder
3. Check logs: `docker-compose logs -f`
4. Verify prerequisites: Docker 20.10+, Node 16+

---

**Version:** 1.0  
**Updated:** April 7, 2026  
**Status:** ✅ Production Ready

**Happy deploying!** 🚀
