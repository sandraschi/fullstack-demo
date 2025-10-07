// STT routes for TTS/STT Service

import { Router, Request, Response } from 'express'
import multer from 'multer'
import { createLogger } from '@shared/utils/logger'
import { sttRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse, STTRequest, STTResponse } from '@shared/types/common.types'
import { whisperClient } from '../whisper/client'
import { audioProcessor } from '../audio/processor'

const router = Router()
const logger = createLogger('tts-stt-service')

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/flac',
      'audio/m4a',
      'audio/aac',
    ]
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'))
    }
  },
})

// Transcribe audio file
router.post('/transcribe', sttRateLimiter, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('STT transcription request received', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      language: req.body.language,
      userId,
    }, requestId)

    // Validate file
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Audio file is required',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Validate audio file
    const validation = await audioProcessor.validateAudio(req.file.buffer)
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid audio file',
          details: validation.errors,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      logger.warn('Audio validation warnings', {
        warnings: validation.warnings,
        fileName: req.file.originalname,
      }, requestId)
    }

    // Prepare STT request
    const sttRequest: STTRequest = {
      audioBuffer: req.file.buffer,
      language: req.body.language || undefined,
    }

    // Transcribe audio
    const startTime = Date.now()
    const sttResponse = await whisperClient.transcribeAudio(sttRequest)
    const processingTime = Date.now() - startTime

    logger.info('STT transcription completed', {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      textLength: sttResponse.text.length,
      confidence: sttResponse.confidence,
      processingTime: `${processingTime}ms`,
      language: sttResponse.language,
      userId,
    }, requestId)

    const response: ApiResponse<STTResponse> = {
      success: true,
      data: sttResponse,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('STT transcription failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      fileName: req.file?.originalname,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STT_TRANSCRIPTION_ERROR',
        message: 'Failed to transcribe audio',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Transcribe audio from URL
router.post('/transcribe-url', sttRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const { audioUrl, language } = req.body
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('STT URL transcription request received', {
      audioUrl,
      language,
      userId,
    }, requestId)

    // Validate request
    if (!audioUrl) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Audio URL is required',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Validate URL format
    try {
      new URL(audioUrl)
    } catch {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid audio URL format',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Prepare STT request
    const sttRequest: STTRequest = {
      audioUrl,
      language: language || undefined,
    }

    // Transcribe audio
    const startTime = Date.now()
    const sttResponse = await whisperClient.transcribeAudio(sttRequest)
    const processingTime = Date.now() - startTime

    logger.info('STT URL transcription completed', {
      audioUrl,
      textLength: sttResponse.text.length,
      confidence: sttResponse.confidence,
      processingTime: `${processingTime}ms`,
      language: sttResponse.language,
      userId,
    }, requestId)

    const response: ApiResponse<STTResponse> = {
      success: true,
      data: sttResponse,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('STT URL transcription failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      audioUrl: req.body.audioUrl,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STT_URL_TRANSCRIPTION_ERROR',
        message: 'Failed to transcribe audio from URL',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get STT status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('STT status requested', {}, requestId)

    const status = await whisperClient.getStatus()

    const response: ApiResponse = {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('STT status check failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STT_STATUS_ERROR',
        message: 'Failed to check STT status',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as sttRoutes }


