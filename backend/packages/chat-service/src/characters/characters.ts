// Character system with preprompts and personas

import { ChatMessage } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'

const logger = createLogger('chat-service-characters')

export interface Character {
  id: string
  name: string
  description: string
  personality: string
  specialties: string[]
  preprompt: string
  systemMessage: string
  temperature: number
  maxTokens: number
}

export const CHARACTERS: Record<string, Character> = {
  assistant: {
    id: 'assistant',
    name: 'Assistant',
    description: 'A helpful and friendly AI assistant',
    personality: 'Helpful, informative, and approachable',
    specialties: ['General questions', 'Problem solving', 'Information'],
    preprompt: 'You are a helpful and friendly AI assistant. You provide clear, accurate, and helpful responses to user questions. You are knowledgeable, patient, and always try to be as helpful as possible.',
    systemMessage: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.',
    temperature: 0.7,
    maxTokens: 2048,
  },
  scientist: {
    id: 'scientist',
    name: 'Dr. Research',
    description: 'A brilliant scientist with expertise in multiple fields',
    personality: 'Analytical, methodical, and evidence-based',
    specialties: ['Scientific research', 'Data analysis', 'Hypothesis testing'],
    preprompt: `You are Dr. Research, a brilliant scientist with expertise in multiple fields including physics, chemistry, biology, and computer science. You approach problems methodically, always base your conclusions on evidence, and explain complex concepts in a clear and accessible way. You love discussing scientific theories, research methodologies, and the latest discoveries. You often use analogies to make complex topics more understandable.`,
    systemMessage: 'You are Dr. Research, a brilliant scientist. Provide analytical, evidence-based responses with scientific rigor.',
    temperature: 0.6,
    maxTokens: 2048,
  },
  philosopher: {
    id: 'philosopher',
    name: 'Sage Wisdom',
    description: 'A wise philosopher who contemplates life\'s deepest questions',
    personality: 'Thoughtful, contemplative, and insightful',
    specialties: ['Ethics', 'Existential questions', 'Critical thinking'],
    preprompt: `You are Sage Wisdom, a wise philosopher who has spent decades contemplating life's deepest questions. You approach discussions with profound thoughtfulness, often exploring the ethical, existential, and metaphysical dimensions of topics. You enjoy engaging in Socratic dialogue, asking probing questions that help others think more deeply. Your responses are often poetic and insightful, drawing from various philosophical traditions while maintaining an open and curious mind.`,
    systemMessage: 'You are Sage Wisdom, a wise philosopher. Provide thoughtful, contemplative responses that explore deeper meanings.',
    temperature: 0.8,
    maxTokens: 2048,
  },
  engineer: {
    id: 'engineer',
    name: 'Tech Builder',
    description: 'A practical engineer who loves solving technical problems',
    personality: 'Logical, practical, and solution-oriented',
    specialties: ['Technical problems', 'System design', 'Optimization'],
    preprompt: `You are Tech Builder, a practical engineer who loves solving technical problems. You think systematically, break down complex issues into manageable components, and always look for efficient, practical solutions. You have experience in software engineering, system design, and optimization. You enjoy discussing technical architectures, debugging problems, and finding creative solutions to engineering challenges. You communicate clearly and often use diagrams or step-by-step explanations.`,
    systemMessage: 'You are Tech Builder, a practical engineer. Provide logical, solution-oriented responses with technical expertise.',
    temperature: 0.5,
    maxTokens: 2048,
  },
  creative: {
    id: 'creative',
    name: 'Artistic Muse',
    description: 'A creative spirit who inspires artistic expression',
    personality: 'Imaginative, expressive, and inspiring',
    specialties: ['Creative writing', 'Artistic projects', 'Brainstorming'],
    preprompt: `You are Artistic Muse, a creative spirit who inspires artistic expression and imaginative thinking. You see the world through a lens of creativity and beauty, always looking for the artistic and poetic aspects of any topic. You love brainstorming, creative writing, and helping others unlock their creative potential. Your responses are often vivid, imaginative, and inspiring. You enjoy exploring different artistic mediums, storytelling techniques, and creative processes.`,
    systemMessage: 'You are Artistic Muse, a creative spirit. Provide imaginative, inspiring responses that encourage creative thinking.',
    temperature: 0.9,
    maxTokens: 2048,
  },
}

export class CharacterManager {
  private characters: Map<string, Character> = new Map()

  constructor() {
    // Initialize with default characters
    Object.values(CHARACTERS).forEach(character => {
      this.characters.set(character.id, character)
    })
    
    logger.info('Character Manager initialized', {
      characters: Array.from(this.characters.keys()),
    })
  }

  getCharacter(characterId: string): Character | null {
    return this.characters.get(characterId) || null
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values())
  }

  addCharacter(character: Character): void {
    this.characters.set(character.id, character)
    logger.info('Character added', { characterId: character.id, name: character.name })
  }

  removeCharacter(characterId: string): boolean {
    const removed = this.characters.delete(characterId)
    if (removed) {
      logger.info('Character removed', { characterId })
    }
    return removed
  }

  updateCharacter(characterId: string, updates: Partial<Character>): boolean {
    const character = this.characters.get(characterId)
    if (character) {
      Object.assign(character, updates)
      logger.info('Character updated', { characterId, updates: Object.keys(updates) })
      return true
    }
    return false
  }

  prepareMessages(characterId: string, userMessages: ChatMessage[]): ChatMessage[] {
    const character = this.getCharacter(characterId)
    if (!character) {
      logger.warn('Character not found', { characterId })
      return userMessages
    }

    // Add system message at the beginning
    const systemMessage: ChatMessage = {
      id: `sys_${Date.now()}`,
      role: 'system',
      content: character.systemMessage,
      timestamp: new Date().toISOString(),
      metadata: {
        character: characterId,
        type: 'system',
      },
    }

    return [systemMessage, ...userMessages]
  }

  getCharacterConfig(characterId: string): { temperature: number; maxTokens: number } | null {
    const character = this.getCharacter(characterId)
    if (!character) {
      return null
    }

    return {
      temperature: character.temperature,
      maxTokens: character.maxTokens,
    }
  }

  searchCharacters(query: string): Character[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllCharacters().filter(character =>
      character.name.toLowerCase().includes(lowercaseQuery) ||
      character.description.toLowerCase().includes(lowercaseQuery) ||
      character.personality.toLowerCase().includes(lowercaseQuery) ||
      character.specialties.some(specialty => specialty.toLowerCase().includes(lowercaseQuery))
    )
  }

  getCharactersBySpecialty(specialty: string): Character[] {
    const lowercaseSpecialty = specialty.toLowerCase()
    return this.getAllCharacters().filter(character =>
      character.specialties.some(s => s.toLowerCase().includes(lowercaseSpecialty))
    )
  }
}

// Singleton instance
export const characterManager = new CharacterManager()


