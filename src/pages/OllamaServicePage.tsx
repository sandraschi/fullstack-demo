import { Box, Container, Heading, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export function OllamaServicePage() {
  const navigate = useNavigate()

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
            <Heading size="lg">Ollama LLM Service</Heading>
            <Badge colorScheme="green">Online</Badge>
          </HStack>
          
          <Text color="gray.600">
            Local LLM service using Ollama. Run large language models locally with full privacy and control.
          </Text>
        </VStack>

        {/* Embedded Ollama Web UI */}
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box p={4} borderBottom="1px solid" borderColor="gray.200">
            <HStack justify="space-between">
              <Heading size="md">Ollama Web Interface</Heading>
              <Badge colorScheme="blue">Local LLM</Badge>
            </HStack>
          </Box>
          
          <Box h="800px">
            <iframe
              src="http://localhost:11434"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Ollama Web Interface"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
