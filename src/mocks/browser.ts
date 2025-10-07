import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers)

// Start MSW worker
export async function startMocking() {
  // Always start MSW in development
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'bypass', // Allow requests to pass through if not mocked
    })
    console.log('🔧 MSW: Mock API server started')
  }
}
