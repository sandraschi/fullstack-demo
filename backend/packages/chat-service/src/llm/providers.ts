// LLM Provider abstraction for local and cloud LLMs

import axios, { AxiosInstance } from 'axios'
import { LLMProvider, ChatRequest, ChatResponse, ChatMessage } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('chat-service-llm')

export interface LLMProviderConfig {
  name: string
  type: 'local' | 'cloud'
  endpoint: string
  apiKey?: string
  model: string
  maxTokens: number
  temperature: number
  timeout: number
}

export abstract class BaseLLMProvider {
  protected config: LLMProviderConfig
  protected client: AxiosInstance
  protected logger = logger

  constructor(config: LLMProviderConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      },
    })
  }

  abstract generateResponse(request: ChatRequest): Promise<ChatResponse>
  
  abstract isAvailable(): Promise<boolean>

  protected formatMessages(messages: ChatMessage[]): any {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  protected createResponse(
    message: ChatMessage,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
    finishReason: string = 'stop'
  ): ChatResponse {
    return {
      message,
      usage,
      provider: this.config.name,
      model: this.config.model,
      finishReason,
    }
  }
}

// LM Studio Provider (Local)
export class LMStudioProvider extends BaseLLMProvider {
  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.info('Generating response with LM Studio', {
        model: this.config.model,
        messageCount: request.messages.length,
      })

      const response = await this.client.post('/v1/chat/completions', {
        model: this.config.model,
        messages: this.formatMessages(request.messages),
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature,
        stream: false,
      })

      const choice = response.data.choices[0]
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: choice.message.content,
        timestamp: new Date().toISOString(),
        metadata: {
          model: this.config.model,
          provider: 'lm-studio',
        },
      }

      const usage = {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      }

      return this.createResponse(message, usage, choice.finish_reason)
    } catch (error) {
      this.logger.error('LM Studio request failed', {
        error: (error as Error).message,
        model: this.config.model,
      })
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/models', { timeout: 5000 })
      return response.status === 200 && response.data.data.length > 0
    } catch (error) {
      this.logger.warn('LM Studio not available', { error: (error as Error).message })
      return false
    }
  }
}

// Ollama Provider (Local)
export class OllamaProvider extends BaseLLMProvider {
  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.info('Generating response with Ollama', {
        model: this.config.model,
        messageCount: request.messages.length,
      })

      const response = await this.client.post('/api/chat', {
        model: this.config.model,
        messages: this.formatMessages(request.messages),
        options: {
          num_predict: request.maxTokens || this.config.maxTokens,
          temperature: request.temperature || this.config.temperature,
        },
        stream: false,
      })

      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.data.message.content,
        timestamp: new Date().toISOString(),
        metadata: {
          model: this.config.model,
          provider: 'ollama',
        },
      }

      // Ollama doesn't provide token usage, estimate based on content length
      const promptTokens = Math.floor(request.messages.reduce((acc, msg) => acc + msg.content.length, 0) / 4)
      const completionTokens = Math.floor(message.content.length / 4)
      const usage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      }

      return this.createResponse(message, usage, 'stop')
    } catch (error) {
      this.logger.error('Ollama request failed', {
        error: (error as Error).message,
        model: this.config.model,
      })
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags', { timeout: 5000 })
      return response.status === 200 && response.data.models.length > 0
    } catch (error) {
      this.logger.warn('Ollama not available', { error: (error as Error).message })
      return false
    }
  }
}

// OpenAI Provider (Cloud)
export class OpenAIProvider extends BaseLLMProvider {
  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.info('Generating response with OpenAI', {
        model: this.config.model,
        messageCount: request.messages.length,
      })

      const response = await this.client.post('/v1/chat/completions', {
        model: this.config.model,
        messages: this.formatMessages(request.messages),
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature,
        stream: false,
      })

      const choice = response.data.choices[0]
      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: choice.message.content,
        timestamp: new Date().toISOString(),
        metadata: {
          model: this.config.model,
          provider: 'openai',
        },
      }

      const usage = {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      }

      return this.createResponse(message, usage, choice.finish_reason)
    } catch (error) {
      this.logger.error('OpenAI request failed', {
        error: (error as Error).message,
        model: this.config.model,
      })
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/models', { timeout: 5000 })
      return response.status === 200 && response.data.data.length > 0
    } catch (error) {
      this.logger.warn('OpenAI not available', { error: (error as Error).message })
      return false
    }
  }
}

// Anthropic Provider (Cloud)
export class AnthropicProvider extends BaseLLMProvider {
  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      this.logger.info('Generating response with Anthropic', {
        model: this.config.model,
        messageCount: request.messages.length,
      })

      const response = await this.client.post('/v1/messages', {
        model: this.config.model,
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature || this.config.temperature,
        messages: this.formatMessages(request.messages),
      })

      const message: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.data.content[0].text,
        timestamp: new Date().toISOString(),
        metadata: {
          model: this.config.model,
          provider: 'anthropic',
        },
      }

      const usage = {
        promptTokens: response.data.usage.input_tokens,
        completionTokens: response.data.usage.output_tokens,
        totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
      }

      return this.createResponse(message, usage, response.data.stop_reason)
    } catch (error) {
      this.logger.error('Anthropic request failed', {
        error: (error as Error).message,
        model: this.config.model,
      })
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, so we'll just check if the API key is valid
      return !!this.config.apiKey
    } catch (error) {
      this.logger.warn('Anthropic not available', { error: (error as Error).message })
      return false
    }
  }
}


