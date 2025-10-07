// Character routes for Chat Service

import { Router, Request, Response } from 'express'
import { createLogger } from '@shared/utils/logger'
import { ApiResponse } from '@shared/types/common.types'
import { characterManager } from '../characters/characters'

const router = Router()
const logger = createLogger('chat-service')

// Get all characters
router.get('/', async (req: Request, res: Response) => {
  try {
    const requestId = (req as any).requestId
    
    logger.info('Characters list requested', {}, requestId)

    const characters = characterManager.getAllCharacters()

    const response: ApiResponse = {
      success: true,
      data: characters,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Characters list failed', { error: (error as Error).message }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CHARACTERS_LIST_ERROR',
        message: 'Failed to retrieve characters list',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get specific character
router.get('/:characterId', async (req: Request, res: Response) => {
  try {
    const { characterId } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Character requested', { characterId }, requestId)

    const character = characterManager.getCharacter(characterId)
    
    if (!character) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CHARACTER_NOT_FOUND',
          message: `Character ${characterId} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: character,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Character retrieval failed', { 
      characterId: req.params.characterId,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CHARACTER_RETRIEVAL_ERROR',
        message: 'Failed to retrieve character',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Search characters
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Character search requested', { query }, requestId)

    const characters = characterManager.searchCharacters(query)

    const response: ApiResponse = {
      success: true,
      data: characters,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Character search failed', { 
      query: req.params.query,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CHARACTER_SEARCH_ERROR',
        message: 'Failed to search characters',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

// Get characters by specialty
router.get('/specialty/:specialty', async (req: Request, res: Response) => {
  try {
    const { specialty } = req.params
    const requestId = (req as any).requestId
    
    logger.info('Characters by specialty requested', { specialty }, requestId)

    const characters = characterManager.getCharactersBySpecialty(specialty)

    const response: ApiResponse = {
      success: true,
      data: characters,
      timestamp: new Date().toISOString(),
      requestId,
    }

    res.json(response)
  } catch (error) {
    logger.error('Characters by specialty failed', { 
      specialty: req.params.specialty,
      error: (error as Error).message 
    }, (req as any).requestId)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CHARACTERS_BY_SPECIALTY_ERROR',
        message: 'Failed to retrieve characters by specialty',
      },
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    })
  }
})

export { router as characterRoutes }


