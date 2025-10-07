// Coqui TTS client for text-to-speech conversion

import axios, { AxiosInstance } from 'axios'
import { TTSRequest, TTSResponse } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('tts-stt-service-coqui')

export interface CoquiConfig {
  endpoint: string
  timeout: number
  maxRetries: number
  retryDelay: number
  defaultVoice: string
  defaultLanguage: string
  defaultSpeed: number
  defaultPitch: number
  defaultEnergy: number
}

export class CoquiClient {
  private config: CoquiConfig
  private client: AxiosInstance
  private logger = logger

  constructor(config: CoquiConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Synthesizing speech with Coqui TTS', {
        textLength: request.text.length,
        voice: request.voice || this.config.defaultVoice,
        language: request.language || this.config.defaultLanguage,
        speed: request.speed || this.config.defaultSpeed,
      })

      // Prepare TTS request
      const ttsRequest = {
        text: request.text,
        voice: request.voice || this.config.defaultVoice,
        language: request.language || this.config.defaultLanguage,
        speed: request.speed || this.config.defaultSpeed,
        pitch: request.pitch || this.config.defaultPitch,
        energy: request.energy || this.config.defaultEnergy,
        output_format: 'wav',
        sample_rate: 22050,
      }

      // Generate speech
      const response = await this.client.post('/api/tts', ttsRequest, {
        responseType: 'arraybuffer',
      })
      
      const synthesisTime = Date.now() - startTime
      
      // Save audio to storage (in production, this would be cloud storage)
      const audioUrl = await this.saveAudio(response.data, request)

      this.logger.info('Speech synthesis completed', {
        textLength: request.text.length,
        audioSize: response.data.byteLength,
        synthesisTime: `${synthesisTime}ms`,
        voice: request.voice || this.config.defaultVoice,
        audioUrl,
      })

      return {
        audioUrl,
        metadata: {
          text: request.text,
          voice: request.voice || this.config.defaultVoice,
          language: request.language || this.config.defaultLanguage,
          speed: request.speed || this.config.defaultSpeed,
          pitch: request.pitch || this.config.defaultPitch,
          energy: request.energy || this.config.defaultEnergy,
          provider: 'coqui',
          synthesisTime,
          audioSize: response.data.byteLength,
          sampleRate: 22050,
          format: 'wav',
        },
      }
    } catch (error) {
      const synthesisTime = Date.now() - startTime
      this.logger.error('Coqui TTS synthesis failed', {
        error: (error as Error).message,
        textLength: request.text.length,
        synthesisTime: `${synthesisTime}ms`,
        voice: request.voice || this.config.defaultVoice,
      })
      throw error
    }
  }

  private async saveAudio(audioData: ArrayBuffer, request: TTSRequest): Promise<string> {
    try {
      // In production, this would save to cloud storage (S3, GCS, etc.)
      // For now, we'll return a mock URL
      const audioId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const audioUrl = `https://picsum.photos/200/200?random=${audioId}` // Mock URL
      
      this.logger.info('Audio saved', { audioId, audioUrl })
      return audioUrl
    } catch (error) {
      this.logger.error('Failed to save audio', { error: (error as Error).message })
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/voices', { timeout: 5000 })
      return response.status === 200 && response.data.voices.length > 0
    } catch (error) {
      this.logger.warn('Coqui TTS not available', { error: (error as Error).message })
      return false
    }
  }

  async getVoices(): Promise<Array<{ id: string; name: string; language: string; gender: string; description: string }>> {
    try {
      const response = await this.client.get('/api/voices')
      return response.data.voices.map((voice: any) => ({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender,
        description: `${voice.name} (${voice.language}) - ${voice.gender}`,
      }))
    } catch (error) {
      this.logger.error('Failed to get Coqui voices', { error: (error as Error).message })
      return []
    }
  }

  async getLanguages(): Promise<Array<{ code: string; name: string; voices: number }>> {
    try {
      const voices = await this.getVoices()
      const languageMap = new Map<string, number>()
      
      voices.forEach(voice => {
        const count = languageMap.get(voice.language) || 0
        languageMap.set(voice.language, count + 1)
      })
      
      return Array.from(languageMap.entries()).map(([code, count]) => ({
        code,
        name: this.getLanguageName(code),
        voices: count,
      }))
    } catch (error) {
      this.logger.error('Failed to get Coqui languages', { error: (error as Error).message })
      return []
    }
  }

  private getLanguageName(code: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'tr': 'Turkish',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'hr': 'Croatian',
      'bg': 'Bulgarian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'mt': 'Maltese',
      'ga': 'Irish',
      'cy': 'Welsh',
      'eu': 'Basque',
      'ca': 'Catalan',
      'gl': 'Galician',
      'is': 'Icelandic',
      'mk': 'Macedonian',
      'sq': 'Albanian',
      'sr': 'Serbian',
      'bs': 'Bosnian',
      'me': 'Montenegrin',
    }
    
    return languageNames[code] || code
  }

  async getStatus(): Promise<{
    status: string
    voices: Array<{ id: string; name: string; language: string; gender: string; description: string }>
    languages: Array<{ code: string; name: string; voices: number }>
    supportedFormats: string[]
    maxTextLength: number
  }> {
    try {
      const voices = await this.getVoices()
      const languages = await this.getLanguages()
      const available = await this.isAvailable()
      
      return {
        status: available ? 'online' : 'offline',
        voices,
        languages,
        supportedFormats: ['wav', 'mp3', 'ogg'],
        maxTextLength: 5000, // 5000 characters
      }
    } catch (error) {
      this.logger.error('Failed to get Coqui status', { error: (error as Error).message })
      return {
        status: 'offline',
        voices: [],
        languages: [],
        supportedFormats: [],
        maxTextLength: 0,
      }
    }
  }
}

// Singleton instance
export const coquiClient = new CoquiClient({
  endpoint: process.env.COQUI_TTS_URL || 'http://localhost:8001',
  timeout: parseInt(process.env.COQUI_TTS_TIMEOUT || '60000'), // 1 minute
  maxRetries: parseInt(process.env.COQUI_TTS_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.COQUI_TTS_RETRY_DELAY || '1000'),
  defaultVoice: process.env.COQUI_TTS_DEFAULT_VOICE || 'female',
  defaultLanguage: process.env.COQUI_TTS_DEFAULT_LANGUAGE || 'en',
  defaultSpeed: parseFloat(process.env.COQUI_TTS_DEFAULT_SPEED || '1.0'),
  defaultPitch: parseFloat(process.env.COQUI_TTS_DEFAULT_PITCH || '1.0'),
  defaultEnergy: parseFloat(process.env.COQUI_TTS_DEFAULT_ENERGY || '1.0'),
})


