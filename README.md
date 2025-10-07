# Fullstack Demo - AI-Powered Microservices Dashboard

A comprehensive fullstack application featuring a React dashboard with real AI services integration, including chat, image generation, TTS/STT, and more.

## 🚀 Features

### Dashboard
- **Real-time service monitoring** with health checks and metrics
- **Click-to-navigate** service cards with embedded iframes
- **Automatic cleanup** of leftover services on startup
- **Shutdown endpoints** for clean service termination
- **Responsive design** with Chakra UI

### AI Services
- **💬 Chat Service**: Ollama/LM Studio integration for local LLM chat
- **🎨 Image Generation**: Gradio app with 12+ 2025 SOTA models (FLUX.1, SD 3.5, FLUX.2)
- **🔊 TTS Service**: Windows SAPI text-to-speech
- **🎤 STT Service**: OpenAI Whisper speech-to-text
- **📊 API Gateway**: Central service management and monitoring

### Technical Stack
- **Frontend**: React 18 + TypeScript + Chakra UI + Vite
- **Backend**: Node.js + Express + Python Flask
- **AI Models**: Ollama, Stable Diffusion, Whisper, Windows SAPI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Testing**: Vitest + Testing Library

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Ollama (for LLM chat)
- LM Studio (optional, for alternative LLM)

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-demo
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Python dependencies
   pip install flask flask-cors gradio diffusers torch pillow openai-whisper pyttsx3
   ```

3. **Start services**
   ```bash
   # Option 1: Use service manager
   .\service-manager.ps1 start
   
   # Option 2: Start individually
   npm run dev                    # Frontend (port 5173)
   node gradio-backend.cjs       # Backend API (port 9200)
   python gradio-image-generator.py  # Image generation (port 7860)
   python tts-server.py          # TTS service (port 8001)
   python whisper-server.py      # STT service (port 8002)
   ```

## 🎯 Usage

### Dashboard
1. **Access**: http://localhost:5173
2. **Click service cards** to navigate to embedded interfaces
3. **Use "Shutdown All" button** to cleanly terminate all services

### Service Management
```powershell
# Start all services
.\service-manager.ps1 start

# Stop all services
.\service-manager.ps1 stop

# Check service status
.\service-manager.ps1 status

# Clean up leftover services
.\service-manager.ps1 cleanup

# Restart all services
.\service-manager.ps1 restart
```

### Individual Services
- **Chat**: http://localhost:1234 (LM Studio) or embedded in dashboard
- **Image Generation**: http://localhost:7860 (Gradio) or embedded in dashboard
- **TTS**: http://localhost:8001 (Windows SAPI)
- **STT**: http://localhost:8002 (Whisper API)
- **API Gateway**: http://localhost:9200

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/
│   ├── cards/           # Service cards
│   ├── layout/          # Dashboard layout
│   └── microservices/   # Service-specific components
├── hooks/               # Custom hooks
├── pages/               # Route pages
├── stores/              # Zustand stores
├── types/               # TypeScript types
└── lib/                 # Utilities
```

### Backend Services
- **API Gateway** (port 9200): Central API and service coordination
- **Gradio App** (port 7860): Image generation with Stable Diffusion
- **TTS Server** (port 8001): Text-to-speech using Windows SAPI
- **Whisper Server** (port 8002): Speech-to-text using OpenAI Whisper

### AI Models
- **LLM**: Ollama (llama3, codellama, etc.)
- **Image Generation**: FLUX.1, Stable Diffusion 3.5, FLUX.2, SDXL
- **TTS**: Windows SAPI (built-in voices)
- **STT**: OpenAI Whisper (base model)

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:9200
VITE_WS_URL=ws://localhost:9200
VITE_ENABLE_MOCKS=false
VITE_LOG_LEVEL=info
```

### Service Ports
- Frontend: 5173
- Backend API: 9200
- Gradio: 7860
- TTS: 8001
- Whisper: 8002
- Ollama: 11434
- LM Studio: 1234

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker (Optional)
```bash
docker-compose up -d
```

## 🛡️ Security Features

- **CORS enabled** for cross-origin requests
- **Rate limiting** on API endpoints
- **Input validation** on all endpoints
- **Error boundaries** in React components
- **Graceful shutdown** handling

## 📊 Monitoring

- **Real-time health checks** for all services
- **Performance metrics** (response time, request rate, error rate)
- **Service uptime** tracking
- **Active connections** monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**
   - Use `.\service-manager.ps1 cleanup` to kill leftover processes
   - Dashboard automatically cleans up on startup

2. **Python dependencies**
   - Ensure Python 3.10+ is installed
   - Use `pip install -r requirements.txt`

3. **Ollama not responding**
   - Start Ollama: `ollama serve`
   - Pull models: `ollama pull llama3`

4. **Image generation fails**
   - Check GPU memory availability
   - Try smaller models or CPU mode
   - Verify Gradio app is running

### Service Status
```bash
# Check all service status
.\service-manager.ps1 status

# Check individual ports
netstat -ano | findstr :9200
netstat -ano | findstr :7860
netstat -ano | findstr :8001
netstat -ano | findstr :8002
```

## 🎉 Features Completed

- ✅ React dashboard with service monitoring
- ✅ Real AI service integration (Ollama, Stable Diffusion, Whisper)
- ✅ Embedded iframe interfaces for all services
- ✅ Automatic service cleanup on startup
- ✅ Shutdown endpoints for clean termination
- ✅ Service management scripts
- ✅ TypeScript + Chakra UI frontend
- ✅ Node.js + Python backend services
- ✅ 2025 SOTA AI models (FLUX.1, SD 3.5, FLUX.2)
- ✅ TTS/STT with microphone input
- ✅ Comprehensive error handling
- ✅ Responsive design
- ✅ Production-ready architecture

---

**Built with ❤️ using modern web technologies and cutting-edge AI models.**