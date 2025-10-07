// Centralized logging utility for all backend services

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  service: string
  message: string
  data?: any
  requestId?: string
  userId?: string
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private serviceName: string

  private constructor(serviceName: string, logLevel: LogLevel = LogLevel.INFO) {
    this.serviceName = serviceName
    this.logLevel = logLevel
  }

  public static getInstance(serviceName: string, logLevel?: LogLevel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(serviceName, logLevel)
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private formatLog(level: LogLevel, message: string, data?: any, requestId?: string, userId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      data,
      requestId,
      userId,
    }
  }

  private output(entry: LogEntry): void {
    const levelName = LogLevel[entry.level]
    const timestamp = entry.timestamp
    const service = entry.service
    const message = entry.message
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
    const requestIdStr = entry.requestId ? ` [${entry.requestId}]` : ''
    const userIdStr = entry.userId ? ` [user:${entry.userId}]` : ''

    console.log(`[${timestamp}] ${levelName} [${service}]${requestIdStr}${userIdStr} ${message}${dataStr}`)
  }

  public error(message: string, data?: any, requestId?: string, userId?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog(LogLevel.ERROR, message, data, requestId, userId))
    }
  }

  public warn(message: string, data?: any, requestId?: string, userId?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog(LogLevel.WARN, message, data, requestId, userId))
    }
  }

  public info(message: string, data?: any, requestId?: string, userId?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog(LogLevel.INFO, message, data, requestId, userId))
    }
  }

  public debug(message: string, data?: any, requestId?: string, userId?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog(LogLevel.DEBUG, message, data, requestId, userId))
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }
}

// Convenience function to create logger instances
export function createLogger(serviceName: string, logLevel?: LogLevel): Logger {
  return Logger.getInstance(serviceName, logLevel)
}

// Request logging middleware helper
export function logRequest(serviceName: string) {
  const logger = createLogger(serviceName)
  
  return (req: any, res: any, next: any) => {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    req.requestId = requestId
    
    const startTime = Date.now()
    
    logger.info('Request started', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    }, requestId)
    
    res.on('finish', () => {
      const duration = Date.now() - startTime
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      }, requestId)
    })
    
    next()
  }
}
