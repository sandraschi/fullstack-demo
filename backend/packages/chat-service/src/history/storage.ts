// Conversation history storage using SQLite

import sqlite3 from 'sqlite3'
import { ChatMessage } from '@shared/types/common.types'
import { createLogger } from '@shared/utils/logger'
import path from 'path'

const logger = createLogger('chat-service-history')

export interface Conversation {
  id: string
  userId: string
  title: string
  character: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface ConversationSummary {
  id: string
  userId: string
  title: string
  character: string
  messageCount: number
  createdAt: string
  updatedAt: string
  lastMessage?: string
}

export class ConversationStorage {
  private db: sqlite3.Database
  private dbPath: string

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'conversations.db')
    this.db = new sqlite3.Database(this.dbPath)
    this.initializeDatabase()
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      // Create conversations table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          character TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          metadata TEXT
        )
      `)

      // Create messages table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          metadata TEXT,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
        )
      `)

      // Create indexes
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations (user_id)`)
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations (updated_at)`)
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id)`)
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp)`)
    })

    logger.info('Database initialized', { dbPath: this.dbPath })
  }

  async createConversation(
    userId: string,
    title: string,
    character: string,
    metadata?: Record<string, any>
  ): Promise<Conversation> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO conversations (id, user_id, title, character, created_at, updated_at, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, title, character, now, now, JSON.stringify(metadata || {})],
        function(err) {
          if (err) {
            logger.error('Failed to create conversation', { error: err.message, userId, title })
            reject(err)
            return
          }

          const conversation: Conversation = {
            id,
            userId,
            title,
            character,
            messages: [],
            createdAt: now,
            updatedAt: now,
            metadata,
          }

          logger.info('Conversation created', { id, userId, title, character })
          resolve(conversation)
        }
      )
    })
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM conversations WHERE id = ?`,
        [conversationId],
        (err, row: any) => {
          if (err) {
            logger.error('Failed to get conversation', { error: err.message, conversationId })
            reject(err)
            return
          }

          if (!row) {
            resolve(null)
            return
          }

          // Get messages for this conversation
          this.getMessages(conversationId)
            .then(messages => {
              const conversation: Conversation = {
                id: row.id,
                userId: row.user_id,
                title: row.title,
                character: row.character,
                messages,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                metadata: row.metadata ? JSON.parse(row.metadata) : {},
              }
              resolve(conversation)
            })
            .catch(reject)
        }
      )
    })
  }

  async getConversations(userId: string, limit: number = 50, offset: number = 0): Promise<ConversationSummary[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT c.*, 
                COUNT(m.id) as message_count,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
         FROM conversations c
         LEFT JOIN messages m ON c.id = m.conversation_id
         WHERE c.user_id = ?
         GROUP BY c.id
         ORDER BY c.updated_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset],
        (err, rows: any[]) => {
          if (err) {
            logger.error('Failed to get conversations', { error: err.message, userId })
            reject(err)
            return
          }

          const conversations: ConversationSummary[] = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            character: row.character,
            messageCount: row.message_count || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastMessage: row.last_message,
          }))

          resolve(conversations)
        }
      )
    })
  }

  async addMessage(conversationId: string, message: ChatMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Insert message
        this.db.run(
          `INSERT INTO messages (id, conversation_id, role, content, timestamp, metadata)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            message.id,
            conversationId,
            message.role,
            message.content,
            message.timestamp,
            JSON.stringify(message.metadata || {}),
          ],
          (err) => {
            if (err) {
              logger.error('Failed to add message', { error: err.message, conversationId, messageId: message.id })
              reject(err)
              return
            }

            // Update conversation timestamp
            this.db.run(
              `UPDATE conversations SET updated_at = ? WHERE id = ?`,
              [new Date().toISOString(), conversationId],
              (err) => {
                if (err) {
                  logger.error('Failed to update conversation timestamp', { error: err.message, conversationId })
                  reject(err)
                  return
                }

                logger.info('Message added', { conversationId, messageId: message.id, role: message.role })
                resolve()
              }
            )
          }
        )
      })
    })
  }

  async getMessages(conversationId: string, limit?: number): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      const query = limit
        ? `SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ?`
        : `SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC`

      const params = limit ? [conversationId, limit] : [conversationId]

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          logger.error('Failed to get messages', { error: err.message, conversationId })
          reject(err)
          return
        }

        const messages: ChatMessage[] = rows.map(row => ({
          id: row.id,
          role: row.role as 'user' | 'assistant' | 'system',
          content: row.content,
          timestamp: row.timestamp,
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
        }))

        resolve(messages)
      })
    })
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?`,
        [title, new Date().toISOString(), conversationId],
        function(err) {
          if (err) {
            logger.error('Failed to update conversation title', { error: err.message, conversationId, title })
            reject(err)
            return
          }

          logger.info('Conversation title updated', { conversationId, title })
          resolve()
        }
      )
    })
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM conversations WHERE id = ?`, [conversationId], function(err) {
        if (err) {
          logger.error('Failed to delete conversation', { error: err.message, conversationId })
          reject(err)
          return
        }

        logger.info('Conversation deleted', { conversationId })
        resolve()
      })
    })
  }

  async searchConversations(userId: string, query: string): Promise<ConversationSummary[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT c.*, 
                COUNT(m.id) as message_count,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
         FROM conversations c
         LEFT JOIN messages m ON c.id = m.conversation_id
         WHERE c.user_id = ? AND (c.title LIKE ? OR EXISTS (
           SELECT 1 FROM messages WHERE conversation_id = c.id AND content LIKE ?
         ))
         GROUP BY c.id
         ORDER BY c.updated_at DESC`,
        [userId, `%${query}%`, `%${query}%`],
        (err, rows: any[]) => {
          if (err) {
            logger.error('Failed to search conversations', { error: err.message, userId, query })
            reject(err)
            return
          }

          const conversations: ConversationSummary[] = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            character: row.character,
            messageCount: row.message_count || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastMessage: row.last_message,
          }))

          resolve(conversations)
        }
      )
    })
  }

  async getStats(userId?: string): Promise<{
    totalConversations: number
    totalMessages: number
    activeUsers: number
  }> {
    return new Promise((resolve, reject) => {
      const userFilter = userId ? 'WHERE user_id = ?' : ''
      const params = userId ? [userId] : []

      this.db.get(
        `SELECT 
           COUNT(DISTINCT c.id) as total_conversations,
           COUNT(m.id) as total_messages,
           COUNT(DISTINCT c.user_id) as active_users
         FROM conversations c
         LEFT JOIN messages m ON c.id = m.conversation_id
         ${userFilter}`,
        params,
        (err, row: any) => {
          if (err) {
            logger.error('Failed to get stats', { error: err.message, userId })
            reject(err)
            return
          }

          resolve({
            totalConversations: row.total_conversations || 0,
            totalMessages: row.total_messages || 0,
            activeUsers: row.active_users || 0,
          })
        }
      )
    })
  }

  close(): void {
    this.db.close((err) => {
      if (err) {
        logger.error('Failed to close database', { error: err.message })
      } else {
        logger.info('Database closed')
      }
    })
  }
}

// Singleton instance
export const conversationStorage = new ConversationStorage()


