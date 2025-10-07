// Image processing queue for background generation

import { EventEmitter } from 'events'
import { ImageGenerationRequest, ImageGenerationResponse } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'
import { stableDiffusionClient } from '../stable-diffusion/client'

const logger = createLogger('image-service-queue')

export interface QueueJob {
  id: string
  userId: string
  request: ImageGenerationRequest
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  result?: ImageGenerationResponse
  error?: string
  retries: number
  maxRetries: number
}

export interface QueueStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  averageProcessingTime: number
}

export class ImageProcessingQueue extends EventEmitter {
  private jobs: Map<string, QueueJob> = new Map()
  private processingJobs: Set<string> = new Set()
  private maxConcurrentJobs: number
  private processingTimes: number[] = []

  constructor(maxConcurrentJobs: number = 2) {
    super()
    this.maxConcurrentJobs = maxConcurrentJobs
    
    // Start processing loop
    this.startProcessingLoop()
    
    logger.info('Image processing queue initialized', {
      maxConcurrentJobs: this.maxConcurrentJobs,
    })
  }

  async addJob(userId: string, request: ImageGenerationRequest): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: QueueJob = {
      id: jobId,
      userId,
      request,
      status: 'pending',
      createdAt: new Date(),
      retries: 0,
      maxRetries: 3,
    }

    this.jobs.set(jobId, job)
    
    logger.info('Job added to queue', {
      jobId,
      userId,
      prompt: request.prompt.substring(0, 100) + '...',
      style: request.style,
    })

    this.emit('jobAdded', job)
    return jobId
  }

  getJob(jobId: string): QueueJob | null {
    return this.jobs.get(jobId) || null
  }

  getUserJobs(userId: string, limit: number = 50): QueueJob[] {
    const userJobs = Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
    
    return userJobs
  }

  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values())
    const completed = jobs.filter(job => job.status === 'completed')
    const averageProcessingTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length
      : 0

    return {
      total: jobs.length,
      pending: jobs.filter(job => job.status === 'pending').length,
      processing: jobs.filter(job => job.status === 'processing').length,
      completed: completed.length,
      failed: jobs.filter(job => job.status === 'failed').length,
      averageProcessingTime: Math.round(averageProcessingTime),
    }
  }

  private async startProcessingLoop(): Promise<void> {
    setInterval(async () => {
      await this.processNextJob()
    }, 1000) // Check every second
  }

  private async processNextJob(): Promise<void> {
    // Check if we can process more jobs
    if (this.processingJobs.size >= this.maxConcurrentJobs) {
      return
    }

    // Find next pending job
    const pendingJob = Array.from(this.jobs.values())
      .find(job => job.status === 'pending' && !this.processingJobs.has(job.id))

    if (!pendingJob) {
      return
    }

    // Start processing
    this.processingJobs.add(pendingJob.id)
    pendingJob.status = 'processing'
    pendingJob.startedAt = new Date()

    logger.info('Starting job processing', {
      jobId: pendingJob.id,
      userId: pendingJob.userId,
      prompt: pendingJob.request.prompt.substring(0, 100) + '...',
    })

    this.emit('jobStarted', pendingJob)

    // Process job in background
    this.processJob(pendingJob).catch(error => {
      logger.error('Job processing failed', {
        jobId: pendingJob.id,
        error: error.message,
      })
    })
  }

  private async processJob(job: QueueJob): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Generate image using Stable Diffusion
      const result = await stableDiffusionClient.generateImage(job.request)
      
      // Update job status
      job.status = 'completed'
      job.completedAt = new Date()
      job.result = result
      
      const processingTime = Date.now() - startTime
      this.processingTimes.push(processingTime)
      
      // Keep only last 100 processing times for stats
      if (this.processingTimes.length > 100) {
        this.processingTimes = this.processingTimes.slice(-100)
      }

      logger.info('Job completed successfully', {
        jobId: job.id,
        userId: job.userId,
        processingTime: `${processingTime}ms`,
        imageUrl: result.imageUrl,
      })

      this.emit('jobCompleted', job)
    } catch (error) {
      // Handle retry logic
      job.retries++
      
      if (job.retries < job.maxRetries) {
        job.status = 'pending'
        logger.warn('Job failed, retrying', {
          jobId: job.id,
          userId: job.userId,
          retry: job.retries,
          maxRetries: job.maxRetries,
          error: (error as Error).message,
        })
        
        this.emit('jobRetry', job)
      } else {
        job.status = 'failed'
        job.completedAt = new Date()
        job.error = (error as Error).message
        
        logger.error('Job failed permanently', {
          jobId: job.id,
          userId: job.userId,
          retries: job.retries,
          error: (error as Error).message,
        })
        
        this.emit('jobFailed', job)
      }
    } finally {
      // Remove from processing set
      this.processingJobs.delete(job.id)
    }
  }

  async cancelJob(jobId: string, userId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    
    if (!job) {
      return false
    }

    // Check if user owns the job
    if (job.userId !== userId) {
      return false
    }

    // Only cancel pending jobs
    if (job.status !== 'pending') {
      return false
    }

    // Remove job
    this.jobs.delete(jobId)
    
    logger.info('Job cancelled', {
      jobId,
      userId,
    })

    this.emit('jobCancelled', job)
    return true
  }

  async clearCompletedJobs(olderThanHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    let clearedCount = 0

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.completedAt &&
        job.completedAt < cutoffTime
      ) {
        this.jobs.delete(jobId)
        clearedCount++
      }
    }

    if (clearedCount > 0) {
      logger.info('Cleared completed jobs', {
        clearedCount,
        olderThanHours,
      })
    }

    return clearedCount
  }

  // Cleanup old jobs periodically
  startCleanupTimer(intervalHours: number = 1): void {
    setInterval(async () => {
      await this.clearCompletedJobs(24) // Clear jobs older than 24 hours
    }, intervalHours * 60 * 60 * 1000)
  }
}

// Singleton instance
export const imageProcessingQueue = new ImageProcessingQueue(
  parseInt(process.env.IMAGE_QUEUE_MAX_CONCURRENT || '2')
)

// Start cleanup timer
imageProcessingQueue.startCleanupTimer(1) // Clean up every hour


