import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { BaseCard } from './BaseCard'
import { TimeSeriesChart } from './TimeSeriesChart'

interface ChartCardProps {
  title: string
  data: Array<{
    timestamp: string
    value: number
    label?: string
  }>
  yAxisLabel?: string
  color?: string
}

export function ChartCard({ title, data, yAxisLabel, color = '#3182ce' }: ChartCardProps) {
  return (
    <BaseCard title={title}>
      <VStack align="stretch" gap={4}>
        <Box h="200px">
          <TimeSeriesChart data={data} color={color} yAxisLabel={yAxisLabel} />
        </Box>
        
        {data.length > 0 && (
          <HStack justify="space-between" fontSize="sm" color="gray.600">
            <Text>
              Latest: {data[data.length - 1]?.value.toFixed(1)} {yAxisLabel}
            </Text>
            <Text>
              {data.length} data points
            </Text>
          </HStack>
        )}
      </VStack>
    </BaseCard>
  )
}
