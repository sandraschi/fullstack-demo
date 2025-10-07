// Conversation history routes for Chat Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { historyRateLimiter } from '../middleware/rateLimiter'
import { ApiResponse } from '@shared/types/common.types'
import { conversationStorage } from '../history/storage'

const router = Router()
const logger = createLogger('chat-service')

// Get conversation history for user
router.get('/:userId', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { limit = '50', offset = '0' } = req.query
    const requestId = (req as any).requestId
    
    logger.info('Conversation history requested', { userId, limit, offset }, requestId)

    const conversations = await conversationStorage.getConversations(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    )

    const response: ApiResponse = {
      success: true,
      data: conversations,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation history failed', { 
      userId: req.params.userId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_HISTORY_ERROR',
        message: 'Failed to retrieve conversation history',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get specific conversation
router.get('/:userId/conversation/:conversationId', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Conversation requested', { userId, conversationId }, requestId)

    const conversation = await conversationStorage.getConversation(conversationId)
    
    if (!conversation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: `Conversation ${conversationId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Check if user owns this conversation
    if (conversation.userId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this conversation',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: conversation,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation retrieval failed', { 
      userId: req.params.userId,
      conversationId: req.params.conversationId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_RETRIEVAL_ERROR',
        message: 'Failed to retrieve conversation',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Create new conversation
router.post('/:userId/conversation', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { title, character, metadata } = req.body
    const requestId = (req as any).requestId
    
    logger.info('Creating conversation', { userId, title, character }, requestId)

    if (!title || !character) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and character are required',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const conversation = await conversationStorage.createConversation(userId, title, character, metadata)

    const response: ApiResponse = {
      success: true,
      data: conversation,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation creation failed', { 
      userId: req.params.userId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_CREATION_ERROR',
        message: 'Failed to create conversation',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Update conversation title
router.put('/:userId/conversation/:conversationId/title', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.params
    const { title } = req.body
    const requestId = (req as any).requestId
    
    logger.info('Updating conversation title', { userId, conversationId, title }, requestId)

    if (!title) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title is required',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    // Check if conversation exists and user owns it
    const conversation = await conversationStorage.getConversation(conversationId)
    if (!conversation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: `Conversation ${conversationId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    if (conversation.userId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this conversation',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    await conversationStorage.updateConversationTitle(conversationId, title)

    const response: ApiResponse = {
      success: true,
      data: { message: 'Conversation title updated successfully' },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation title update failed', { 
      userId: req.params.userId,
      conversationId: req.params.conversationId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_TITLE_UPDATE_ERROR',
        message: 'Failed to update conversation title',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Delete conversation
router.delete('/:userId/conversation/:conversationId', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Deleting conversation', { userId, conversationId }, requestId)

    // Check if conversation exists and user owns it
    const conversation = await conversationStorage.getConversation(conversationId)
    if (!conversation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: `Conversation ${conversationId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    if (conversation.userId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this conversation',
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    await conversationStorage.deleteConversation(conversationId)

    const response: ApiResponse = {
      success: true,
      data: { message: 'Conversation deleted successfully' },
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation deletion failed', { 
      userId: req.params.userId,
      conversationId: req.params.conversationId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_DELETION_ERROR',
        message: 'Failed to delete conversation',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Search conversations
router.get('/:userId/search/:query', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, query } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Searching conversations', { userId, query }, requestId)

    const conversations = await conversationStorage.searchConversations(userId, query)

    const response: ApiResponse = {
      success: true,
      data: conversations,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation search failed', { 
      userId: req.params.userId,
      query: req.params.query,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_SEARCH_ERROR',
        message: 'Failed to search conversations',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get conversation stats
router.get('/:userId/stats', historyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Conversation stats requested', { userId }, requestId)

    const stats = await conversationStorage.getStats(userId)

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Conversation stats failed', { 
      userId: req.params.userId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSATION_STATS_ERROR',
        message: 'Failed to retrieve conversation stats',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as historyRoutes }


