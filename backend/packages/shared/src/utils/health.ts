// Health monitoring utilities for all backend services

import { ServiceHealth, ServiceMetrics } from '../types/common.types'

export interface HealthCheckConfig {
  serviceId: string
  version: string
  environment: string
  dependencies?: Array<{
    name: string
    check: () => Promise<boolean>
    timeout?: number
  }>
}

export class HealthMonitor {
  private config: HealthCheckConfig
  private startTime: Date
  private metrics: ServiceMetrics
  private requestCount: number = 0
  private errorCount: number = 0
  private responseTimes: number[] = []

  constructor(config: HealthCheckConfig) {
    this.config = config
    this.startTime = new Date()
    this.metrics = this.initializeMetrics()
  }

  private initializeMetrics(): ServiceMetrics {
    return {
      responseTime: {
        p50: 0,
        p95: 0,
        p99: 0,
      },
      requestRate: 0,
      errorRate: 0,
      activeConnections: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    }
  }

  public recordRequest(responseTime: number, isError: boolean = false): void {
    this.requestCount++
    if (isError) {
      this.errorCount++
    }
    
    this.responseTimes.push(responseTime)
    
    // Keep only last 1000 response times for performance
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000)
    }
    
    this.updateMetrics()
  }

  private updateMetrics(): void {
    if (this.responseTimes.length === 0) return

    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b)
    const count = sortedTimes.length

    this.metrics.responseTime.p50 = this.percentile(sortedTimes, 0.5)
    this.metrics.responseTime.p95 = this.percentile(sortedTimes, 0.95)
    this.metrics.responseTime.p99 = this.percentile(sortedTimes, 0.99)

    // Calculate request rate (requests per minute)
    const uptimeMinutes = (Date.now() - this.startTime.getTime()) / (1000 * 60)
    this.metrics.requestRate = Math.round(this.requestCount / uptimeMinutes)

    // Calculate error rate
    this.metrics.errorRate = this.requestCount > 0 ? this.errorCount / this.requestCount : 0

    // Update system metrics
    this.metrics.memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal
    this.metrics.cpuUsage = process.cpuUsage().user / 1000000 // Convert to seconds
  }

  private percentile(sortedArray: number[], p: number): number {
    const index = Math.ceil(sortedArray.length * p) - 1
    return sortedArray[Math.max(0, index)] || 0
  }

  public async getHealth(): Promise<ServiceHealth> {
    const status = await this.determineStatus()
    
    return {
      serviceId: this.config.serviceId,
      status,
      uptime: Date.now() - this.startTime.getTime(),
      lastCheck: new Date().toISOString(),
      version: this.config.version,
      environment: this.config.environment,
      metrics: { ...this.metrics },
    }
  }

  private async determineStatus(): Promise<'healthy' | 'degraded' | 'down' | 'unknown'> {
    try {
      // Check dependencies if configured
      if (this.config.dependencies && this.config.dependencies.length > 0) {
        const dependencyChecks = await Promise.allSettled(
          this.config.dependencies.map(async (dep) => {
            const timeout = dep.timeout || 5000
            return Promise.race([
              dep.check(),
              new Promise<boolean>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
              )
            ])
          })
        )

        const failedDependencies = dependencyChecks.filter(
          (result) => result.status === 'rejected'
        ).length

        if (failedDependencies === this.config.dependencies.length) {
          return 'down'
        } else if (failedDependencies > 0) {
          return 'degraded'
        }
      }

      // Check error rate
      if (this.metrics.errorRate > 0.1) { // 10% error rate
        return 'degraded'
      }

      // Check response time
      if (this.metrics.responseTime.p95 > 5000) { // 5 second p95
        return 'degraded'
      }

      return 'healthy'
    } catch (error) {
      return 'unknown'
    }
  }

  public getMetrics(): ServiceMetrics {
    return { ...this.metrics }
  }

  public reset(): void {
    this.requestCount = 0
    this.errorCount = 0
    this.responseTimes = []
    this.startTime = new Date()
    this.metrics = this.initializeMetrics()
  }
}

// Convenience function to create health monitor
export function createHealthMonitor(config: HealthCheckConfig): HealthMonitor {
  return new HealthMonitor(config)
}

// Health check endpoint helper
export function createHealthEndpoint(healthMonitor: HealthMonitor) {
  return async (req: any, res: any) => {
    try {
      const health = await healthMonitor.getHealth()
      res.json(health)
    } catch (error) {
      res.status(500).json({
        serviceId: healthMonitor['config'].serviceId,
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    }
  }
}


