import { config } from './config'
import { ServiceData, ServiceMetrics } from '@/types/service.types'

// API response types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// API client class
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<T> = await response.json()
    
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed')
    }

    return data.data as T
  }

  // Health endpoints
  async getHealth(): Promise<{
    status: string
    uptime: number
    services: number
    healthy: number
    degraded: number
    down: number
  }> {
    return this.request('/api/health')
  }

  async getServiceHealth(serviceId: string): Promise<ServiceData> {
    return this.request(`/api/health/${serviceId}`)
  }

  // Metrics endpoints
  async getMetrics(): Promise<{
    totalRequests: number
    totalErrors: number
    avgResponseTime: number
    activeConnections: number
    services: Array<{
      id: string
      name: string
      status: string
      metrics: ServiceMetrics
    }>
  }> {
    return this.request('/api/metrics')
  }

  async getServiceMetrics(serviceId: string): Promise<ServiceMetrics> {
    return this.request(`/api/metrics/${serviceId}`)
  }

  // TTS endpoints
  async synthesizeSpeech(request: {
    text: string
    voice?: string
    language?: string
    speed?: number
    pitch?: number
    energy?: number
    emotion?: string
    batchMode?: boolean
  }): Promise<{
    audioUrl: string
    metadata: {
      text: string
      voice: string
      language: string
      speed: number
      pitch: number
      energy: number
      emotion: string
      batchMode: boolean
      provider: string
      synthesisTime: number
      audioSize: number
      sampleRate: number
      format: string
    }
  }> {
    return this.request('/api/tts/synthesize', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getTTSStatus(): Promise<{
    status: string
    voices: Array<{
      id: string
      name: string
      language: string
      gender: string
      description: string
    }>
    languages: Array<{
      code: string
      name: string
      voices: number
    }>
    supportedFormats: string[]
    maxTextLength: number
  }> {
    return this.request('/api/tts/status')
  }

  // STT endpoints
  async transcribeAudio(formData: FormData): Promise<{
    text: string
    language: string
    confidence: number
    segments: Array<{
      start: number
      end: number
      text: string
      confidence: number
    }>
    metadata: {
      model: string
      provider: string
      transcriptionTime: number
      audioDuration: number
      responseFormat: string
    }
  }> {
    const response = await fetch(`${this.baseUrl}/api/stt/transcribe`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<any> = await response.json()
    
    if (!data.success) {
      throw new Error(data.error?.message || 'STT request failed')
    }

    return data.data
  }

  async transcribeAudioFromUrl(request: {
    audioUrl: string
    language?: string
  }): Promise<{
    text: string
    language: string
    confidence: number
    segments: Array<{
      start: number
      end: number
      text: string
      confidence: number
    }>
    metadata: {
      model: string
      provider: string
      transcriptionTime: number
      audioDuration: number
      responseFormat: string
    }
  }> {
    return this.request('/api/stt/transcribe-url', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getSTTStatus(): Promise<{
    status: string
    models: Array<{
      id: string
      name: string
      description: string
    }>
    supportedLanguages: string[]
    maxFileSize: number
  }> {
    return this.request('/api/stt/status')
  }

  // Voice management endpoints
  async getVoices(): Promise<Array<{
    id: string
    name: string
    language: string
    gender: 'male' | 'female' | 'neutral'
    provider: string
    description: string
    sampleUrl?: string
    isDefault: boolean
    isPremium: boolean
    supportedFeatures: {
      speed: boolean
      pitch: boolean
      energy: boolean
      emotion: boolean
    }
    metadata: {
      age?: string
      accent?: string
      style?: string
      quality: 'low' | 'medium' | 'high' | 'premium'
    }
  }>> {
    return this.request('/api/voices')
  }

  async getVoice(voiceId: string): Promise<{
    id: string
    name: string
    language: string
    gender: 'male' | 'female' | 'neutral'
    provider: string
    description: string
    sampleUrl?: string
    isDefault: boolean
    isPremium: boolean
    supportedFeatures: {
      speed: boolean
      pitch: boolean
      energy: boolean
      emotion: boolean
    }
    metadata: {
      age?: string
      accent?: string
      style?: string
      quality: 'low' | 'medium' | 'high' | 'premium'
    }
  }> {
    return this.request(`/api/voices/${voiceId}`)
  }

  async getVoicesByLanguage(language: string): Promise<Array<{
    id: string
    name: string
    language: string
    gender: 'male' | 'female' | 'neutral'
    provider: string
    description: string
    sampleUrl?: string
    isDefault: boolean
    isPremium: boolean
    supportedFeatures: {
      speed: boolean
      pitch: boolean
      energy: boolean
      emotion: boolean
    }
    metadata: {
      age?: string
      accent?: string
      style?: string
      quality: 'low' | 'medium' | 'high' | 'premium'
    }
  }>> {
    return this.request(`/api/voices/language/${language}`)
  }

  async getDefaultVoice(language: string): Promise<{
    id: string
    name: string
    language: string
    gender: 'male' | 'female' | 'neutral'
    provider: string
    description: string
    sampleUrl?: string
    isDefault: boolean
    isPremium: boolean
    supportedFeatures: {
      speed: boolean
      pitch: boolean
      energy: boolean
      emotion: boolean
    }
    metadata: {
      age?: string
      accent?: string
      style?: string
      quality: 'low' | 'medium' | 'high' | 'premium'
    }
  }> {
    return this.request(`/api/voices/default/${language}`)
  }

  async searchVoices(query: string): Promise<Array<{
    id: string
    name: string
    language: string
    gender: 'male' | 'female' | 'neutral'
    provider: string
    description: string
    sampleUrl?: string
    isDefault: boolean
    isPremium: boolean
    supportedFeatures: {
      speed: boolean
      pitch: boolean
      energy: boolean
      emotion: boolean
    }
    metadata: {
      age?: string
      accent?: string
      style?: string
      quality: 'low' | 'medium' | 'high' | 'premium'
    }
  }>> {
    return this.request(`/api/voices/search/${encodeURIComponent(query)}`)
  }

  async getVoiceStats(): Promise<{
    total: number
    byLanguage: Record<string, number>
    byGender: Record<string, number>
    byProvider: Record<string, number>
    premium: number
    default: number
  }> {
    return this.request('/api/voices/stats/summary')
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(config.apiBaseUrl)
