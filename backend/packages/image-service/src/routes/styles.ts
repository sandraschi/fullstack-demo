// Style template routes for Image Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { styleRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse } from '@shared/types/common.types'
import { styleManager } from '../styles/templates'

const router = Router()
const logger = createLogger('image-service')

// Get all style templates
router.get('/', styleRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Style templates list requested', {}, requestId)

    const templates = styleManager.getAllTemplates()

    const response: ApiResponse = {
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Style templates list failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STYLE_TEMPLATES_ERROR',
        message: 'Failed to retrieve style templates',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get specific style template
router.get('/:styleId', styleRateLimiter, async (req: Request, res: Response) => {
  try {
    const { styleId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Style template requested', { styleId }, requestId)

    const template = styleManager.getTemplate(styleId)
    
    if (!template) {
      res.status(404).json({
        success: false,
        error: {
          code: 'STYLE_NOT_FOUND',
          message: `Style template ${styleId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Style template retrieval failed', { 
      styleId: req.params.styleId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STYLE_TEMPLATE_ERROR',
        message: 'Failed to retrieve style template',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Search style templates
router.get('/search/:query', styleRateLimiter, async (req: Request, res: Response) => {
  try {
    const { query } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Style template search requested', { query }, requestId)

    const templates = styleManager.searchTemplates(query)

    const response: ApiResponse = {
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Style template search failed', { 
      query: req.params.query,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STYLE_SEARCH_ERROR',
        message: 'Failed to search style templates',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get style templates by tag
router.get('/tag/:tag', styleRateLimiter, async (req: Request, res: Response) => {
  try {
    const { tag } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Style templates by tag requested', { tag }, requestId)

    const templates = styleManager.getTemplatesByTag(tag)

    const response: ApiResponse = {
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Style templates by tag failed', { 
      tag: req.params.tag,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STYLE_TAG_ERROR',
        message: 'Failed to retrieve style templates by tag',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Enhance prompt with style
router.post('/:styleId/enhance', styleRateLimiter, async (req: Request, res: Response) => {
  try {
    const { styleId } = req.params
    const { prompt, negativePrompt } = req.body
    const requestId = (req as any).requestId
    
    logger.info('Prompt enhancement requested', { styleId, promptLength: prompt?.length }, requestId)

    if (!prompt) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt is required',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const { enhancedPrompt, negativePrompt: styleNegativePrompt } = styleManager.enhancePrompt(prompt, styleId)
    
    const finalNegativePrompt = negativePrompt 
      ? `${negativePrompt}, ${styleNegativePrompt}`
      : styleNegativePrompt

    const response: ApiResponse = {
      success: true,
      data: {
        originalPrompt: prompt,
        enhancedPrompt,
        originalNegativePrompt: negativePrompt,
        enhancedNegativePrompt: finalNegativePrompt,
        styleId,
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Prompt enhancement failed', { 
      styleId: req.params.styleId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'PROMPT_ENHANCEMENT_ERROR',
        message: 'Failed to enhance prompt',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as styleRoutes }


