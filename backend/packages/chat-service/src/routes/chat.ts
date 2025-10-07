// Chat routes for Chat Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { chatRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse, ChatRequest, ChatResponse } from '@shared/types/common.types'
import { llmManager } from '../llm/manager'
import { characterManager } from '../characters/characters'
import { conversationStorage } from '../history/storage'

const router = Router()
const logger = createLogger('chat-service')

// Generate chat response
router.post('/', chatRateLimiter, async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    const chatRequest: ChatRequest = req.body
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    
    logger.info('Chat request received', {
      character: chatRequest.character,
      messageCount: chatRequest.messages.length,
      provider: chatRequest.provider,
      userId,
    }, requestId)

    // Validate request
    if (!chatRequest.messages || chatRequest.messages.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Messages array is required and cannot be empty',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const lastMessage = chatRequest.messages[chatRequest.messages.length - 1]
    if (!lastMessage.content || lastMessage.content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Last message content cannot be empty',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Prepare messages with character context
    const character = chatRequest.character || 'assistant'
    const preparedMessages = characterManager.prepareMessages(character, chatRequest.messages)
    
    // Get character configuration
    const characterConfig = characterManager.getCharacterConfig(character)
    if (characterConfig) {
      chatRequest.temperature = chatRequest.temperature || characterConfig.temperature
      chatRequest.maxTokens = chatRequest.maxTokens || characterConfig.maxTokens
    }

    // Generate response
    const startTime = Date.now()
    const chatResponse = await llmManager.generateResponse(chatRequest)
    const processingTime = Date.now() - startTime

    logger.info('Chat response generated', {
      character,
      processingTime: `${processingTime}ms`,
      tokens: chatResponse.usage.totalTokens,
      provider: chatResponse.provider,
      userId,
    }, requestId)

    // Store conversation if user is authenticated
    if (userId !== 'anonymous') {
      try {
        // Create or get conversation
        const conversationId = req.headers['x-conversation-id'] as string
        if (conversationId) {
          // Add messages to existing conversation
          await conversationStorage.addMessage(conversationId, lastMessage)
          await conversationStorage.addMessage(conversationId, chatResponse.message)
        } else {
          // Create new conversation
          const title = lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
          const conversation = await conversationStorage.createConversation(userId, title, character)
          
          // Add messages to new conversation
          await conversationStorage.addMessage(conversation.id, lastMessage)
          await conversationStorage.addMessage(conversation.id, chatResponse.message)
          
          // Add conversation ID to response
          chatResponse.message.metadata = {
            ...chatResponse.message.metadata,
            conversationId: conversation.id,
          }
        }
      } catch (error) {
        logger.warn('Failed to store conversation', {
          error: (error as Error).message,
          userId,
          conversationId: req.headers['x-conversation-id'],
        }, requestId)
      }
    }

    const response: ApiResponse<ChatResponse> = {
      success: true,
      data: chatResponse,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Chat request failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_SERVICE_ERROR',
        message: 'Failed to generate chat response',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get available LLM providers
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Providers list requested', {}, requestId)

    const providers = await llmManager.getProviderStatus()

    const response: ApiResponse = {
      success: true,
      data: providers,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Providers list failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'PROVIDERS_LIST_ERROR',
        message: 'Failed to retrieve providers list',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Set preferred provider
router.post('/providers/:providerName/prefer', async (req: Request, res: Response) => {
  try {
    const { providerName } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Setting preferred provider', { providerName }, requestId)

    llmManager.setPreferredProvider(providerName)

    const response: ApiResponse = {
      success: true,
      data: { message: `Preferred provider set to ${providerName}` },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Failed to set preferred provider', { 
      providerName: req.params.providerName,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SET_PREFERRED_PROVIDER_ERROR',
        message: 'Failed to set preferred provider',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as chatRoutes }


