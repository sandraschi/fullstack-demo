// Generate mock time-series data for charts
export function generateTimeSeriesData(
  points: number = 20,
  baseValue: number = 100,
  variance: number = 20,
  trend: number = 0
): Array<{ timestamp: string; value: number }> {
  const data = []
  const now = new Date()
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000) // 1 minute intervals
    const trendEffect = (points - i) * trend / points
    const randomVariance = (Math.random() - 0.5) * variance
    const value = Math.max(0, baseValue + trendEffect + randomVariance)
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100
    })
  }
  
  return data
}

// Predefined time-series datasets for different metrics
export const MOCK_TIME_SERIES = {
  responseTime: generateTimeSeriesData(20, 50, 15, -2), // Improving response time
  requestRate: generateTimeSeriesData(20, 1200, 200, 5), // Increasing requests
  errorRate: generateTimeSeriesData(20, 2, 1, -0.1), // Decreasing errors
  cpuUsage: generateTimeSeriesData(20, 65, 10, 1), // Slight CPU increase
  memoryUsage: generateTimeSeriesData(20, 45, 8, 0.5), // Stable memory
  activeConnections: generateTimeSeriesData(20, 150, 30, 3), // Growing connections
}

// Generate metric card data with trends
export function generateMetricData() {
  return {
    totalRequests: {
      value: 1250,
      unit: 'req/min',
      trend: 12.5,
      trendDirection: 'up' as const
    },
    avgResponseTime: {
      value: 45,
      unit: 'ms',
      trend: -8.2,
      trendDirection: 'down' as const
    },
    errorRate: {
      value: 0.03,
      unit: '%',
      trend: -15.0,
      trendDirection: 'down' as const
    },
    activeConnections: {
      value: 342,
      unit: 'conn',
      trend: 5.8,
      trendDirection: 'up' as const
    },
    cpuUsage: {
      value: 65,
      unit: '%',
      trend: 2.1,
      trendDirection: 'up' as const
    },
    memoryUsage: {
      value: 45,
      unit: '%',
      trend: 0.5,
      trendDirection: 'stable' as const
    }
  }
}

