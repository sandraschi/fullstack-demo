import { Box, Container, Heading, Text, VStack, HStack, Badge, Button, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'
import { FiArrowLeft, FiActivity, FiServer, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface ServiceData {
  id: string
  name: string
  status: string
  uptime: number
  metrics: {
    responseTime: { p50: number; p95: number; p99: number }
    requestRate: number
    errorRate: number
    activeConnections: number
  }
}

export function ApiGatewayPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:9200/api/health')
        const data = await response.json()
        if (data.success) {
          setServices(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch services:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
    const interval = setInterval(fetchServices, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green'
      case 'degraded': return 'yellow'
      case 'down': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="container.xl" py={8}>
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
          
          <HStack gap={4} align="center">
            <Heading size="lg">API Gateway</Heading>
            <Badge colorScheme="green">Online</Badge>
          </HStack>
          
          <Text color="gray.600">
            Central API gateway managing all microservices. Monitor service health, metrics, and performance.
          </Text>
        </VStack>

        {/* Service Overview */}
        <Box mb={8}>
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            p={6}
          >
            <Heading size="md" mb={4}>Service Overview</Heading>
            
            {isLoading ? (
              <Text>Loading services...</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
                {services.map(service => (
                  <Box
                    key={service.id}
                    p={4}
                    bg="gray.50"
                    _dark={{ bg: 'gray.800' }}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <VStack align="start" gap={2}>
                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="bold">{service.name}</Text>
                        <Badge colorScheme={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </HStack>
                      
                      <Stat size="sm">
                        <StatLabel>Uptime</StatLabel>
                        <StatNumber>{service.uptime}%</StatNumber>
                      </Stat>
                      
                      <Stat size="sm">
                        <StatLabel>Response Time (p95)</StatLabel>
                        <StatNumber>{service.metrics.responseTime.p95}ms</StatNumber>
                      </Stat>
                      
                      <Stat size="sm">
                        <StatLabel>Request Rate</StatLabel>
                        <StatNumber>{service.metrics.requestRate}/min</StatNumber>
                      </Stat>
                      
                      <Stat size="sm">
                        <StatLabel>Error Rate</StatLabel>
                        <StatNumber color={service.metrics.errorRate > 1 ? 'red.500' : 'green.500'}>
                          {service.metrics.errorRate}%
                        </StatNumber>
                      </Stat>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </Box>

        {/* API Endpoints */}
        <Box>
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            p={6}
          >
            <Heading size="md" mb={4}>Available API Endpoints</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box p={4} bg="blue.50" borderRadius="md">
                <HStack gap={2} mb={2}>
                  <FiServer />
                  <Text fontWeight="bold">Chat Service</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">POST /api/chat</Text>
                <Text fontSize="xs" color="gray.500">Connect to Ollama/LM Studio</Text>
              </Box>
              
              <Box p={4} bg="purple.50" borderRadius="md">
                <HStack gap={2} mb={2}>
                  <FiZap />
                  <Text fontWeight="bold">Image Service</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">POST /api/image/generate</Text>
                <Text fontSize="xs" color="gray.500">Connect to Gradio Stable Diffusion</Text>
              </Box>
              
              <Box p={4} bg="orange.50" borderRadius="md">
                <HStack gap={2} mb={2}>
                  <FiActivity />
                  <Text fontWeight="bold">TTS Service</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">POST /api/tts</Text>
                <Text fontSize="xs" color="gray.500">Windows SAPI Text-to-Speech</Text>
              </Box>
              
              <Box p={4} bg="green.50" borderRadius="md">
                <HStack gap={2} mb={2}>
                  <FiActivity />
                  <Text fontWeight="bold">STT Service</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">POST /api/stt</Text>
                <Text fontSize="xs" color="gray.500">Whisper Speech-to-Text</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}