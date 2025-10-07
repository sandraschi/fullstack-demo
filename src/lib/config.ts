// Environment configuration
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9200',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:9200',
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
} as const

