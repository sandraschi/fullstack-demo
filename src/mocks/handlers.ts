import { http, HttpResponse } from 'msw'
import { generateMockServiceData, generateAllMockServices, simulateLatency, simulateError } from './data'
import { MOCK_SERVICES } from './data'

// Health check handler for all services
export const healthHandlers = [
  // Get health status for all services
  http.get('/api/health', async () => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' } },
        { status: 503 }
      )
    }
    
    const services = generateAllMockServices()
    const overallStatus = services.every(s => s.status === 'healthy') ? 'healthy' :
                         services.some(s => s.status === 'down') ? 'down' : 'degraded'
    
    return HttpResponse.json({
      success: true,
      data: {
        status: overallStatus,
        uptime: 99.97,
        services: services.length,
        healthy: services.filter(s => s.status === 'healthy').length,
        degraded: services.filter(s => s.status === 'degraded').length,
        down: services.filter(s => s.status === 'down').length
      }
    })
  }),

  // Get health status for specific service
  http.get('/api/health/:serviceId', async ({ params }) => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' } },
        { status: 503 }
      )
    }
    
    const { serviceId } = params
    const service = MOCK_SERVICES.find(s => s.id === serviceId)
    
    if (!service) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } },
        { status: 404 }
      )
    }
    
    const serviceData = generateMockServiceData(service.id, service.name)
    
    return HttpResponse.json({
      success: true,
      data: serviceData
    })
  })
]

// Metrics handlers
export const metricsHandlers = [
  // Get metrics for all services
  http.get('/api/metrics', async () => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Metrics service unavailable' } },
        { status: 503 }
      )
    }
    
    const services = generateAllMockServices()
    
    return HttpResponse.json({
      success: true,
      data: {
        totalRequests: services.reduce((sum, s) => sum + s.metrics.requestRate, 0),
        totalErrors: services.reduce((sum, s) => sum + s.metrics.errorRate * s.metrics.requestRate, 0),
        avgResponseTime: services.reduce((sum, s) => sum + s.metrics.responseTime.p50, 0) / services.length,
        activeConnections: services.reduce((sum, s) => sum + s.metrics.activeConnections, 0),
        services: services.map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
          metrics: s.metrics
        }))
      }
    })
  }),

  // Get metrics for specific service
  http.get('/api/metrics/:serviceId', async ({ params }) => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Metrics service unavailable' } },
        { status: 503 }
      )
    }
    
    const { serviceId } = params
    const service = MOCK_SERVICES.find(s => s.id === serviceId)
    
    if (!service) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } },
        { status: 404 }
      )
    }
    
    const serviceData = generateMockServiceData(service.id, service.name)
    
    return HttpResponse.json({
      success: true,
      data: serviceData.metrics
    })
  })
]

// TTS/STT handlers
export const ttsSttHandlers = [
  // TTS synthesize
  http.post('/api/tts/synthesize', async ({ request }) => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'TTS_SYNTHESIS_ERROR', message: 'TTS service temporarily unavailable' } },
        { status: 503 }
      )
    }
    
    const body = await request.json() as any
    const { text, voice = 'coqui-female-en', language = 'en', speed = 1.0, pitch = 1.0, energy = 1.0, emotion = 'neutral', batchMode = false } = body
    
    return HttpResponse.json({
      success: true,
      data: {
        audioUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
        metadata: {
          text,
          voice,
          language,
          speed,
          pitch,
          energy,
          emotion,
          batchMode,
          provider: 'coqui',
          synthesisTime: Math.floor(Math.random() * 2000) + 500,
          audioSize: Math.floor(Math.random() * 1000000) + 500000,
          sampleRate: 22050,
          format: 'wav',
        }
      }
    })
  }),

  // TTS status
  http.get('/api/tts/status', async () => {
    await simulateLatency()
    
    return HttpResponse.json({
      success: true,
      data: {
        status: 'online',
        voices: [
          { id: 'coqui-female-en', name: 'Sarah', language: 'en', gender: 'female', description: 'Natural female English voice' },
          { id: 'coqui-male-en', name: 'David', language: 'en', gender: 'male', description: 'Natural male English voice' },
          { id: 'coqui-female-es', name: 'Maria', language: 'es', gender: 'female', description: 'Natural female Spanish voice' },
          { id: 'coqui-male-es', name: 'Carlos', language: 'es', gender: 'male', description: 'Natural male Spanish voice' },
          { id: 'coqui-female-fr', name: 'Sophie', language: 'fr', gender: 'female', description: 'Natural female French voice' },
          { id: 'coqui-male-fr', name: 'Pierre', language: 'fr', gender: 'male', description: 'Natural male French voice' },
        ],
        languages: [
          { code: 'en', name: 'English', voices: 2 },
          { code: 'es', name: 'Spanish', voices: 2 },
          { code: 'fr', name: 'French', voices: 2 },
        ],
        supportedFormats: ['wav', 'mp3', 'ogg'],
        maxTextLength: 5000,
      }
    })
  }),

  // STT transcribe
  http.post('/api/stt/transcribe', async ({ request }) => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'STT_TRANSCRIPTION_ERROR', message: 'STT service temporarily unavailable' } },
        { status: 503 }
      )
    }
    
    const formData = await request.formData()
    const language = formData.get('language') as string || 'auto'
    
    return HttpResponse.json({
      success: true,
      data: {
        text: 'This is a mock transcription of the uploaded audio file. The actual transcription would be generated by Whisper STT.',
        language: language === 'auto' ? 'en' : language,
        confidence: Math.random() * 20 + 80, // 80-100%
        segments: [
          { start: 0, end: 2.5, text: 'This is a mock transcription', confidence: 0.95 },
          { start: 2.5, end: 5.0, text: 'of the uploaded audio file.', confidence: 0.92 },
          { start: 5.0, end: 8.0, text: 'The actual transcription would be generated by Whisper STT.', confidence: 0.88 },
        ],
        metadata: {
          model: 'whisper-1',
          provider: 'whisper',
          transcriptionTime: Math.floor(Math.random() * 3000) + 1000,
          audioDuration: Math.floor(Math.random() * 30000) + 5000,
          responseFormat: 'json',
        }
      }
    })
  }),

  // STT transcribe from URL
  http.post('/api/stt/transcribe-url', async ({ request }) => {
    await simulateLatency()
    
    if (simulateError()) {
      return HttpResponse.json(
        { success: false, error: { code: 'STT_URL_TRANSCRIPTION_ERROR', message: 'STT service temporarily unavailable' } },
        { status: 503 }
      )
    }
    
    const body = await request.json() as any
    const { audioUrl, language = 'auto' } = body
    
    return HttpResponse.json({
      success: true,
      data: {
        text: 'This is a mock transcription of the audio from the provided URL. The actual transcription would be generated by Whisper STT.',
        language: language === 'auto' ? 'en' : language,
        confidence: Math.random() * 20 + 80, // 80-100%
        segments: [
          { start: 0, end: 3.0, text: 'This is a mock transcription', confidence: 0.94 },
          { start: 3.0, end: 6.0, text: 'of the audio from the provided URL.', confidence: 0.91 },
          { start: 6.0, end: 9.0, text: 'The actual transcription would be generated by Whisper STT.', confidence: 0.89 },
        ],
        metadata: {
          model: 'whisper-1',
          provider: 'whisper',
          transcriptionTime: Math.floor(Math.random() * 3000) + 1000,
          audioDuration: Math.floor(Math.random() * 30000) + 5000,
          responseFormat: 'json',
        }
      }
    })
  }),

  // STT status
  http.get('/api/stt/status', async () => {
    await simulateLatency()
    
    return HttpResponse.json({
      success: true,
      data: {
        status: 'online',
        models: [
          { id: 'whisper-1', name: 'Whisper 1', description: 'OpenAI Whisper model' },
        ],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
        maxFileSize: 25 * 1024 * 1024, // 25MB
      }
    })
  }),

  // Voice management
  http.get('/api/voices', async () => {
    await simulateLatency()
    
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'coqui-female-en',
          name: 'Sarah',
          language: 'en',
          gender: 'female',
          provider: 'coqui',
          description: 'Natural female English voice with clear pronunciation',
          isDefault: true,
          isPremium: false,
          supportedFeatures: { speed: true, pitch: true, energy: true, emotion: false },
          metadata: { age: 'adult', accent: 'american', style: 'neutral', quality: 'high' },
        },
        {
          id: 'coqui-male-en',
          name: 'David',
          language: 'en',
          gender: 'male',
          provider: 'coqui',
          description: 'Natural male English voice with warm tone',
          isDefault: true,
          isPremium: false,
          supportedFeatures: { speed: true, pitch: true, energy: true, emotion: false },
          metadata: { age: 'adult', accent: 'american', style: 'neutral', quality: 'high' },
        },
        {
          id: 'coqui-female-es',
          name: 'Maria',
          language: 'es',
          gender: 'female',
          provider: 'coqui',
          description: 'Natural female Spanish voice with clear pronunciation',
          isDefault: false,
          isPremium: false,
          supportedFeatures: { speed: true, pitch: true, energy: true, emotion: false },
          metadata: { age: 'adult', accent: 'castilian', style: 'neutral', quality: 'high' },
        },
        {
          id: 'coqui-male-es',
          name: 'Carlos',
          language: 'es',
          gender: 'male',
          provider: 'coqui',
          description: 'Natural male Spanish voice with warm tone',
          isDefault: false,
          isPremium: false,
          supportedFeatures: { speed: true, pitch: true, energy: true, emotion: false },
          metadata: { age: 'adult', accent: 'castilian', style: 'neutral', quality: 'high' },
        },
        {
          id: 'coqui-female-fr',
          name: 'Sophie',
          language: 'fr',
          gender: 'female',
          provider: 'coqui',
          description: 'Natural female French voice with elegant pronunciation',
          isDefault: false,
          isPremium: false,
          supportedFeatures: { speed: true, pitch: true, energy: true, emotion: false },
          metadata: { age: 'adult', accent: 'parisian', style: 'neutral', quality: 'high' },
        },
        {
          id: 'coqui-male-fr',
          name: 'Pierre',
          language: 'fr',
          gender: 'male',
          provider: 'coqui',
          description: 'Natural male French voice with sophisticated tone',
          isDefault: false,
          isPremium: false,
          supportedFeatures: { speed: true, pitch: true, energy: true, emotion: false },
          metadata: { age: 'adult', accent: 'parisian', style: 'neutral', quality: 'high' },
        },
      ]
    })
  }),

  // Voice stats
  http.get('/api/voices/stats/summary', async () => {
    await simulateLatency()
    
    return HttpResponse.json({
      success: true,
      data: {
        total: 6,
        byLanguage: { en: 2, es: 2, fr: 2 },
        byGender: { female: 3, male: 3 },
        byProvider: { coqui: 6 },
        premium: 0,
        default: 2,
      }
    })
  }),
]

// Combine all handlers
export const handlers = [
  ...healthHandlers,
  ...metricsHandlers,
  ...ttsSttHandlers
]
