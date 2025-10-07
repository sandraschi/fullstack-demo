// Error handling middleware for TTS/STT Service

import { Request, Response, NextFunction } from 'express'
import { AppError } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('tts-stt-service')

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req as any).requestId

  // Log the error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
  }, requestId)

  // Handle known application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
      requestId,
    })
    return
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
      requestId,
    })
    return
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
      timestamp: new Date().toISOString(),
      requestId,
    })
    return
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
    },
    timestamp: new Date().toISOString(),
    requestId,
  })
}


