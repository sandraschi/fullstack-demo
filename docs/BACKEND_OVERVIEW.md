# Backend Architecture Overview

**Version:** 1.0  
**Date:** 2025-10-06  
**Status:** Design Complete

## Executive Summary

The fullstack-demo backend provides **real microservices** that the dashboard monitors, plus AI-powered features for chat, image generation, and voice processing.

### Key Architecture Decisions

1. **Hybrid Tech Stack:** Node.js/TypeScript for APIs, Python for AI services
2. **Local-First LLMs:** Primary use of LM Studio/Ollama, cloud fallback
3. **Service Independence:** Each service is self-contained with health endpoints
4. **Clean Code:** Same 200-line limits as frontend
5. **No Database Required:** MVP uses in-memory + file storage

## Service Overview

| Service | Tech | Port | Purpose |
|---------|------|------|---------|
| API Gateway | Node.js/TS | 3000 | Routing, auth, aggregation |
| Chat Service | Node.js/TS | 3001 | LLM chat with characters |
| Image Service | Python/Gradio | 7860 | Text/image-to-image gen |
| TTS/STT Service | Python/FastAPI | 3002 | Voice synthesis/recognition |
| Database | PostgreSQL | 5432 | Connection pool monitoring |
| Cache | Redis | 6379 | Hit/miss ratio monitoring |

## Architecture Diagram

```
Frontend Dashboard (React)
         ↓
API Gateway (Express)
    ↓    ↓    ↓    ↓
    │    │    │    └─→ TTS/STT Service (FastAPI)
    │    │    └──────→ Image Service (Gradio)
    │    └───────────→ Chat Service (Express)
    └────────────────→ Database/Cache (Monitoring)
                      
Each service exposes:
- GET /api/health
- GET /api/metrics
```

## Core Principles

### 1. Provider Abstraction

All external dependencies abstracted:
```typescript
interface LLMProvider {
  chat(messages, options): Promise<Response>;
  stream(messages, options): AsyncIterator<string>;
  healthCheck(): Promise<boolean>;
}
```

Implementations:
- `LocalLLMProvider` - LM Studio/Ollama
- `OpenAIProvider` - GPT models
- `AnthropicProvider` - Claude models

### 2. Health-First Design

Every service must expose:
```json
GET /api/health
{
  "status": "healthy" | "degraded" | "down",
  "uptime": 99.97,
  "metrics": {
    "responseTime": { "p50": 45, "p95": 120, "p99": 250 },
    "requestRate": 1250,
    "errorRate": 0.03
  }
}
```

### 3. File Size Discipline

Backend follows same limits as frontend:
- API routes: 150 lines max
- Service classes: 200 lines max
- Middleware: 100 lines max

### 4. Configuration Over Code

All behavior configurable via `.env`:
```env
LLM_PROVIDER=local          # or openai, anthropic
LM_STUDIO_URL=http://localhost:1234/v1
FALLBACK_PROVIDER=openai
IMAGE_MODEL=stable-diffusion-v1-5
TTS_PROVIDER=local
```

## Tech Stack Rationale

### Why Node.js/TypeScript for APIs?
- ✅ Shared types with frontend
- ✅ TypeScript strict mode
- ✅ Fast for I/O-bound work
- ✅ Great async/streaming support
- ✅ Same language as frontend team

### Why Python for AI Services?
- ✅ Superior ML/AI ecosystem
- ✅ Gradio built-in support
- ✅ HuggingFace integration
- ✅ Stable Diffusion libraries
- ✅ Whisper/TTS libraries mature

### Why Hybrid Approach?
Best of both worlds - use the right tool for each job.

## LLM Strategy

### Local-First Approach

**Primary:** LM Studio or Ollama
- Zero API costs
- Unlimited requests  
- Private data stays local
- Good for 80% of tasks

**Fallback:** Cloud APIs
- Complex reasoning
- Long context windows
- Specialized models
- Redundancy

### Configuration Example

```json
{
  "llm": {
    "primary": {
      "provider": "lmstudio",
      "url": "http://localhost:1234/v1",
      "model": "llama-3.1-8b",
      "maxTokens": 4096
    },
    "fallback": {
      "provider": "openai",
      "apiKey": "sk-...",
      "model": "gpt-4o-mini",
      "maxTokens": 16000
    },
    "fallbackConditions": [
      "primary_unavailable",
      "primary_timeout > 10s",
      "context_length > 4096"
    ]
  }
}
```

## Development Workflow

### Option 1: Docker Compose (Recommended)

```powershell
Set-Location "D:\Dev\repos\fullstack-demo-backend"
docker-compose up -d
```

All services start automatically with networking configured.

### Option 2: Individual Services

```powershell
# Terminal 1
Set-Location packages/api-gateway
npm run dev

# Terminal 2  
Set-Location packages/chat-service
npm run dev

# Terminal 3
Set-Location packages/image-service
python app.py

# Terminal 4
Set-Location packages/tts-stt-service
uvicorn main:app --reload
```

## Security Model

### MVP: Simple API Keys
```typescript
X-API-Key: dev-key-123
```

### Production: JWT Tokens
```typescript
Authorization: Bearer <jwt-token>
```

### Rate Limiting
- 100 requests/minute per IP
- 1000 requests/hour per API key
- Burst allowance: 10 requests

### Input Validation
- All inputs validated with Zod/Pydantic
- File size limits enforced
- Content type verification

## Performance Targets

| Metric | Target | Service |
|--------|--------|---------|
| API response | < 50ms p95 | Gateway |
| First token | < 500ms | Chat |
| Image gen | < 30s | Image Service |
| TTS/STT | < 5s | Voice Service |
| Uptime | > 99.9% | All services |

## Deployment Strategy

### Development
- Run locally on Windows server
- LM Studio for local LLM
- No containers needed

### Staging
- Docker Compose
- All services containerized
- Shared network

### Production
- API Gateway: Railway/Render
- Chat Service: Railway/Render  
- Image Service: RunPod (GPU)
- TTS/STT: Standard cloud

## Monitoring

### Metrics Collection
Each service exposes `/api/metrics`:
```json
{
  "requestCount": 1250,
  "errorCount": 3,
  "avgResponseTime": 45,
  "p95ResponseTime": 120,
  "p99ResponseTime": 250,
  "activeConnections": 15
}
```

Dashboard polls every 30 seconds.

### Logging
Structured JSON logs:
```json
{
  "timestamp": "2025-10-06T19:00:00Z",
  "level": "INFO",
  "service": "chat-service",
  "requestId": "req-123",
  "duration": 450,
  "tokens": 150
}
```

## Cost Optimization

### Local LLM Usage
- 90%+ requests use local
- Zero API costs
- Better privacy
- Faster for simple tasks

### Cloud LLM Usage
- 10% requests (complex only)
- Estimated cost: $10-20/month
- Set monthly budget limits
- Alert at 80% usage

## MVP Timeline

**Week 1: Core Services**
- Days 1-2: API Gateway + health monitoring
- Days 3-4: Chat service (local LLM)
- Day 5: Dashboard integration

**Week 2: AI Features**
- Days 6-7: Image service (Gradio + SD)
- Days 8-9: TTS/STT service
- Day 10: Testing + documentation

## Related Documentation

- `BACKEND_API.md` - Complete API specification
- `CHAT_SERVICE.md` - Chat service details
- `IMAGE_SERVICE.md` - Image generation details
- `TTS_STT_SERVICE.md` - Voice service details
- `DEPLOYMENT.md` - Deployment guide

## Next Steps

1. Read service-specific documentation
2. Setup project structure
3. Implement API Gateway
4. Implement Chat Service
5. Integrate with frontend
