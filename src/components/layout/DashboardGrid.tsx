import { SimpleGrid, Box } from '@chakra-ui/react'
import { ServiceCard } from '@/components/microservices/ServiceCard'
import { useAllServicesData } from '@/hooks/useServiceData'

export function DashboardGrid() {
  const { data: healthData, isLoading } = useAllServicesData()

  if (isLoading) {
    return (
      <Box>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {[1, 2, 3, 4].map(i => (
            <Box key={i} h="200px" bg="gray.100" borderRadius="lg" />
          ))}
        </SimpleGrid>
      </Box>
    )
  }

  // Mock service IDs for testing
  const mockServices = [
    { id: 'api-gateway', name: 'API Gateway' },
    { id: 'auth-service', name: 'Auth Service' },
    { id: 'database-service', name: 'Database Service' },
    { id: 'cache-service', name: 'Cache Service' },
    { id: 'chat-service', name: 'Chat Service' },
    { id: 'image-service', name: 'Image Service' },
  ]

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {mockServices.map(service => (
          <ServiceCard
            key={service.id}
            serviceId={service.id}
            serviceName={service.name}
          />
        ))}
      </SimpleGrid>
    </Box>
  )
}
