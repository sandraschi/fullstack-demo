// TTS/STT Service - Main application entry point

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { createLogger, logRequest } from '../../shared/src/utils/logger'
import { createHealthMonitor, createHealthEndpoint } from '../../shared/src/utils/health'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { ttsRoutes } from './routes/tts'
import { sttRoutes } from './routes/stt'
import { voiceRoutes } from './routes/voices'
import { audioRoutes } from './routes/audio'
import { whisperClient } from './whisper/client'
import { coquiClient } from './coqui/client'
import { voiceManager } from './voices/manager'
import { audioProcessor } from './audio/processor'

// Load environment variables
dotenv.config()

const app = express()
const logger = createLogger('tts-stt-service')
const port = process.env.PORT || 9203

// Health monitor
const healthMonitor = createHealthMonitor({
  serviceId: 'tts-stt-service',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  dependencies: [
    {
      name: 'whisper-stt',
      check: async () => await whisperClient.isAvailable(),
      timeout: 10000,
    },
    {
      name: 'coqui-tts',
      check: async () => await coquiClient.isAvailable(),
      timeout: 10000,
    },
    {
      name: 'audio-processor',
      check: async () => {
        // Test audio processor with mock data
        const testBuffer = Buffer.from('test')
        const validation = await audioProcessor.validateAudio(testBuffer)
        return validation.isValid
      },
      timeout: 5000,
    },
  ],
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' })) // Larger limit for audio data
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Request logging
app.use(logRequest('tts-stt-service'))

// Rate limiting
app.use(rateLimiter)

// Health check endpoint
app.get('/health', createHealthEndpoint(healthMonitor))

// API routes
app.use('/api/tts', ttsRoutes)
app.use('/api/stt', sttRoutes)
app.use('/api/voices', voiceRoutes)
app.use('/api/audio', audioRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'TTS/STT Service',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: {
        tts: '/api/tts',
        stt: '/api/stt',
        voices: '/api/voices',
        audio: '/api/audio',
      },
    },
    features: {
      whisperSTT: process.env.WHISPER_URL || 'http://localhost:8000',
      coquiTTS: process.env.COQUI_TTS_URL || 'http://localhost:8001',
      voices: voiceManager.getAllVoices().length,
      languages: voiceManager.getAllLanguages().length,
      audioProcessing: 'enabled',
    },
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  })
})

// Error handling
app.use(errorHandler)

// Start server
const server = app.listen(port, () => {
  logger.info(`TTS/STT Service started on port ${port}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  logger.info(`Whisper STT URL: ${process.env.WHISPER_URL || 'http://localhost:8000'}`)
  logger.info(`Coqui TTS URL: ${process.env.COQUI_TTS_URL || 'http://localhost:8001'}`)
  
  // Log available voices and languages
  logger.info('Available Voices', { 
    count: voiceManager.getAllVoices().length,
    languages: voiceManager.getAllLanguages().length,
  })
  
  // Log voice stats
  logger.info('Voice Statistics', { 
    stats: voiceManager.getVoiceStats() 
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

export { app, healthMonitor }


