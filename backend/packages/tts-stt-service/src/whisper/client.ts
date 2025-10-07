// Whisper STT client for speech-to-text conversion

import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import { STTRequest, STTResponse } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('tts-stt-service-whisper')

export interface WhisperConfig {
  endpoint: string
  timeout: number
  maxRetries: number
  retryDelay: number
  model: string
  language?: string
  temperature: number
  responseFormat: string
}

export class WhisperClient {
  private config: WhisperConfig
  private client: AxiosInstance
  private logger = logger

  constructor(config: WhisperConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async transcribeAudio(request: STTRequest): Promise<STTResponse> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Transcribing audio with Whisper', {
        language: request.language || 'auto',
        model: this.config.model,
        audioSize: request.audioBuffer?.length || 0,
      })

      // Prepare form data
      const formData = new FormData()
      
      // Add audio file
      if (request.audioBuffer) {
        formData.append('file', request.audioBuffer, {
          filename: 'audio.wav',
          contentType: 'audio/wav',
        })
      } else if (request.audioUrl) {
        // Download audio from URL
        const audioResponse = await axios.get(request.audioUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
        })
        
        formData.append('file', Buffer.from(audioResponse.data), {
          filename: 'audio.wav',
          contentType: 'audio/wav',
        })
      } else {
        throw new Error('No audio data provided')
      }

      // Add transcription parameters
      formData.append('model', this.config.model)
      formData.append('response_format', this.config.responseFormat)
      formData.append('temperature', this.config.temperature.toString())
      
      if (request.language) {
        formData.append('language', request.language)
      }

      // Transcribe audio
      const response = await this.client.post('/v1/audio/transcriptions', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
      
      const transcriptionTime = Date.now() - startTime
      
      // Process response based on format
      let text = ''
      let segments: any[] = []
      
      if (this.config.responseFormat === 'json') {
        const data = response.data
        text = data.text || ''
        segments = data.segments || []
      } else {
        text = response.data
      }

      this.logger.info('Audio transcription completed', {
        textLength: text.length,
        segmentsCount: segments.length,
        transcriptionTime: `${transcriptionTime}ms`,
        language: request.language || 'auto',
      })

      return {
        text,
        language: request.language || 'auto',
        confidence: this.calculateConfidence(segments),
        segments: segments.map(segment => ({
          start: segment.start || 0,
          end: segment.end || 0,
          text: segment.text || '',
          confidence: segment.avg_logprob || 0,
        })),
        metadata: {
          model: this.config.model,
          provider: 'whisper',
          transcriptionTime,
          audioDuration: this.estimateAudioDuration(request),
          responseFormat: this.config.responseFormat,
        },
      }
    } catch (error) {
      const transcriptionTime = Date.now() - startTime
      this.logger.error('Whisper transcription failed', {
        error: (error as Error).message,
        transcriptionTime: `${transcriptionTime}ms`,
        language: request.language || 'auto',
      })
      throw error
    }
  }

  private calculateConfidence(segments: any[]): number {
    if (segments.length === 0) return 0
    
    const confidences = segments
      .map(segment => segment.avg_logprob || 0)
      .filter(conf => conf > 0)
    
    if (confidences.length === 0) return 0
    
    const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
    
    // Convert log probability to confidence percentage (0-100)
    return Math.max(0, Math.min(100, (averageConfidence + 1) * 50))
  }

  private estimateAudioDuration(request: STTRequest): number {
    // Rough estimation based on audio buffer size
    // This is a simplified calculation - in production, you'd use proper audio analysis
    if (request.audioBuffer) {
      // Assume 16-bit PCM at 16kHz sample rate
      const sampleRate = 16000
      const bytesPerSample = 2
      const duration = (request.audioBuffer.length / bytesPerSample) / sampleRate
      return Math.round(duration * 1000) // Return in milliseconds
    }
    return 0
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/models', { timeout: 5000 })
      return response.status === 200 && response.data.data.some((model: any) => 
        model.id.includes('whisper')
      )
    } catch (error) {
      this.logger.warn('Whisper not available', { error: (error as Error).message })
      return false
    }
  }

  async getModels(): Promise<Array<{ id: string; name: string; description: string }>> {
    try {
      const response = await this.client.get('/v1/models')
      return response.data.data
        .filter((model: any) => model.id.includes('whisper'))
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          description: `Whisper model: ${model.id}`,
        }))
    } catch (error) {
      this.logger.error('Failed to get Whisper models', { error: (error as Error).message })
      return []
    }
  }

  async getStatus(): Promise<{
    status: string
    models: Array<{ id: string; name: string; description: string }>
    supportedLanguages: string[]
    maxFileSize: number
  }> {
    try {
      const models = await this.getModels()
      const available = await this.isAvailable()
      
      return {
        status: available ? 'online' : 'offline',
        models,
        supportedLanguages: [
          'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
          'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs',
          'hu', 'ro', 'sk', 'sl', 'hr', 'bg', 'et', 'lv', 'lt', 'mt',
          'ga', 'cy', 'eu', 'ca', 'gl', 'is', 'mk', 'sq', 'sr', 'bs',
          'me', 'mk', 'sq', 'sr', 'bs', 'me', 'mk', 'sq', 'sr', 'bs',
        ],
        maxFileSize: 25 * 1024 * 1024, // 25MB
      }
    } catch (error) {
      this.logger.error('Failed to get Whisper status', { error: (error as Error).message })
      return {
        status: 'offline',
        models: [],
        supportedLanguages: [],
        maxFileSize: 0,
      }
    }
  }
}

// Singleton instance
export const whisperClient = new WhisperClient({
  endpoint: process.env.WHISPER_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.WHISPER_TIMEOUT || '60000'), // 1 minute
  maxRetries: parseInt(process.env.WHISPER_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.WHISPER_RETRY_DELAY || '1000'),
  model: process.env.WHISPER_MODEL || 'whisper-1',
  language: process.env.WHISPER_LANGUAGE,
  temperature: parseFloat(process.env.WHISPER_TEMPERATURE || '0'),
  responseFormat: process.env.WHISPER_RESPONSE_FORMAT || 'json',
})


