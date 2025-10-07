// Common types shared across all backend services

export interface ServiceHealth {
  serviceId: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  uptime: number
  lastCheck: string
  version: string
  environment: string
  metrics: ServiceMetrics
}

export interface ServiceMetrics {
  responseTime: {
    p50: number
    p95: number
    p99: number
  }
  requestRate: number
  errorRate: number
  activeConnections: number
  memoryUsage: number
  cpuUsage: number
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  label?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  requestId: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down'
  services: ServiceHealth[]
  timestamp: string
  uptime: number
}

// LLM Provider Types
export interface LLMProvider {
  name: string
  type: 'local' | 'cloud'
  endpoint: string
  apiKey?: string
  model: string
  maxTokens: number
  temperature: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ChatRequest {
  messages: ChatMessage[]
  character?: string
  provider?: string
  maxTokens?: number
  temperature?: number
}

export interface ChatResponse {
  message: ChatMessage
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  provider: string
  model: string
  finishReason: string
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  steps?: number
  guidance?: number
  seed?: number
  style?: string
}

export interface ImageGenerationResponse {
  imageUrl: string
  metadata: {
    prompt: string
    negativePrompt?: string
    width: number
    height: number
    steps: number
    guidance: number
    seed: number
    style?: string
    model: string
    generationTime: number
  }
}

// TTS/STT Types
export interface TTSRequest {
  text: string
  voice?: string
  language?: string
  speed?: number
  pitch?: number
}

export interface TTSResponse {
  audioUrl: string
  metadata: {
    text: string
    voice: string
    language: string
    duration: number
    sampleRate: number
  }
}

export interface STTRequest {
  audioUrl: string
  language?: string
  format?: string
}

export interface STTResponse {
  text: string
  metadata: {
    language: string
    confidence: number
    duration: number
    words: Array<{
      word: string
      start: number
      end: number
      confidence: number
    }>
  }
}

// Error Types
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, 429)
    this.name = 'RateLimitError'
  }
}


