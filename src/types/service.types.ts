// Service data types
export interface ServiceData {
  id: string
  name: string
  status: ServiceStatus
  uptime: number
  lastCheck: string
  metrics: ServiceMetrics
}

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

// Service metrics types
export interface ServiceMetrics {
  responseTime: ResponseTimeMetrics
  requestRate: number
  errorRate: number
  activeConnections: number
}

export interface ResponseTimeMetrics {
  p50: number
  p95: number
  p99: number
}

// Health check response
export interface HealthResponse {
  status: ServiceStatus
  uptime: number
  metrics: ServiceMetrics
}

// Service card props
export interface ServiceCardProps {
  service: ServiceData
  onStatusChange?: (status: ServiceStatus) => void
}

// Metric card props
export interface MetricCardProps {
  title: string
  value: number
  unit: string
  trend: number
  trendDirection: 'up' | 'down' | 'stable'
}

