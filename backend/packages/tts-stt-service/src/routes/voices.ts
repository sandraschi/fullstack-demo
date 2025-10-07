// Voice management routes for TTS/STT Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { voiceRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse } from '@shared/types/common.types'
import { voiceManager } from '../voices/manager'

const router = Router()
const logger = createLogger('tts-stt-service')

// Get all voices
router.get('/', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Voices list requested', {}, requestId)

    const voices = voiceManager.getAllVoices()

    const response: ApiResponse = {
      success: true,
      data: voices,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voices list failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICES_LIST_ERROR',
        message: 'Failed to retrieve voices list',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get specific voice
router.get('/:voiceId', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const { voiceId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Voice requested', { voiceId }, requestId)

    const voice = voiceManager.getVoice(voiceId)
    
    if (!voice) {
      res.status(404).json({
        success: false,
        error: {
          code: 'VOICE_NOT_FOUND',
          message: `Voice ${voiceId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: voice,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voice retrieval failed', { 
      voiceId: req.params.voiceId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICE_RETRIEVAL_ERROR',
        message: 'Failed to retrieve voice',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get voices by language
router.get('/language/:language', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const { language } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Voices by language requested', { language }, requestId)

    const voices = voiceManager.getVoicesByLanguage(language)

    const response: ApiResponse = {
      success: true,
      data: voices,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voices by language failed', { 
      language: req.params.language,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICES_BY_LANGUAGE_ERROR',
        message: 'Failed to retrieve voices by language',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get voices by gender
router.get('/gender/:gender', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const { gender } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Voices by gender requested', { gender }, requestId)

    if (!['male', 'female', 'neutral'].includes(gender)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Gender must be male, female, or neutral',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const voices = voiceManager.getVoicesByGender(gender as 'male' | 'female' | 'neutral')

    const response: ApiResponse = {
      success: true,
      data: voices,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voices by gender failed', { 
      gender: req.params.gender,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICES_BY_GENDER_ERROR',
        message: 'Failed to retrieve voices by gender',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get voices by provider
router.get('/provider/:provider', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const { provider } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Voices by provider requested', { provider }, requestId)

    const voices = voiceManager.getVoicesByProvider(provider)

    const response: ApiResponse = {
      success: true,
      data: voices,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voices by provider failed', { 
      provider: req.params.provider,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICES_BY_PROVIDER_ERROR',
        message: 'Failed to retrieve voices by provider',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get default voice for language
router.get('/default/:language', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const { language } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Default voice requested', { language }, requestId)

    const voice = voiceManager.getDefaultVoice(language)
    
    if (!voice) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DEFAULT_VOICE_NOT_FOUND',
          message: `No default voice found for language ${language}`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: voice,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Default voice retrieval failed', { 
      language: req.params.language,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DEFAULT_VOICE_ERROR',
        message: 'Failed to retrieve default voice',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Search voices
router.get('/search/:query', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const { query } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Voice search requested', { query }, requestId)

    const voices = voiceManager.searchVoices(query)

    const response: ApiResponse = {
      success: true,
      data: voices,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voice search failed', { 
      query: req.params.query,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICE_SEARCH_ERROR',
        message: 'Failed to search voices',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get voice statistics
router.get('/stats/summary', voiceRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Voice statistics requested', {}, requestId)

    const stats = voiceManager.getVoiceStats()

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Voice statistics failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'VOICE_STATS_ERROR',
        message: 'Failed to retrieve voice statistics',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as voiceRoutes }


