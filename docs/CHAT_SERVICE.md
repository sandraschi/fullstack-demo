# Chat Service - Quick Reference

**Port:** 3001 | **Tech:** Node.js/TypeScript | **Purpose:** LLM chat with characters

## 5 Characters with Preprompts

1. **Assistant** 👨‍💼 - Professional, concise (default)
2. **Teacher** 👩‍🏫 - Explanatory, uses examples  
3. **Coder** 👨‍💻 - Technical, best practices
4. **Creative** 🎨 - Imaginative, storytelling
5. **Analyst** 📊 - Data-driven, logical

## Key Endpoints

```typescript
POST /api/chat
{
  "message": "What is TypeScript?",
  "conversationId": "conv-123",
  "character": "teacher",
  "stream": true
}

GET /api/chat/characters        // List all characters
GET /api/chat/history/:id       // Get conversation
DELETE /api/chat/history/:id    // Clear conversation
GET /api/health                 // Service status
```

## LLM Provider Strategy

**Primary:** Local (LM Studio/Ollama)
- `http://localhost:1234/v1` (LM Studio)
- `http://localhost:11434` (Ollama)

**Fallback:** Cloud (OpenAI/Anthropic)
- Used when local unavailable
- Or context > 4096 tokens

## Configuration

```env
PORT=3001
LLM_PROVIDER=local
LM_STUDIO_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=llama-3.1-8b
OPENAI_API_KEY=sk-...
MAX_HISTORY=20
MAX_TOKENS=4096
```

## Implementation Pattern

```typescript
// Provider abstraction
interface LLMProvider {
  chat(messages: Message[]): Promise<Response>;
  stream(messages: Message[]): AsyncIterator<string>;
}

// Character preprompt
const CHARACTERS = {
  teacher: {
    system: "You are an expert teacher. Explain clearly with examples."
  }
};

// Route handler (< 150 lines)
router.post('/chat', async (req, res) => {
  const { message, character } = req.body;
  const provider = getProvider(); // local or fallback
  const systemPrompt = CHARACTERS[character].system;
  // ... handle chat
});
```

## Features

- ✅ Streaming responses (SSE)
- ✅ Conversation history (in-memory)
- ✅ Token counting
- ✅ Auto-fallback to cloud
- ✅ Rate limiting (100 req/min)

## Performance Targets

- First token: < 500ms
- Streaming: < 100ms per token
- Concurrent chats: > 50

## Next: See CHAT_SERVICE_IMPL.md for detailed implementation
