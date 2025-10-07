import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { ServiceData } from '@/types/service.types'

export function useServiceData(serviceId: string) {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => apiClient.getServiceHealth(serviceId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30s
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useAllServicesData() {
  return useQuery({
    queryKey: ['services', 'all'],
    queryFn: () => apiClient.getHealth(),
    staleTime: 30000,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}