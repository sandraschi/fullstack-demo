import { ServiceData, ServiceMetrics, ServiceStatus } from '@/types/service.types'

// Mock service data generator
export function generateMockServiceData(id: string, name: string): ServiceData {
  const statuses: ServiceStatus[] = ['healthy', 'degraded', 'down', 'unknown']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  // Generate realistic metrics based on status
  const baseMetrics = {
    healthy: { p50: 45, p95: 120, p99: 250, errorRate: 0.01 },
    degraded: { p50: 120, p95: 300, p99: 500, errorRate: 0.05 },
    down: { p50: 0, p95: 0, p99: 0, errorRate: 1.0 },
    unknown: { p50: 0, p95: 0, p99: 0, errorRate: 0 }
  }
  
  const base = baseMetrics[status]
  const variance = 0.2 // 20% variance
  
  const metrics: ServiceMetrics = {
    responseTime: {
      p50: Math.max(0, base.p50 + (Math.random() - 0.5) * base.p50 * variance),
      p95: Math.max(0, base.p95 + (Math.random() - 0.5) * base.p95 * variance),
      p99: Math.max(0, base.p99 + (Math.random() - 0.5) * base.p99 * variance)
    },
    requestRate: Math.floor(1000 + Math.random() * 500),
    errorRate: Math.max(0, base.errorRate + (Math.random() - 0.5) * base.errorRate * variance),
    activeConnections: Math.floor(50 + Math.random() * 200)
  }
  
  return {
    id,
    name,
    status,
    uptime: status === 'healthy' ? 99.5 + Math.random() * 0.5 : 
            status === 'degraded' ? 95 + Math.random() * 4 : 
            status === 'down' ? Math.random() * 50 : 0,
    lastCheck: new Date().toISOString(),
    metrics
  }
}

// Predefined services for consistent testing
export const MOCK_SERVICES = [
  { id: 'api-gateway', name: 'API Gateway' },
  { id: 'auth-service', name: 'Auth Service' },
  { id: 'database-service', name: 'Database Service' },
  { id: 'cache-service', name: 'Cache Service' },
  { id: 'chat-service', name: 'Chat Service' },
  { id: 'image-service', name: 'Image Service' },
  { id: 'tts-stt-service', name: 'TTS/STT Service' }
]

// Generate mock data for all services
export function generateAllMockServices(): ServiceData[] {
  return MOCK_SERVICES.map(service => generateMockServiceData(service.id, service.name))
}

// Simulate latency for realistic API responses
export function simulateLatency(min = 50, max = 200): Promise<void> {
  const delay = min + Math.random() * (max - min)
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Simulate occasional errors (5% rate)
export function simulateError(errorRate = 0.05): boolean {
  return Math.random() < errorRate
}

