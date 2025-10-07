import { Box, Container, Heading, Text, SimpleGrid, Badge, VStack, HStack, Spinner, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiPower } from 'react-icons/fi'

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

// Service card component with REAL data
function ServiceCard({ serviceName, serviceId }: { serviceName: string; serviceId: string }) {
  const navigate = useNavigate()
  const [service, setService] = useState<ServiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`http://localhost:9200/api/health/${serviceId}`)
        const data = await response.json()
        if (data.success) {
          setService(data.data)
        } else {
          setError('Failed to load service data')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchService()
  }, [serviceId])
  
  const handleClick = () => {
    navigate(`/service/${serviceId}`)
  }
  
  if (isLoading) {
    return (
      <Box
        p={6}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="200px"
      >
        <VStack gap={3}>
          <Spinner size="lg" color="blue.500" />
          <Text fontSize="sm" color="gray.500">Loading {serviceName}...</Text>
        </VStack>
      </Box>
    )
  }
  
  if (error || !service) {
    return (
      <Box
        p={6}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        border="1px solid"
        borderColor="red.200"
      >
        <VStack align="start" gap={2}>
          <Heading size="md">{serviceName}</Heading>
          <Badge colorScheme="red">Error</Badge>
          <Text fontSize="sm" color="red.500">{error || 'Failed to load data'}</Text>
        </VStack>
      </Box>
    )
  }
  
  const statusColor = service.status === 'healthy' ? 'green' : 
                      service.status === 'degraded' ? 'yellow' : 'red'
  
  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      cursor="pointer"
      onClick={handleClick}
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <VStack align="start" gap={3}>
        <HStack justify="space-between" w="100%">
          <Heading size="md">{service.name}</Heading>
          <Badge colorScheme={statusColor}>{service.status}</Badge>
        </HStack>
        
        <Text fontSize="sm" color="gray.600">
          {service.uptime.toFixed(1)}% uptime
        </Text>
        
        <VStack align="start" gap={1} fontSize="sm" w="100%">
          <Text>
            <strong>Response Time:</strong> {service.metrics.responseTime.p50.toFixed(0)}ms
          </Text>
          <Text>
            <strong>Request Rate:</strong> {service.metrics.requestRate.toFixed(0)}/min
          </Text>
          <Text>
            <strong>Error Rate:</strong> {service.metrics.errorRate.toFixed(2)}%
          </Text>
          <Text>
            <strong>Connections:</strong> {service.metrics.activeConnections}
          </Text>
        </VStack>
        
        <Text fontSize="xs" color="blue.500" mt={2}>
          Click to view details →
        </Text>
      </VStack>
    </Box>
  )
}

export function Dashboard() {
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(true)

  // Clean up any leftover services on startup
  useEffect(() => {
    const cleanupOnStartup = async () => {
      console.log('Dashboard starting - cleaning up any leftover services...')
      
      const shutdownUrls = [
        'http://localhost:9200/shutdown',  // Backend
        'http://localhost:8001/shutdown',  // TTS
        'http://localhost:8002/shutdown',  // Whisper
        'http://localhost:7860/shutdown'   // Gradio
      ]

      try {
        for (const url of shutdownUrls) {
          try {
            await fetch(url, { method: 'POST' })
            console.log(`✓ Cleaned up service at ${url}`)
          } catch (error) {
            console.log(`- No service running at ${url}`)
          }
        }
        
        // Wait a moment for services to shutdown
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('✓ Startup cleanup complete')
      } catch (error) {
        console.error('Startup cleanup error:', error)
      } finally {
        setIsCleaningUp(false)
      }
    }

    cleanupOnStartup()
  }, [])

  const shutdownAllServices = async () => {
    if (!confirm('Are you sure you want to shutdown all services?')) {
      return
    }

    setIsShuttingDown(true)
    
    const shutdownUrls = [
      'http://localhost:9200/shutdown',  // Backend
      'http://localhost:8001/shutdown',  // TTS
      'http://localhost:8002/shutdown',  // Whisper
      'http://localhost:7860/shutdown'   // Gradio
    ]

    try {
      for (const url of shutdownUrls) {
        try {
          await fetch(url, { method: 'POST' })
        } catch (error) {
          console.log(`Failed to shutdown ${url} (may not be running)`)
        }
      }
      
      alert('All services shutdown! You can now close this tab.')
    } catch (error) {
      console.error('Shutdown error:', error)
      alert('Some services may not have shutdown properly. Check the console.')
    } finally {
      setIsShuttingDown(false)
    }
  }

  if (isCleaningUp) {
    return (
      <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Heading size="lg">Starting Dashboard...</Heading>
          <Text color="gray.600" textAlign="center">
            Cleaning up any leftover services from previous sessions
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            This ensures a clean startup every time
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <HStack justify="space-between" align="center" mb={2}>
            <Box>
              <Heading size="lg" mb={2}>
                Microservices Dashboard
              </Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                Real-time monitoring of your microservices architecture with REAL AI services
              </Text>
            </Box>
            
            <Button
              onClick={shutdownAllServices}
              disabled={isShuttingDown}
              colorScheme="red"
              variant="outline"
              size="sm"
            >
              <HStack gap={1}>
                <FiPower />
                <Text>{isShuttingDown ? 'Shutting Down...' : 'Shutdown All'}</Text>
              </HStack>
            </Button>
          </HStack>
        </Box>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          <ServiceCard serviceName="API Gateway" serviceId="api-gateway" />
          <ServiceCard serviceName="Chat Service (REAL AI)" serviceId="chat-service" />
          <ServiceCard serviceName="Image Service (REAL AI)" serviceId="image-service" />
          <ServiceCard serviceName="TTS/STT Service" serviceId="tts-stt-service" />
          <ServiceCard serviceName="Ollama LLM" serviceId="ollama-service" />
        </SimpleGrid>
      </Container>
    </Box>
  )
}
