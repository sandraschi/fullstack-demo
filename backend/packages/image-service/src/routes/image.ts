// Image generation routes for Image Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { imageGenerationRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse, ImageGenerationRequest, ImageGenerationResponse } from '@shared/types/common.types'
import { stableDiffusionClient } from '../stable-diffusion/client'
import { imageProcessingQueue } from '../queue/processor'
import { styleManager } from '../styles/templates'

const router = Router()
const logger = createLogger('image-service')

// Generate image (synchronous)
router.post('/generate', imageGenerationRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const imageRequest: ImageGenerationRequest = req.body
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Image generation request received', {
      prompt: imageRequest.prompt.substring(0, 100) + '...',
      width: imageRequest.width,
      height: imageRequest.height,
      style: imageRequest.style,
      userId,
    }, requestId)

    // Validate request
    if (!imageRequest.prompt || imageRequest.prompt.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt is required and cannot be empty',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    if (imageRequest.prompt.length > 1000) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt cannot exceed 1000 characters',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Validate dimensions
    const width = imageRequest.width || 512
    const height = imageRequest.height || 512
    
    if (width < 64 || width > 2048 || height < 64 || height > 2048) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image dimensions must be between 64x64 and 2048x2048',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Enhance prompt with style
    if (imageRequest.style) {
      const { enhancedPrompt, negativePrompt } = styleManager.enhancePrompt(
        imageRequest.prompt,
        imageRequest.style
      )
      imageRequest.prompt = enhancedPrompt
      imageRequest.negativePrompt = imageRequest.negativePrompt 
        ? `${imageRequest.negativePrompt}, ${negativePrompt}`
        : negativePrompt
    }

    // Generate image
    const startTime = Date.now()
    const imageResponse = await stableDiffusionClient.generateImage(imageRequest)
    const processingTime = Date.now() - startTime

    logger.info('Image generation completed', {
      prompt: imageRequest.prompt.substring(0, 100) + '...',
      processingTime: `${processingTime}ms`,
      imageUrl: imageResponse.imageUrl,
      userId,
    }, requestId)

    const response: ApiResponse<ImageGenerationResponse> = {
      success: true,
      data: imageResponse,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Image generation failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'IMAGE_GENERATION_ERROR',
        message: 'Failed to generate image',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Generate image (asynchronous with queue)
router.post('/generate-async', imageGenerationRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const imageRequest: ImageGenerationRequest = req.body
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Async image generation request received', {
      prompt: imageRequest.prompt.substring(0, 100) + '...',
      width: imageRequest.width,
      height: imageRequest.height,
      style: imageRequest.style,
      userId,
    }, requestId)

    // Validate request (same as synchronous)
    if (!imageRequest.prompt || imageRequest.prompt.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt is required and cannot be empty',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Add job to queue
    const jobId = await imageProcessingQueue.addJob(userId, imageRequest)

    logger.info('Image generation job queued', {
      jobId,
      userId,
      prompt: imageRequest.prompt.substring(0, 100) + '...',
    }, requestId)

    const response: ApiResponse = {
      success: true,
      data: {
        jobId,
        status: 'queued',
        message: 'Image generation job added to queue',
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Async image generation failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'ASYNC_IMAGE_GENERATION_ERROR',
        message: 'Failed to queue image generation',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get Stable Diffusion status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Stable Diffusion status requested', {}, requestId)

    const status = await stableDiffusionClient.getStatus()
    const models = await stableDiffusionClient.getModels()

    const response: ApiResponse = {
      success: true,
      data: {
        ...status,
        models,
        queueStats: imageProcessingQueue.getStats(),
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Status check failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_CHECK_ERROR',
        message: 'Failed to check Stable Diffusion status',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as imageRoutes }


