# Backend API Contract - OpenAPI Quick Reference

**Version:** 1.0  
**Base URL:** `http://localhost:3000/api`

## Service Ports

- **API Gateway:** 3000
- **Chat Service:** 3001  
- **Image Service:** 7860
- **TTS/STT Service:** 3002

## Common Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "User-friendly message"
  }
}
```

## Health Check (All Services)

```
GET /api/health

Response:
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

## Chat Service Endpoints

```typescript
// Send message
POST /api/chat
Body: {
  "message": string,
  "conversationId"?: string,
  "character": "assistant" | "teacher" | "coder" | "creative" | "analyst",
  "stream": boolean
}

// List characters
GET /api/chat/characters
Response: { characters: Character[] }

// Get history
GET /api/chat/history/:id
Response: { messages: Message[] }

// Clear history
DELETE /api/chat/history/:id
Response: { success: true }
```

## Image Service Endpoints

```typescript
// Generate image (via Gradio UI at port 7860)

// Health/metrics for dashboard
GET /api/health
GET /api/metrics
Response: {
  "totalGenerations": 150,
  "avgTime": 25.3,
  "queueDepth": 2
}
```

## TTS/STT Endpoints

```typescript
// Text to Speech
POST /api/tts
Body: {
  "text": string,
  "voice": string,
  "speed": number,
  "format": "wav" | "mp3"
}
Response: Audio file (binary)

// Speech to Text
POST /api/stt
Content-Type: multipart/form-data
file: Audio file
Response: { "text": string, "confidence": number }

// List voices
GET /api/tts/voices
Response: { voices: Voice[] }
```

## Authentication

### Development
```
X-API-Key: dev-key-123
```

### Production
```
Authorization: Bearer <jwt-token>
```

## Rate Limits

- **Development:** 1000 req/hour
- **Production:** 100 req/min per key

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| INVALID_INPUT | 400 | Bad request format |
| UNAUTHORIZED | 401 | Missing/invalid auth |
| RATE_LIMITED | 429 | Too many requests |
| SERVICE_UNAVAILABLE | 503 | Service down/degraded |
| INTERNAL_ERROR | 500 | Server error |

## Full OpenAPI spec: See OPENAPI.yaml
