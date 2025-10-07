// LLM Manager - Handles provider selection and fallback

import { ChatRequest, ChatResponse } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'
import { 
  BaseLLMProvider, 
  LMStudioProvider, 
  OllamaProvider, 
  OpenAIProvider, 
  AnthropicProvider,
  LLMProviderConfig 
} from './providers'

const logger = createLogger('chat-service-llm-manager')

export class LLMManager {
  private providers: BaseLLMProvider[] = []
  private preferredProvider: string | null = null
  private fallbackOrder: string[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Local LLM providers (preferred)
    if (process.env.LM_STUDIO_URL) {
      this.providers.push(new LMStudioProvider({
        name: 'lm-studio',
        type: 'local',
        endpoint: process.env.LM_STUDIO_URL,
        model: process.env.LM_STUDIO_MODEL || 'llama2',
        maxTokens: parseInt(process.env.LM_STUDIO_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.LM_STUDIO_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.LM_STUDIO_TIMEOUT || '30000'),
      }))
    }

    if (process.env.OLLAMA_URL) {
      this.providers.push(new OllamaProvider({
        name: 'ollama',
        type: 'local',
        endpoint: process.env.OLLAMA_URL,
        model: process.env.OLLAMA_MODEL || 'llama2',
        maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000'),
      }))
    }

    // Cloud LLM providers (fallback)
    if (process.env.OPENAI_API_KEY) {
      this.providers.push(new OpenAIProvider({
        name: 'openai',
        type: 'cloud',
        endpoint: 'https://api.openai.com',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'),
      }))
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.push(new AnthropicProvider({
        name: 'anthropic',
        type: 'cloud',
        endpoint: 'https://api.anthropic.com',
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '2048'),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
        timeout: parseInt(process.env.ANTHROPIC_TIMEOUT || '30000'),
      }))
    }

    // Set fallback order: local first, then cloud
    this.fallbackOrder = this.providers
      .sort((a, b) => {
        if (a.config.type === 'local' && b.config.type === 'cloud') return -1
        if (a.config.type === 'cloud' && b.config.type === 'local') return 1
        return 0
      })
      .map(p => p.config.name)

    logger.info('LLM Manager initialized', {
      providers: this.providers.map(p => p.config.name),
      fallbackOrder: this.fallbackOrder,
    })
  }

  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now()
    
    try {
      // Try preferred provider first
      if (this.preferredProvider) {
        const provider = this.providers.find(p => p.config.name === this.preferredProvider)
        if (provider && await provider.isAvailable()) {
          logger.info('Using preferred provider', { provider: this.preferredProvider })
          return await this.tryProvider(provider, request)
        }
      }

      // Try providers in fallback order
      for (const providerName of this.fallbackOrder) {
        const provider = this.providers.find(p => p.config.name === providerName)
        if (provider && await provider.isAvailable()) {
          logger.info('Using fallback provider', { provider: providerName })
          return await this.tryProvider(provider, request)
        }
      }

      throw new Error('No available LLM providers')
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('LLM generation failed', {
        error: (error as Error).message,
        duration: `${duration}ms`,
        providers: this.providers.map(p => p.config.name),
      })
      throw error
    }
  }

  private async tryProvider(provider: BaseLLMProvider, request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now()
    
    try {
      const response = await provider.generateResponse(request)
      const duration = Date.now() - startTime
      
      logger.info('LLM response generated', {
        provider: provider.config.name,
        model: provider.config.model,
        duration: `${duration}ms`,
        tokens: response.usage.totalTokens,
      })
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      logger.warn('Provider failed', {
        provider: provider.config.name,
        error: (error as Error).message,
        duration: `${duration}ms`,
      })
      throw error
    }
  }

  async checkProviderHealth(): Promise<Array<{ name: string; available: boolean; type: string }>> {
    const healthChecks = await Promise.allSettled(
      this.providers.map(async (provider) => {
        const available = await provider.isAvailable()
        return {
          name: provider.config.name,
          available,
          type: provider.config.type,
        }
      })
    )

    return healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          name: this.providers[index].config.name,
          available: false,
          type: this.providers[index].config.type,
        }
      }
    })
  }

  setPreferredProvider(providerName: string): void {
    const provider = this.providers.find(p => p.config.name === providerName)
    if (provider) {
      this.preferredProvider = providerName
      logger.info('Preferred provider set', { provider: providerName })
    } else {
      logger.warn('Provider not found', { provider: providerName })
    }
  }

  getAvailableProviders(): Array<{ name: string; type: string; model: string }> {
    return this.providers.map(provider => ({
      name: provider.config.name,
      type: provider.config.type,
      model: provider.config.model,
    }))
  }

  async getProviderStatus(): Promise<Array<{ name: string; available: boolean; type: string; model: string }>> {
    const health = await this.checkProviderHealth()
    return health.map(h => ({
      ...h,
      model: this.providers.find(p => p.config.name === h.name)?.config.model || 'unknown',
    }))
  }
}

// Singleton instance
export const llmManager = new LLMManager()


