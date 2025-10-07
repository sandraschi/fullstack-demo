// API Gateway - Main application entry point

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { createLogger, logRequest } from '@shared/utils/logger'
import { createHealthMonitor, createHealthEndpoint } from '@shared/utils/health'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { healthRoutes } from './routes/health'
import { chatRoutes } from './routes/chat'
import { imageRoutes } from './routes/image'
import { ttsRoutes } from './routes/tts'

// Load environment variables
dotenv.config()

const app = express()
const logger = createLogger('api-gateway')
const port = process.env.PORT || 3000

// Health monitor
const healthMonitor = createHealthMonitor({
  serviceId: 'api-gateway',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
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
app.use(logRequest('api-gateway'))

// Rate limiting
app.use(rateLimiter)

// Health check endpoint
app.get('/health', createHealthEndpoint(healthMonitor))

// API routes
app.use('/api/health', healthRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/image', imageRoutes)
app.use('/api/tts', ttsRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'API Gateway',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: {
        health: '/api/health',
        chat: '/api/chat',
        image: '/api/image',
        tts: '/api/tts',
      },
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
  logger.info(`API Gateway started on port ${port}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
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


