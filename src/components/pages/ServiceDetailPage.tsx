import { Box, Container, Heading, Text, VStack, HStack, Badge, Button, SimpleGrid } from '@chakra-ui/react'
import { FiArrowLeft, FiActivity, FiClock, FiAlertCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface ServiceDetailPageProps {
  serviceName: string
  serviceId: string
  description: string
  features: string[]
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  responseTime: number
  requestRate: number
  errorRate: number
}

export function ServiceDetailPage({ 
  serviceName, 
  serviceId, 
  description, 
  features, 
  status, 
  uptime, 
  responseTime, 
  requestRate, 
  errorRate 
}: ServiceDetailPageProps) {
  const navigate = useNavigate()
  
  const statusColor = status === 'healthy' ? 'green' : status === 'degraded' ? 'yellow' : 'red'
  
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="container.xl" py={8}>
        {/* Header */}
        <VStack align="start" gap={4} mb={8}>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            size="sm"
          >
            <HStack gap={1}>
              <FiArrowLeft />
              <Text>Back to Dashboard</Text>
            </HStack>
          </Button>
          
          <HStack gap={4} align="start">
            <VStack align="start" gap={2}>
              <Heading size="xl">{serviceName}</Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                {description}
              </Text>
            </VStack>
            
            <Badge colorScheme={statusColor} size="lg" p={2}>
              {status.toUpperCase()}
            </Badge>
          </HStack>
        </VStack>

        {/* Metrics Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
          <Box p={4} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
            <Text fontSize="sm" color="gray.600">Uptime</Text>
            <Text fontSize="2xl" fontWeight="bold">{uptime}%</Text>
            <Text fontSize="xs" color="green.500">↗ Last 30 days</Text>
          </Box>
          
          <Box p={4} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
            <Text fontSize="sm" color="gray.600">Response Time</Text>
            <Text fontSize="2xl" fontWeight="bold">{responseTime}ms</Text>
            <Text fontSize="xs" color="green.500">↘ Average</Text>
          </Box>
          
          <Box p={4} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
            <Text fontSize="sm" color="gray.600">Request Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">{requestRate}/min</Text>
            <Text fontSize="xs" color="green.500">↗ Current</Text>
          </Box>
          
          <Box p={4} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
            <Text fontSize="sm" color="gray.600">Error Rate</Text>
            <Text fontSize="2xl" fontWeight="bold">{errorRate}%</Text>
            <Text fontSize="xs" color="red.500">↘ Last hour</Text>
          </Box>
        </SimpleGrid>

        {/* Features */}
        <Box mb={8}>
          <Heading size="md" mb={4}>Features</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {features.map((feature, index) => (
              <Box key={index} p={4} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
                <HStack gap={2}>
                  <FiActivity color="green" />
                  <Text>{feature}</Text>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Service-specific content */}
        <Box>
          <Heading size="md" mb={4}>Service Details</Heading>
          <Box p={6} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="lg" boxShadow="sm">
            <VStack align="start" gap={4}>
              <HStack gap={2}>
                <FiClock />
                <Text><strong>Service ID:</strong> {serviceId}</Text>
              </HStack>
              <HStack gap={2}>
                <FiActivity />
                <Text><strong>Status:</strong> {status}</Text>
              </HStack>
              <HStack gap={2}>
                <FiAlertCircle />
                <Text><strong>Last Check:</strong> {new Date().toLocaleString()}</Text>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
