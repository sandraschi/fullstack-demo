import React from 'react'
import { Box, Button, Text, VStack } from '@chakra-ui/react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

// Default fallback component
export function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Box p={4} textAlign="center">
      <VStack gap={4}>
        <Text color="red.500" fontWeight="bold">
          Something went wrong
        </Text>
        <Text fontSize="sm" color="gray.600">
          {error.message}
        </Text>
        <Button onClick={retry} colorScheme="blue" size="sm">
          Try Again
        </Button>
      </VStack>
    </Box>
  )
}
