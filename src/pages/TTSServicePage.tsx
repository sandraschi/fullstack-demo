import { Box, Container, Heading, Text, VStack, HStack, Badge, Button, SimpleGrid } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export function TTSServicePage() {
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
            <Heading size="lg">TTS/STT Service</Heading>
            <Badge colorScheme="green">Online</Badge>
          </HStack>
          
          <Text color="gray.600">
            Text-to-Speech and Speech-to-Text services. Convert text to speech or transcribe audio using AI.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          {/* TTS Service */}
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
                <Heading size="md">Text-to-Speech</Heading>
                <Badge colorScheme="purple">Windows SAPI</Badge>
              </HStack>
            </Box>
            
            <Box h="400px">
              <iframe
                src="http://localhost:8001"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="TTS Service"
              />
            </Box>
          </Box>

          {/* STT Service */}
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
                <Heading size="md">Speech-to-Text</Heading>
                <Badge colorScheme="orange">Whisper API</Badge>
              </HStack>
            </Box>
            
            <Box h="400px">
              <iframe
                src="http://localhost:8002"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="STT Service"
              />
            </Box>
          </Box>
        </SimpleGrid>

        {/* Direct Speech Input */}
        <Box mt={8}>
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
                <Heading size="md">Direct Speech Input</Heading>
                <Badge colorScheme="green">Microphone</Badge>
              </HStack>
            </Box>
            
            <Box h="300px">
              <iframe
                src="./speech-input.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Direct Speech Input"
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}