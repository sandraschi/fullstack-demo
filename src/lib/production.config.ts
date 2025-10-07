// Production-specific configuration
export const productionConfig = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.fullstack-demo.com',
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://api.fullstack-demo.com',
  
  // Feature flags
  enableMocks: false, // Disable mocks in production
  enableDevtools: false, // Disable devtools in production
  enableDebugLogs: false, // Disable debug logs in production
  
  // Performance settings
  refreshInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
  
  // Analytics (if needed)
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  
  // Error reporting (if needed)
  enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  errorReportingUrl: import.meta.env.VITE_ERROR_REPORTING_URL,
  
  // Security
  enableCSP: true, // Content Security Policy
  enableHSTS: true, // HTTP Strict Transport Security
  
  // Caching
  cacheMaxAge: 86400, // 24 hours
  staticAssetsMaxAge: 31536000, // 1 year
} as const

