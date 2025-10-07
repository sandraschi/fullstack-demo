import { screen } from '@testing-library/react'
import { ServiceCard } from '../ServiceCard'
import { renderWithProviders } from '../../../test/setup'

// Mock the API client
vi.mock('@/lib/apiClient', () => ({
  apiClient: {
    getServiceHealth: vi.fn(),
  },
}))

describe('ServiceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders service name', () => {
    renderWithProviders(
      <ServiceCard serviceId="api-gateway" serviceName="API Gateway" />
    )
    
    expect(screen.getByText('API Gateway')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithProviders(
      <ServiceCard serviceId="api-gateway" serviceName="API Gateway" />
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays service status when data is loaded', async () => {
    const mockService = {
      id: 'api-gateway',
      name: 'API Gateway',
      status: 'healthy' as const,
      uptime: 99.97,
      lastCheck: '2025-01-27T10:00:00Z',
      metrics: {
        responseTime: { p50: 45, p95: 120, p99: 250 },
        requestRate: 1250,
        errorRate: 0.01,
        activeConnections: 150,
      },
    }

    // Mock the API response
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.getServiceHealth).mockResolvedValue(mockService)

    renderWithProviders(
      <ServiceCard serviceId="api-gateway" serviceName="API Gateway" />
    )

    // Wait for data to load
    expect(await screen.findByText('healthy')).toBeInTheDocument()
    expect(screen.getByText('99.97% uptime')).toBeInTheDocument()
    expect(screen.getByText('Response Time: 45ms (p50)')).toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    const { apiClient } = await import('@/lib/apiClient')
    vi.mocked(apiClient.getServiceHealth).mockRejectedValue(new Error('API Error'))

    renderWithProviders(
      <ServiceCard serviceId="api-gateway" serviceName="API Gateway" />
    )

    expect(await screen.findByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load service data')).toBeInTheDocument()
  })
})
