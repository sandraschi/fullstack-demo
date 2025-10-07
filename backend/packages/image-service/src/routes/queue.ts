// Processing queue routes for Image Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { queueRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse } from '@shared/types/common.types'
import { imageProcessingQueue } from '../queue/processor'

const router = Router()
const logger = createLogger('image-service')

// Get queue statistics
router.get('/stats', queueRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Queue stats requested', {}, requestId)

    const stats = imageProcessingQueue.getStats()

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Queue stats failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'QUEUE_STATS_ERROR',
        message: 'Failed to retrieve queue statistics',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get job status
router.get('/job/:jobId', queueRateLimiter, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Job status requested', { jobId }, requestId)

    const job = imageProcessingQueue.getJob(jobId)
    
    if (!job) {
      res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job ${jobId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: job,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Job status failed', { 
      jobId: req.params.jobId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'JOB_STATUS_ERROR',
        message: 'Failed to retrieve job status',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get user's jobs
router.get('/user/:userId', queueRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { limit = '50' } = req.query
    const requestId = (req as any).requestId
    
    logger.info('User jobs requested', { userId, limit }, requestId)

    const jobs = imageProcessingQueue.getUserJobs(userId, parseInt(limit as string))

    const response: ApiResponse = {
      success: true,
      data: jobs,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('User jobs failed', { 
      userId: req.params.userId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_JOBS_ERROR',
        message: 'Failed to retrieve user jobs',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Cancel job
router.delete('/job/:jobId', queueRateLimiter, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    const requestId = (req as any).requestId
    
    logger.info('Job cancellation requested', { jobId, userId }, requestId)

    const cancelled = await imageProcessingQueue.cancelJob(jobId, userId)
    
    if (!cancelled) {
      res.status(404).json({
        success: false,
        error: {
          code: 'JOB_CANCELLATION_FAILED',
          message: 'Job not found or cannot be cancelled',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Job cancelled successfully' },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Job cancellation failed', { 
      jobId: req.params.jobId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'JOB_CANCELLATION_ERROR',
        message: 'Failed to cancel job',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as queueRoutes }


