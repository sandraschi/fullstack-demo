// Chat Service - Main application entry point

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { createLogger, logRequest } from '../../shared/src/utils/logger'
import { createHealthMonitor, createHealthEndpoint } from '../../shared/src/utils/health'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { chatRoutes } from './routes/chat'
import { characterRoutes } from './routes/characters'
import { historyRoutes } from './routes/history'
import { llmManager } from './llm/manager'
import { characterManager } from './characters/characters'
import { conversationStorage } from './history/storage'

// Load environment variables
dotenv.config()

const app = express()
const logger = createLogger('chat-service')
const port = process.env.PORT || 9201

// Health monitor
const healthMonitor = createHealthMonitor({
  serviceId: 'chat-service',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  dependencies: [
    {
      name: 'llm-providers',
      check: async () => {
        const health = await llmManager.checkProviderHealth()
        return health.some(h => h.available)
      },
      timeout: 10000,
    },
    {
      name: 'database',
      check: async () => {
        try {
          await conversationStorage.getStats()
          return true
        } catch {
          return false
        }
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
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use(logRequest('chat-service'))

// Rate limiting
app.use(rateLimiter)

// Health check endpoint
app.get('/health', createHealthEndpoint(healthMonitor))

// API routes
app.use('/api/chat', chatRoutes)
app.use('/api/characters', characterRoutes)
app.use('/api/history', historyRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Chat Service',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: {
        chat: '/api/chat',
        characters: '/api/characters',
        history: '/api/history',
      },
    },
    features: {
      llmProviders: llmManager.getAvailableProviders(),
      characters: characterManager.getAllCharacters().length,
      storage: 'SQLite',
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
  logger.info(`Chat Service started on port ${port}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  
  // Log available providers
  llmManager.checkProviderHealth().then(health => {
    logger.info('LLM Provider Health', { providers: health })
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    conversationStorage.close()
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    conversationStorage.close()
    logger.info('Process terminated')
    process.exit(0)
  })
})

export { app, healthMonitor }
