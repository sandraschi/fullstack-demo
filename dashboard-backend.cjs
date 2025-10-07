const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9200;

app.use(cors());
app.use(express.json());

// Dashboard health data
app.get('/api/health', (req, res) => {
  const services = [
    {
      id: 'api-gateway',
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.9,
      metrics: {
        responseTime: { p50: 25, p95: 45, p99: 80 },
        requestRate: 450,
        errorRate: 0.05,
        activeConnections: 25
      }
    },
    {
      id: 'chat-service',
      name: 'Chat Service',
      status: 'healthy',
      uptime: 99.8,
      metrics: {
        responseTime: { p50: 45, p95: 120, p99: 250 },
        requestRate: 125,
        errorRate: 0.1,
        activeConnections: 15
      }
    },
    {
      id: 'image-service',
      name: 'Image Service',
      status: 'healthy',
      uptime: 98.5,
      metrics: {
        responseTime: { p50: 120, p95: 300, p99: 600 },
        requestRate: 45,
        errorRate: 0.3,
        activeConnections: 8
      }
    },
    {
      id: 'tts-stt-service',
      name: 'TTS/STT Service',
      status: 'healthy',
      uptime: 97.2,
      metrics: {
        responseTime: { p50: 85, p95: 200, p99: 400 },
        requestRate: 78,
        errorRate: 1.2,
        activeConnections: 12
      }
    }
  ];
  
  res.json({ success: true, data: services });
});

// Individual service health
app.get('/api/health/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const serviceData = {
    'api-gateway': {
      id: 'api-gateway',
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.9,
      metrics: {
        responseTime: { p50: 25, p95: 45, p99: 80 },
        requestRate: 450,
        errorRate: 0.05,
        activeConnections: 25
      }
    },
    'chat-service': {
      id: 'chat-service',
      name: 'Chat Service',
      status: 'healthy',
      uptime: 99.8,
      metrics: {
        responseTime: { p50: 45, p95: 120, p99: 250 },
        requestRate: 125,
        errorRate: 0.1,
        activeConnections: 15
      }
    },
    'image-service': {
      id: 'image-service',
      name: 'Image Service',
      status: 'healthy',
      uptime: 98.5,
      metrics: {
        responseTime: { p50: 120, p95: 300, p99: 600 },
        requestRate: 45,
        errorRate: 0.3,
        activeConnections: 8
      }
    },
    'tts-stt-service': {
      id: 'tts-stt-service',
      name: 'TTS/STT Service',
      status: 'healthy',
      uptime: 97.2,
      metrics: {
        responseTime: { p50: 85, p95: 200, p99: 400 },
        requestRate: 78,
        errorRate: 1.2,
        activeConnections: 12
      }
    }
  };
  
  const service = serviceData[serviceId];
  if (service) {
    res.json({ success: true, data: service });
  } else {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
  }
});

// Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message, character = 'assistant' } = req.body;
  
  const responses = {
    assistant: `Hello! I'm your AI assistant. You said: "${message}". How can I help you today?`,
    teacher: `As your teacher, let me explain: "${message}" is an interesting topic. Here's what you should know...`,
    coder: `From a coding perspective, "${message}" reminds me of debugging. Let's break this down step by step.`,
    creative: `What an inspiring idea! "${message}" - this could be the start of something amazing!`,
    analyst: `Analyzing "${message}" - the data suggests we should consider multiple factors here.`
  };
  
  res.json({
    success: true,
    data: {
      message: responses[character] || responses.assistant,
      character,
      timestamp: new Date().toISOString()
    }
  });
});

// Image generation endpoint
app.post('/api/image/generate', (req, res) => {
  const { prompt, style = 'realistic' } = req.body;
  
  // Create a simple SVG placeholder
  const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#f0f0f0"/>
    <text x="256" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
      ${prompt}
    </text>
    <text x="256" y="250" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
      Style: ${style}
    </text>
    <text x="256" y="300" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
      Image Generation Service
    </text>
  </svg>`;
  
  res.json({
    success: true,
    data: {
      imageUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      prompt,
      style,
      timestamp: new Date().toISOString(),
      provider: 'placeholder'
    }
  });
});

// TTS endpoint
app.post('/api/tts', (req, res) => {
  const { text, voice = 'default' } = req.body;
  
  res.json({
    success: true,
    data: {
      message: `TTS would convert: "${text}" to speech using voice: ${voice}`,
      text,
      voice,
      timestamp: new Date().toISOString()
    }
  });
});

// STT endpoint
app.post('/api/stt', (req, res) => {
  res.json({
    success: true,
    data: {
      text: "This is a sample transcription from the STT service",
      timestamp: new Date().toISOString()
    }
  });
});

// Characters endpoint
app.get('/api/characters', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'assistant', name: 'Assistant', description: 'Helpful and friendly AI assistant' },
      { id: 'teacher', name: 'Teacher', description: 'Educational and explanatory' },
      { id: 'coder', name: 'Coder', description: 'Technical and programming-focused' },
      { id: 'creative', name: 'Creative', description: 'Artistic and imaginative' },
      { id: 'analyst', name: 'Analyst', description: 'Data-driven and analytical' }
    ]
  });
});

// Voices endpoint
app.get('/api/voices', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'en-US-Standard-A', name: 'Standard US English A', language: 'en-US', gender: 'male' },
      { id: 'en-US-Standard-B', name: 'Standard US English B', language: 'en-US', gender: 'female' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard data: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log(`🎨 Image: http://localhost:${PORT}/api/image/generate`);
  console.log(`🔊 TTS: http://localhost:${PORT}/api/tts`);
  console.log(`🎤 STT: http://localhost:${PORT}/api/stt`);
});
