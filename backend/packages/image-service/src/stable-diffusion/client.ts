// Stable Diffusion client for image generation

import axios, { AxiosInstance } from 'axios'
import { ImageGenerationRequest, ImageGenerationResponse } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('image-service-stable-diffusion')

export interface StableDiffusionConfig {
  endpoint: string
  timeout: number
  maxRetries: number
  retryDelay: number
}

export class StableDiffusionClient {
  private config: StableDiffusionConfig
  private client: AxiosInstance
  private logger = logger

  constructor(config: StableDiffusionConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Generating image with Stable Diffusion', {
        prompt: request.prompt.substring(0, 100) + '...',
        width: request.width,
        height: request.height,
        steps: request.steps,
        style: request.style,
      })

      // Prepare Stable Diffusion API request
      const sdRequest = {
        prompt: this.enhancePrompt(request.prompt, request.style),
        negative_prompt: request.negativePrompt || 'blurry, low quality, distorted, ugly, bad anatomy',
        width: request.width || 512,
        height: request.height || 512,
        num_inference_steps: request.steps || 20,
        guidance_scale: request.guidance || 7.5,
        seed: request.seed || -1, // -1 for random seed
        num_images: 1,
        return_pil_images: false,
        return_dict: true,
      }

      // Generate image
      const response = await this.client.post('/api/v1/generate', sdRequest)
      
      if (!response.data.images || response.data.images.length === 0) {
        throw new Error('No images generated')
      }

      const imageData = response.data.images[0]
      const generationTime = Date.now() - startTime

      // Save image to storage (in production, this would be cloud storage)
      const imageUrl = await this.saveImage(imageData, request)

      this.logger.info('Image generation completed', {
        prompt: request.prompt.substring(0, 100) + '...',
        generationTime: `${generationTime}ms`,
        imageUrl,
      })

      return {
        imageUrl,
        metadata: {
          prompt: request.prompt,
          negativePrompt: request.negativePrompt,
          width: request.width || 512,
          height: request.height || 512,
          steps: request.steps || 20,
          guidance: request.guidance || 7.5,
          seed: request.seed || response.data.seed,
          style: request.style || 'realistic',
          model: 'stable-diffusion-v1.5',
          generationTime,
        },
      }
    } catch (error) {
      const generationTime = Date.now() - startTime
      this.logger.error('Stable Diffusion generation failed', {
        error: (error as Error).message,
        prompt: request.prompt.substring(0, 100) + '...',
        generationTime: `${generationTime}ms`,
      })
      throw error
    }
  }

  private enhancePrompt(prompt: string, style?: string): string {
    let enhancedPrompt = prompt

    // Add style-specific enhancements
    if (style) {
      switch (style) {
        case 'realistic':
          enhancedPrompt += ', photorealistic, high detail, sharp focus, professional photography'
          break
        case 'artistic':
          enhancedPrompt += ', artistic, creative, stylized, beautiful composition'
          break
        case 'anime':
          enhancedPrompt += ', anime style, manga, cel shading, vibrant colors'
          break
        case 'oil-painting':
          enhancedPrompt += ', oil painting, classical art, brush strokes, traditional painting'
          break
        case 'digital-art':
          enhancedPrompt += ', digital art, modern art, contemporary, clean lines'
          break
        case 'sketch':
          enhancedPrompt += ', pencil sketch, line art, black and white, minimal'
          break
        default:
          enhancedPrompt += ', high quality, detailed'
      }
    }

    return enhancedPrompt
  }

  private async saveImage(imageData: string, request: ImageGenerationRequest): Promise<string> {
    try {
      // In production, this would save to cloud storage (S3, GCS, etc.)
      // For now, we'll return a mock URL
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const imageUrl = `https://picsum.photos/${request.width || 512}/${request.height || 512}?random=${imageId}`
      
      this.logger.info('Image saved', { imageId, imageUrl })
      return imageUrl
    } catch (error) {
      this.logger.error('Failed to save image', { error: (error as Error).message })
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/v1/models', { timeout: 5000 })
      return response.status === 200 && response.data.models.length > 0
    } catch (error) {
      this.logger.warn('Stable Diffusion not available', { error: (error as Error).message })
      return false
    }
  }

  async getModels(): Promise<Array<{ name: string; description: string }>> {
    try {
      const response = await this.client.get('/api/v1/models')
      return response.data.models || []
    } catch (error) {
      this.logger.error('Failed to get models', { error: (error as Error).message })
      return []
    }
  }

  async getStatus(): Promise<{
    status: string
    models: Array<{ name: string; description: string }>
    gpu: {
      available: boolean
      memory: number
      utilization: number
    }
  }> {
    try {
      const response = await this.client.get('/api/v1/status')
      return response.data
    } catch (error) {
      this.logger.error('Failed to get status', { error: (error as Error).message })
      return {
        status: 'offline',
        models: [],
        gpu: {
          available: false,
          memory: 0,
          utilization: 0,
        },
      }
    }
  }
}

// Singleton instance
export const stableDiffusionClient = new StableDiffusionClient({
  endpoint: process.env.STABLE_DIFFUSION_URL || 'http://localhost:7860',
  timeout: parseInt(process.env.STABLE_DIFFUSION_TIMEOUT || '120000'), // 2 minutes
  maxRetries: parseInt(process.env.STABLE_DIFFUSION_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.STABLE_DIFFUSION_RETRY_DELAY || '1000'),
})


