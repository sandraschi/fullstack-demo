// Health monitoring routes for API Gateway

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { ApiResponse, HealthCheckResponse } from '@shared/types/common.types'

const router = Router()
const logger = createLogger('api-gateway')

// Mock service health data (in production, this would fetch from actual services)
const mockServices = [
  {
    serviceId: 'chat-service',
    status: 'healthy' as const,
    uptime: 99.97,
    lastCheck: new Date().toISOString(),
    version: '1.0.0',
    environment: 'development',
    metrics: {
      responseTime: { p50: 150, p95: 300, p99: 500 },
      requestRate: 45,
      errorRate: 0.01,
      activeConnections: 12,
      memoryUsage: 0.65,
      cpuUsage: 0.25,
    },
  },
  {
    serviceId: 'image-service',
    status: 'healthy' as const,
    uptime: 99.95,
    lastCheck: new Date().toISOString(),
    version: '1.0.0',
    environment: 'development',
    metrics: {
      responseTime: { p50: 2000, p95: 5000, p99: 8000 },
      requestRate: 8,
      errorRate: 0.02,
      activeConnections: 3,
      memoryUsage: 0.85,
      cpuUsage: 0.70,
    },
  },
  {
    serviceId: 'tts-service',
    status: 'degraded' as const,
    uptime: 99.89,
    lastCheck: new Date().toISOString(),
    version: '1.0.0',
    environment: 'development',
    metrics: {
      responseTime: { p50: 800, p95: 2000, p99: 4000 },
      requestRate: 15,
      errorRate: 0.05,
      activeConnections: 5,
      memoryUsage: 0.45,
      cpuUsage: 0.30,
    },
  },
]

// Get overall system health
router.get('/', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Health check requested', {}, requestId)

    // Calculate overall system status
    const healthyServices = mockServices.filter(s => s.status === 'healthy').length
    const totalServices = mockServices.length
    const overallStatus = healthyServices === totalServices ? 'healthy' : 
                         healthyServices > 0 ? 'degraded' : 'down'

    const response: ApiResponse<HealthCheckResponse> = {
      success: true,
      data: {
        status: overallStatus,
        services: mockServices,
        timestamp: new Date().toISOString(),
        uptime: process.uptime() * 1000, // Convert to milliseconds
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Health check failed', { error: (error as Error).message }, (req as any).requestId)
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Failed to retrieve system health',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get health for specific service
router.get('/:serviceId', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Service health check requested', { serviceId }, requestId)

    const service = mockServices.find(s => s.serviceId === serviceId)
    
    if (!service) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: `Service ${serviceId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: service,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Service health check failed', { 
      serviceId: req.params.serviceId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVICE_HEALTH_CHECK_FAILED',
        message: 'Failed to retrieve service health',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get metrics for all services
router.get('/metrics/all', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('All metrics requested', {}, requestId)

    const metrics = mockServices.map(service => ({
      serviceId: service.serviceId,
      metrics: service.metrics,
      timestamp: new Date().toISOString(),
    }))

    const response: ApiResponse = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Metrics retrieval failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve metrics',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get metrics for specific service
router.get('/:serviceId/metrics', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Service metrics requested', { serviceId }, requestId)

    const service = mockServices.find(s => s.serviceId === serviceId)
    
    if (!service) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: `Service ${serviceId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: {
        serviceId: service.serviceId,
        metrics: service.metrics,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Service metrics retrieval failed', { 
      serviceId: req.params.serviceId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVICE_METRICS_RETRIEVAL_FAILED',
        message: 'Failed to retrieve service metrics',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as healthRoutes }


