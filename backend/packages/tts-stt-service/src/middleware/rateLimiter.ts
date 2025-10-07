// Rate limiting middleware for TTS/STT Service

import { Request, Response, NextFunction } from 'express'
import { RateLimitError } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('tts-stt-service')

// Simple in-memory rate limiter (for production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  keyGenerator: (req: Request) => {
    // Use IP address as default key
    return req.ip || req.connection.remoteAddress || 'unknown'
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

export function rateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }
  const keyGenerator = finalConfig.keyGenerator!

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req)
    const now = Date.now()
    const windowStart = now - finalConfig.windowMs

    // Clean up expired entries
    Object.keys(store).forEach(storeKey => {
      if (store[storeKey].resetTime < now) {
        delete store[storeKey]
      }
    })

    // Initialize or get existing entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
      }
    }

    const entry = store[key]
    entry.count++

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, finalConfig.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    })

    // Check if limit exceeded
    if (entry.count > finalConfig.maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        limit: finalConfig.maxRequests,
        windowMs: finalConfig.windowMs,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }, (req as any).requestId)

      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
      )
    }

    // Log rate limit info for monitoring
    if (entry.count % 10 === 0) {
      logger.debug('Rate limit status', {
        key,
        count: entry.count,
        limit: finalConfig.maxRequests,
        remaining: finalConfig.maxRequests - entry.count,
      }, (req as any).requestId)
    }

    next()
  }
}

// Specialized rate limiters for different endpoints
export const ttsRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 TTS requests per minute (expensive operation)
})

export const sttRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 STT requests per minute (less expensive)
})

export const voiceRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 voice requests per minute
})

export const audioRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 audio processing requests per minute
})


