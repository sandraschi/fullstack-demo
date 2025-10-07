import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import React from 'react'

// Create a test query client
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
}

// Create system for Chakra UI
const system = createSystem(defaultConfig)

// Test wrapper with providers
export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  )
}

// Custom render function with providers
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper })
}

// Mock MSW for tests
export const mockApiResponse = (data: any, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }
}
