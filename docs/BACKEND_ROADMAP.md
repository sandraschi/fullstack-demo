# Backend Implementation Roadmap

**Timeline:** 2 weeks  
**Approach:** Incremental, service-by-service

## Week 1: Core Infrastructure

### Days 1-2: Project Setup + API Gateway
**Goal:** Working API gateway with health monitoring

```powershell
# Create backend repo
New-Item -ItemType Directory "D:\Dev\repos\fullstack-demo-backend"
Set-Location "D:\Dev\repos\fullstack-demo-backend"

# Initialize monorepo structure
npm init -y
npm install -D typescript @types/node tsx
npx tsc --init

# Create packages
New-Item -ItemType Directory "packages/api-gateway"
New-Item -ItemType Directory "packages/chat-service"
New-Item -ItemType Directory "packages/shared"
```

**Deliverable:**
- API gateway running on port 3000
- Health endpoints for all services
- Basic routing and error handling

### Days 3-4: Chat Service (Local LLM)
**Goal:** Working chat with local LLM only

**Tasks:**
1. Setup Express/TypeScript project
2. Implement LM Studio provider
3. Create 5 character preprompts
4. Streaming responses (SSE)
5. In-memory conversation history

**Deliverable:**
- Chat endpoint working with LM Studio
- All 5 characters functional
- Streaming responses work
- History persistence (in-memory)

### Day 5: Frontend Integration
**Goal:** Dashboard displays chat service status

**Tasks:**
1. Update dashboard to call real API
2. Add chat service card to dashboard
3. Show real metrics (response time, request count)
4. Test end-to-end flow

**Deliverable:**
- Dashboard shows real chat service metrics
- Manual testing of chat feature works

## Week 2: AI Services

### Days 6-7: Image Generation Service
**Goal:** Working Gradio interface for image generation

**Tasks:**
1. Setup Python project structure
2. Install Stable Diffusion dependencies
3. Create Gradio interface with all controls
4. Implement 5 style templates
5. Add health/metrics endpoints

**Deliverable:**
- Gradio UI accessible at port 7860
- Text-to-image works with all styles
- Dashboard shows image service metrics

### Days 8-9: TTS/STT Service
**Goal:** Basic voice synthesis and recognition

**Tasks:**
1. Setup FastAPI project
2. Integrate Whisper for STT
3. Integrate Coqui TTS
4. Create simple endpoints
5. Add 3-4 voice options

**Deliverable:**
- TTS endpoint generates speech
- STT endpoint transcribes audio
- Dashboard shows TTS/STT service metrics

### Day 10: Polish & Documentation
**Goal:** Production-ready MVP

**Tasks:**
1. Add error boundaries
2. Implement rate limiting
3. Add request logging
4. Write deployment docs
5. Create demo video/screenshots

**Deliverable:**
- All services stable
- Documentation complete
- Ready for demo

## Implementation Order Rationale

1. **API Gateway first** - Central routing, establishes patterns
2. **Chat service second** - Core feature, tests LLM integration
3. **Frontend integration** - Validate architecture early
4. **Image service** - Independent, can develop in parallel
5. **TTS/STT service** - Simplest AI service, quick win
6. **Polish** - Final touches and docs

## Success Criteria (Each Phase)

- ✅ Service runs without errors
- ✅ All files < 200 lines (backend limit)
- ✅ Health endpoint returns valid data
- ✅ Dashboard displays service correctly
- ✅ Manual testing passes

## Risk Mitigation

**Risk:** LM Studio not working  
**Mitigation:** Test LM Studio setup on Day 1, have cloud fallback ready

**Risk:** Stable Diffusion GPU requirements  
**Mitigation:** Start with CPU version, optimize later

**Risk:** Scope creep  
**Mitigation:** Stick to MVP features, document future enhancements

## Daily Checklist

- [ ] Write code < 200 lines per file
- [ ] Add health endpoint
- [ ] Test manually
- [ ] Update dashboard if needed
- [ ] Commit working code
- [ ] Write progress note in basic memory

## File Structure (Final)

```
fullstack-demo-backend/
├── packages/
│   ├── api-gateway/         # Express/TS
│   ├── chat-service/        # Express/TS
│   ├── image-service/       # Python/Gradio
│   ├── tts-stt-service/     # Python/FastAPI
│   └── shared/              # Common types/utils
├── docker-compose.yml
└── README.md
```

## Next Steps

1. Read BACKEND_OVERVIEW.md
2. Setup project structure (Day 1)
3. Start with API Gateway
4. Proceed service-by-service
