import React, { useMemo, useCallback } from 'react'
import { Badge, HStack, Text, VStack } from '@chakra-ui/react'
import { BaseCard } from '@/components/cards/BaseCard'
import { LoadingCard } from '@/components/cards/LoadingCard'
import { useServiceData } from '@/hooks/useServiceData'
import { ServiceStatus } from '@/types/service.types'

interface Props {
  serviceId: string
  serviceName: string
}

export const ServiceCard = React.memo(function ServiceCard({ serviceId, serviceName }: Props) {
  const { data: service, isLoading, error } = useServiceData(serviceId)

  if (isLoading) {
    return <LoadingCard title={serviceName} />
  }

  if (error) {
    return (
      <BaseCard title={serviceName}>
        <Badge colorScheme="red">Error</Badge>
        <Text fontSize="sm" color="red.500" mt={2}>
          Failed to load service data
        </Text>
      </BaseCard>
    )
  }

  if (!service) {
    return (
      <BaseCard title={serviceName}>
        <Badge colorScheme="gray">Unknown</Badge>
      </BaseCard>
    )
  }

  const getStatusColor = useCallback((status: ServiceStatus) => {
    switch (status) {
      case 'healthy':
        return 'green'
      case 'degraded':
        return 'yellow'
      case 'down':
        return 'red'
      default:
        return 'gray'
    }
  }, [])

  const statusColor = useMemo(() => 
    service ? getStatusColor(service.status) : 'gray', 
    [service, getStatusColor]
  )

  return (
    <BaseCard title={serviceName}>
      <VStack align="start" gap={2}>
        <HStack>
          <Badge colorScheme={statusColor}>
            {service.status}
          </Badge>
          <Text fontSize="sm" color="gray.600">
            {service.uptime.toFixed(2)}% uptime
          </Text>
        </HStack>
        
        <VStack align="start" gap={1} fontSize="sm">
          <Text>
            <strong>Response Time:</strong> {service.metrics.responseTime.p50}ms (p50)
          </Text>
          <Text>
            <strong>Request Rate:</strong> {service.metrics.requestRate}/min
          </Text>
          <Text>
            <strong>Error Rate:</strong> {(service.metrics.errorRate * 100).toFixed(2)}%
          </Text>
          <Text>
            <strong>Connections:</strong> {service.metrics.activeConnections}
          </Text>
        </VStack>
      </VStack>
    </BaseCard>
  )
})
