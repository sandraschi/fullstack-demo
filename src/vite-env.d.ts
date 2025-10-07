/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ENABLE_MOCKS: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ANALYTICS_ID: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_ERROR_REPORTING_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


