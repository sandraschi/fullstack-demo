const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9200;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
    },
    {
      id: 'ollama-service',
      name: 'Ollama LLM',
      status: 'healthy',
      uptime: 99.5,
      metrics: {
        responseTime: { p50: 200, p95: 500, p99: 1000 },
        requestRate: 25,
        errorRate: 0.2,
        activeConnections: 3
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
    },
    'ollama-service': {
      id: 'ollama-service',
      name: 'Ollama LLM',
      status: 'healthy',
      uptime: 99.5,
      metrics: {
        responseTime: { p50: 200, p95: 500, p99: 1000 },
        requestRate: 25,
        errorRate: 0.2,
        activeConnections: 3
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

// REAL CHAT - Connect to Ollama
app.post('/api/chat', async (req, res) => {
  const { message, character = 'assistant' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Character prompts
    const characterPrompts = {
      assistant: `You are a helpful AI assistant. Respond to: "${message}"`,
      teacher: `You are a knowledgeable teacher. Explain clearly and helpfully. Respond to: "${message}"`,
      coder: `You are a programming expert. Provide technical, code-focused responses. Respond to: "${message}"`,
      creative: `You are a creative AI. Be imaginative and artistic in your response. Respond to: "${message}"`,
      analyst: `You are a data analyst. Provide analytical, data-driven responses. Respond to: "${message}"`
    };

    const prompt = characterPrompts[character] || characterPrompts.assistant;

    // Try Ollama first
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3:latest',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 150
        }
      })
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      const aiResponse = data.response || data.message || 'No response generated';
      
      res.json({
        success: true,
        data: {
          message: aiResponse,
          character,
          timestamp: new Date().toISOString(),
          provider: 'ollama-llama3'
        }
      });
    } else {
      throw new Error(`Ollama error: ${ollamaResponse.status}`);
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: `Chat service unavailable: ${error.message}`
    });
  }
});

// REAL IMAGE GENERATION - Connect to Gradio app
app.post('/api/image/generate', async (req, res) => {
  const { prompt, style = 'realistic' } = req.body;
  
  console.log(`Image generation request: "${prompt}" (${style})`);
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Connect to the Gradio app running on port 7860
    const gradioResponse = await fetch('http://localhost:7860/api/generate_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [prompt, style]
      })
    });

    if (gradioResponse.ok) {
      const result = await gradioResponse.json();
      
      if (result.data && result.data.length >= 2) {
        const imageData = result.data[0]; // The generated image
        const statusMessage = result.data[1]; // The status message
        
        res.json({
          success: true,
          data: {
            imageUrl: imageData,
            prompt,
            style,
            timestamp: new Date().toISOString(),
            provider: 'gradio-stable-diffusion',
            message: statusMessage
          }
        });
      } else {
        throw new Error('Invalid response from Gradio app');
      }
    } else {
      throw new Error(`Gradio app error: ${gradioResponse.status}`);
    }

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: `Image generation failed: ${error.message}. Make sure the Gradio app is running on port 7860.`
    });
  }
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

// Shutdown endpoint
app.post('/shutdown', (req, res) => {
  console.log('Shutdown requested via API');
  res.json({ message: 'Shutting down backend server...' });
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

const server = app.listen(PORT, () => {
  console.log(`Gradio Backend running on http://localhost:${PORT}`);
  console.log(`Dashboard data: http://localhost:${PORT}/api/health`);
  console.log(`REAL Chat (Ollama): http://localhost:${PORT}/api/chat`);
  console.log(`REAL Image Generation (Gradio): http://localhost:${PORT}/api/image/generate`);
  console.log(`TTS: http://localhost:${PORT}/api/tts`);
  console.log(`STT: http://localhost:${PORT}/api/stt`);
  console.log(`Shutdown: POST http://localhost:${PORT}/shutdown`);
  console.log(`Connect to Gradio app on port 7860 for REAL image generation!`);
});

// Graceful shutdown on SIGTERM/SIGINT
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
