import { Box, Container, Heading, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export function ChatServicePage() {
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
            <Heading size="lg">Chat Service</Heading>
            <Badge colorScheme="green">Online</Badge>
          </HStack>
          
          <Text color="gray.600">
            Chat with AI models using Ollama or LM Studio. Choose from multiple AI characters and personalities.
          </Text>
        </VStack>

        {/* Embedded LM Studio or Ollama */}
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
              <Heading size="md">AI Chat Interface</Heading>
              <Badge colorScheme="blue">LM Studio / Ollama</Badge>
            </HStack>
          </Box>
          
          <Box h="800px">
            <iframe
              src="http://localhost:1234"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="LM Studio Chat Interface"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}