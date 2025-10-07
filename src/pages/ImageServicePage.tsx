import { useState } from 'react'
import { Box, Container, Heading, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export function ImageServicePage() {
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
            <Heading size="lg">Image Generation Service</Heading>
            <Badge colorScheme="green">Online</Badge>
          </HStack>
          
          <Text color="gray.600">
            Generate AI images using 2025 SOTA models (FLUX.1, SD 3.5, FLUX.2). Choose from 12+ modern models with full control.
          </Text>
        </VStack>

        {/* Embedded Gradio App */}
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
              <Heading size="md">AI Image Generator Studio</Heading>
              <Badge colorScheme="blue">Gradio Interface</Badge>
            </HStack>
          </Box>
          
          <Box h="800px">
            <iframe
              src="http://localhost:7860"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Gradio Image Generator"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}