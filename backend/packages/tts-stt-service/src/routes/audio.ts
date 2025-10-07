// Audio processing routes for TTS/STT Service

import { Router, Request, Response } from 'express'
import multer from 'multer'
import { createLogger } from '@shared/utils/logger'
import { audioRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse } from '@shared/types/common.types'
import { audioProcessor, AudioProcessingOptions } from '../audio/processor'

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

// Process audio file
router.post('/process', audioRateLimiter, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Audio processing request received', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      options: req.body,
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

    // Parse processing options
    const options: AudioProcessingOptions = {
      format: req.body.format || undefined,
      sampleRate: req.body.sampleRate ? parseInt(req.body.sampleRate) : undefined,
      channels: req.body.channels ? parseInt(req.body.channels) : undefined,
      bitDepth: req.body.bitDepth ? parseInt(req.body.bitDepth) : undefined,
      quality: req.body.quality ? parseInt(req.body.quality) : undefined,
      normalize: req.body.normalize === 'true',
      removeSilence: req.body.removeSilence === 'true',
      trimStart: req.body.trimStart ? parseInt(req.body.trimStart) : undefined,
      trimEnd: req.body.trimEnd ? parseInt(req.body.trimEnd) : undefined,
    }

    // Process audio
    const startTime = Date.now()
    const result = await audioProcessor.processAudio(req.file.buffer, options)
    const processingTime = Date.now() - startTime

    logger.info('Audio processing completed', {
      fileName: req.file.originalname,
      inputSize: req.file.size,
      outputSize: result.processedBuffer.length,
      processingTime: `${processingTime}ms`,
      metadata: result.metadata,
      userId,
    }, requestId)

    const response: ApiResponse = {
      success: true,
      data: {
        processedAudio: result.processedBuffer.toString('base64'),
        metadata: result.metadata,
        processingTime,
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Audio processing failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      fileName: req.file?.originalname,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'AUDIO_PROCESSING_ERROR',
        message: 'Failed to process audio',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Validate audio file
router.post('/validate', audioRateLimiter, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Audio validation request received', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
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

    // Validate audio
    const validation = await audioProcessor.validateAudio(req.file.buffer)
    const metadata = await audioProcessor.extractMetadata(req.file.buffer)

    logger.info('Audio validation completed', {
      fileName: req.file.originalname,
      isValid: validation.isValid,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      metadata,
      userId,
    }, requestId)

    const response: ApiResponse = {
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        metadata,
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Audio validation failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      fileName: req.file?.originalname,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'AUDIO_VALIDATION_ERROR',
        message: 'Failed to validate audio',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Generate waveform
router.post('/waveform', audioRateLimiter, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Waveform generation request received', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
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

    // Generate waveform
    const startTime = Date.now()
    const waveform = await audioProcessor.generateWaveform(req.file.buffer)
    const processingTime = Date.now() - startTime

    logger.info('Waveform generation completed', {
      fileName: req.file.originalname,
      peaks: waveform.peaks.length,
      duration: waveform.duration,
      processingTime: `${processingTime}ms`,
      userId,
    }, requestId)

    const response: ApiResponse = {
      success: true,
      data: waveform,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Waveform generation failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      fileName: req.file?.originalname,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'WAVEFORM_GENERATION_ERROR',
        message: 'Failed to generate waveform',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Create audio thumbnail
router.post('/thumbnail', audioRateLimiter, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Audio thumbnail request received', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
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

    // Create thumbnail
    const startTime = Date.now()
    const thumbnail = await audioProcessor.createAudioThumbnail(req.file.buffer)
    const processingTime = Date.now() - startTime

    logger.info('Audio thumbnail created', {
      fileName: req.file.originalname,
      thumbnailSize: thumbnail.length,
      processingTime: `${processingTime}ms`,
      userId,
    }, requestId)

    const response: ApiResponse = {
      success: true,
      data: {
        thumbnail: thumbnail.toString('base64'),
        size: thumbnail.length,
        processingTime,
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Audio thumbnail creation failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      fileName: req.file?.originalname,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'AUDIO_THUMBNAIL_ERROR',
        message: 'Failed to create audio thumbnail',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as audioRoutes }


