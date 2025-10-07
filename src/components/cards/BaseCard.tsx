import { Box, Heading } from '@chakra-ui/react'

interface Props {
  title: string
  children: React.ReactNode
}

export function BaseCard({ title, children }: Props) {
  return (
    <Box
      data-testid="base-card"
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      p={4}
      h="100%"
      _dark={{ bg: 'gray.800' }}
    >
      <Heading size="md" mb={3}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}
