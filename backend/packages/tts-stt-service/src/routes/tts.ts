// TTS routes for TTS/STT Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { ttsRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse, TTSRequest, TTSResponse } from '@shared/types/common.types'
import { coquiClient } from '../coqui/client'
import { voiceManager } from '../voices/manager'

const router = Router()
const logger = createLogger('tts-stt-service')

// Generate speech from text
router.post('/synthesize', ttsRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const ttsRequest: TTSRequest = req.body
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('TTS synthesis request received', {
      textLength: ttsRequest.text.length,
      voice: ttsRequest.voice,
      language: ttsRequest.language,
      speed: ttsRequest.speed,
      userId,
    }, requestId)

    // Validate request
    if (!ttsRequest.text || ttsRequest.text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Text is required and cannot be empty',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    if (ttsRequest.text.length > 5000) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Text cannot exceed 5000 characters',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Validate voice if provided
    if (ttsRequest.voice) {
      const voice = voiceManager.getVoice(ttsRequest.voice)
      if (!voice) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Voice ${ttsRequest.voice} not found`,
          },
          timestamp: new Date().toISOString(),
          requestId,
        })
        return
      }
    }

    // Validate language if provided
    if (ttsRequest.language) {
      const language = voiceManager.getLanguage(ttsRequest.language)
      if (!language) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Language ${ttsRequest.language} not supported`,
          },
          timestamp: new Date().toISOString(),
          requestId,
        })
        return
      }
    }

    // Validate parameters
    if (ttsRequest.speed && (ttsRequest.speed < 0.5 || ttsRequest.speed > 2.0)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Speed must be between 0.5 and 2.0',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    if (ttsRequest.pitch && (ttsRequest.pitch < 0.5 || ttsRequest.pitch > 2.0)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Pitch must be between 0.5 and 2.0',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    if (ttsRequest.energy && (ttsRequest.energy < 0.1 || ttsRequest.energy > 2.0)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Energy must be between 0.1 and 2.0',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Generate speech
    const startTime = Date.now()
    const ttsResponse = await coquiClient.synthesizeSpeech(ttsRequest)
    const processingTime = Date.now() - startTime

    logger.info('TTS synthesis completed', {
      textLength: ttsRequest.text.length,
      processingTime: `${processingTime}ms`,
      audioUrl: ttsResponse.audioUrl,
      voice: ttsRequest.voice,
      userId,
    }, requestId)

    const response: ApiResponse<TTSResponse> = {
      success: true,
      data: ttsResponse,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('TTS synthesis failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TTS_SYNTHESIS_ERROR',
        message: 'Failed to synthesize speech',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get TTS status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('TTS status requested', {}, requestId)

    const status = await coquiClient.getStatus()

    const response: ApiResponse = {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('TTS status check failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TTS_STATUS_ERROR',
        message: 'Failed to check TTS status',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as ttsRoutes }


