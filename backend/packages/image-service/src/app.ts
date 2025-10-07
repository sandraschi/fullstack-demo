// Image Service - Main application entry point

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { createLogger, logRequest } from '../../shared/src/utils/logger'
import { createHealthMonitor, createHealthEndpoint } from '../../shared/src/utils/health'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { imageRoutes } from './routes/image'
import { styleRoutes } from './routes/styles'
import { queueRoutes } from './routes/queue'
import { stableDiffusionClient } from './stable-diffusion/client'
import { imageProcessingQueue } from './queue/processor'
import { styleManager } from './styles/templates'

// Load environment variables
dotenv.config()

const app = express()
const logger = createLogger('image-service')
const port = process.env.PORT || 9202

// Health monitor
const healthMonitor = createHealthMonitor({
  serviceId: 'image-service',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  dependencies: [
    {
      name: 'stable-diffusion',
      check: async () => await stableDiffusionClient.isAvailable(),
      timeout: 10000,
    },
    {
      name: 'processing-queue',
      check: async () => {
        const stats = imageProcessingQueue.getStats()
        return stats.total >= 0 // Queue is working if we can get stats
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
app.use(express.json({ limit: '50mb' })) // Larger limit for image data
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Request logging
app.use(logRequest('image-service'))

// Rate limiting
app.use(rateLimiter)

// Health check endpoint
app.get('/health', createHealthEndpoint(healthMonitor))

// API routes
app.use('/api/image', imageRoutes)
app.use('/api/styles', styleRoutes)
app.use('/api/queue', queueRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Image Service',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: {
        image: '/api/image',
        styles: '/api/styles',
        queue: '/api/queue',
      },
    },
    features: {
      stableDiffusion: process.env.STABLE_DIFFUSION_URL || 'http://localhost:7860',
      gradioInterface: 'http://localhost:7860',
      styleTemplates: styleManager.getAllTemplates().length,
      queueStats: imageProcessingQueue.getStats(),
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
  logger.info(`Image Service started on port ${port}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
  logger.info(`Stable Diffusion URL: ${process.env.STABLE_DIFFUSION_URL || 'http://localhost:7860'}`)
  logger.info(`Gradio Interface: http://localhost:7860`)
  
  // Log available styles
  logger.info('Available Style Templates', { 
    styles: styleManager.getAllTemplates().map(s => s.id) 
  })
  
  // Log queue stats
  logger.info('Processing Queue Stats', { 
    stats: imageProcessingQueue.getStats() 
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


