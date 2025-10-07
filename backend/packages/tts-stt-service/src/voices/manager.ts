// Voice management system for TTS/STT Service

import { createLogger } from '@shared/utils/logger'
import { coquiClient } from '../coqui/client'

const logger = createLogger('tts-stt-service-voices')

export interface Voice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  provider: 'coqui' | 'openai' | 'azure' | 'aws'
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
}

export interface Language {
  code: string
  name: string
  nativeName: string
  voices: number
  isSupported: boolean
  providers: string[]
}

export const DEFAULT_VOICES: Record<string, Voice> = {
  'coqui-female-en': {
    id: 'coqui-female-en',
    name: 'Sarah',
    language: 'en',
    gender: 'female',
    provider: 'coqui',
    description: 'Natural female English voice with clear pronunciation',
    isDefault: true,
    isPremium: false,
    supportedFeatures: {
      speed: true,
      pitch: true,
      energy: true,
      emotion: false,
    },
    metadata: {
      age: 'adult',
      accent: 'american',
      style: 'neutral',
      quality: 'high',
    },
  },
  'coqui-male-en': {
    id: 'coqui-male-en',
    name: 'David',
    language: 'en',
    gender: 'male',
    provider: 'coqui',
    description: 'Natural male English voice with warm tone',
    isDefault: true,
    isPremium: false,
    supportedFeatures: {
      speed: true,
      pitch: true,
      energy: true,
      emotion: false,
    },
    metadata: {
      age: 'adult',
      accent: 'american',
      style: 'neutral',
      quality: 'high',
    },
  },
  'coqui-female-es': {
    id: 'coqui-female-es',
    name: 'Maria',
    language: 'es',
    gender: 'female',
    provider: 'coqui',
    description: 'Natural female Spanish voice with clear pronunciation',
    isDefault: false,
    isPremium: false,
    supportedFeatures: {
      speed: true,
      pitch: true,
      energy: true,
      emotion: false,
    },
    metadata: {
      age: 'adult',
      accent: 'castilian',
      style: 'neutral',
      quality: 'high',
    },
  },
  'coqui-male-es': {
    id: 'coqui-male-es',
    name: 'Carlos',
    language: 'es',
    gender: 'male',
    provider: 'coqui',
    description: 'Natural male Spanish voice with warm tone',
    isDefault: false,
    isPremium: false,
    supportedFeatures: {
      speed: true,
      pitch: true,
      energy: true,
      emotion: false,
    },
    metadata: {
      age: 'adult',
      accent: 'castilian',
      style: 'neutral',
      quality: 'high',
    },
  },
  'coqui-female-fr': {
    id: 'coqui-female-fr',
    name: 'Sophie',
    language: 'fr',
    gender: 'female',
    provider: 'coqui',
    description: 'Natural female French voice with elegant pronunciation',
    isDefault: false,
    isPremium: false,
    supportedFeatures: {
      speed: true,
      pitch: true,
      energy: true,
      emotion: false,
    },
    metadata: {
      age: 'adult',
      accent: 'parisian',
      style: 'neutral',
      quality: 'high',
    },
  },
  'coqui-male-fr': {
    id: 'coqui-male-fr',
    name: 'Pierre',
    language: 'fr',
    gender: 'male',
    provider: 'coqui',
    description: 'Natural male French voice with sophisticated tone',
    isDefault: false,
    isPremium: false,
    supportedFeatures: {
      speed: true,
      pitch: true,
      energy: true,
      emotion: false,
    },
    metadata: {
      age: 'adult',
      accent: 'parisian',
      style: 'neutral',
      quality: 'high',
    },
  },
}

export const SUPPORTED_LANGUAGES: Record<string, Language> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    voices: 2,
    isSupported: true,
    providers: ['coqui', 'openai', 'azure', 'aws'],
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    voices: 2,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    voices: 2,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'de': {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'it': {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'pt': {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'ru': {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
  'zh': {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    voices: 0,
    isSupported: true,
    providers: ['coqui', 'azure', 'aws'],
  },
}

export class VoiceManager {
  private voices: Map<string, Voice> = new Map()
  private languages: Map<string, Language> = new Map()

  constructor() {
    // Initialize with default voices
    Object.values(DEFAULT_VOICES).forEach(voice => {
      this.voices.set(voice.id, voice)
    })
    
    // Initialize with supported languages
    Object.values(SUPPORTED_LANGUAGES).forEach(language => {
      this.languages.set(language.code, language)
    })
    
    logger.info('Voice Manager initialized', {
      voices: Array.from(this.voices.keys()),
      languages: Array.from(this.languages.keys()),
    })
  }

  async loadCoquiVoices(): Promise<void> {
    try {
      const coquiVoices = await coquiClient.getVoices()
      
      coquiVoices.forEach(voice => {
        const voiceId = `coqui-${voice.gender}-${voice.language}`
        const existingVoice = this.voices.get(voiceId)
        
        if (!existingVoice) {
          const newVoice: Voice = {
            id: voiceId,
            name: voice.name,
            language: voice.language,
            gender: voice.gender as 'male' | 'female' | 'neutral',
            provider: 'coqui',
            description: voice.description,
            isDefault: false,
            isPremium: false,
            supportedFeatures: {
              speed: true,
              pitch: true,
              energy: true,
              emotion: false,
            },
            metadata: {
              age: 'adult',
              accent: 'neutral',
              style: 'neutral',
              quality: 'high',
            },
          }
          
          this.voices.set(voiceId, newVoice)
        }
      })
      
      logger.info('Coqui voices loaded', { count: coquiVoices.length })
    } catch (error) {
      logger.warn('Failed to load Coqui voices', { error: (error as Error).message })
    }
  }

  getVoice(voiceId: string): Voice | null {
    return this.voices.get(voiceId) || null
  }

  getAllVoices(): Voice[] {
    return Array.from(this.voices.values())
  }

  getVoicesByLanguage(language: string): Voice[] {
    return this.getAllVoices().filter(voice => voice.language === language)
  }

  getVoicesByGender(gender: 'male' | 'female' | 'neutral'): Voice[] {
    return this.getAllVoices().filter(voice => voice.gender === gender)
  }

  getVoicesByProvider(provider: string): Voice[] {
    return this.getAllVoices().filter(voice => voice.provider === provider)
  }

  getDefaultVoice(language: string = 'en'): Voice | null {
    const languageVoices = this.getVoicesByLanguage(language)
    return languageVoices.find(voice => voice.isDefault) || languageVoices[0] || null
  }

  searchVoices(query: string): Voice[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllVoices().filter(voice =>
      voice.name.toLowerCase().includes(lowercaseQuery) ||
      voice.description.toLowerCase().includes(lowercaseQuery) ||
      voice.language.toLowerCase().includes(lowercaseQuery) ||
      voice.gender.toLowerCase().includes(lowercaseQuery)
    )
  }

  getLanguage(languageCode: string): Language | null {
    return this.languages.get(languageCode) || null
  }

  getAllLanguages(): Language[] {
    return Array.from(this.languages.values())
  }

  getSupportedLanguages(): Language[] {
    return this.getAllLanguages().filter(language => language.isSupported)
  }

  getLanguagesByProvider(provider: string): Language[] {
    return this.getAllLanguages().filter(language => 
      language.providers.includes(provider)
    )
  }

  searchLanguages(query: string): Language[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllLanguages().filter(language =>
      language.name.toLowerCase().includes(lowercaseQuery) ||
      language.nativeName.toLowerCase().includes(lowercaseQuery) ||
      language.code.toLowerCase().includes(lowercaseQuery)
    )
  }

  addVoice(voice: Voice): void {
    this.voices.set(voice.id, voice)
    logger.info('Voice added', { voiceId: voice.id, name: voice.name })
  }

  removeVoice(voiceId: string): boolean {
    const removed = this.voices.delete(voiceId)
    if (removed) {
      logger.info('Voice removed', { voiceId })
    }
    return removed
  }

  updateVoice(voiceId: string, updates: Partial<Voice>): boolean {
    const voice = this.voices.get(voiceId)
    if (voice) {
      Object.assign(voice, updates)
      logger.info('Voice updated', { voiceId, updates: Object.keys(updates) })
      return true
    }
    return false
  }

  getVoiceStats(): {
    total: number
    byLanguage: Record<string, number>
    byGender: Record<string, number>
    byProvider: Record<string, number>
    premium: number
    default: number
  } {
    const voices = this.getAllVoices()
    const byLanguage: Record<string, number> = {}
    const byGender: Record<string, number> = {}
    const byProvider: Record<string, number> = {}
    
    voices.forEach(voice => {
      byLanguage[voice.language] = (byLanguage[voice.language] || 0) + 1
      byGender[voice.gender] = (byGender[voice.gender] || 0) + 1
      byProvider[voice.provider] = (byProvider[voice.provider] || 0) + 1
    })
    
    return {
      total: voices.length,
      byLanguage,
      byGender,
      byProvider,
      premium: voices.filter(voice => voice.isPremium).length,
      default: voices.filter(voice => voice.isDefault).length,
    }
  }
}

// Singleton instance
export const voiceManager = new VoiceManager()

// Load Coqui voices on startup
voiceManager.loadCoquiVoices().catch(error => {
  logger.error('Failed to load Coqui voices on startup', { error: error.message })
})


