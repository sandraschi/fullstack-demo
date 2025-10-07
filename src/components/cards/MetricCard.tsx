import React, { useMemo, useCallback } from 'react'
import { Box, HStack, Text, VStack, Icon } from '@chakra-ui/react'
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'
import { BaseCard } from './BaseCard'
import { MetricCardProps } from '@/types/service.types'

export const MetricCard = React.memo(function MetricCard({ title, value, unit, trend, trendDirection }: MetricCardProps) {
  const getTrendIcon = useCallback(() => {
    switch (trendDirection) {
      case 'up':
        return FiTrendingUp
      case 'down':
        return FiTrendingDown
      default:
        return FiMinus
    }
  }, [trendDirection])

  const getTrendColor = useCallback(() => {
    switch (trendDirection) {
      case 'up':
        return 'green.500'
      case 'down':
        return 'red.500'
      default:
        return 'gray.500'
    }
  }, [trendDirection])

  const formatValue = useCallback((val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`
    }
    return val.toFixed(1)
  }, [])

  const formatTrend = useCallback((val: number) => {
    const sign = val > 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}%`
  }, [])

  const formattedValue = useMemo(() => formatValue(value), [value, formatValue])
  const formattedTrend = useMemo(() => formatTrend(trend), [trend, formatTrend])
  const trendIcon = useMemo(() => getTrendIcon(), [getTrendIcon])
  const trendColor = useMemo(() => getTrendColor(), [getTrendColor])

  return (
    <BaseCard title={title}>
      <VStack align="start" gap={3}>
        <HStack align="baseline" gap={2}>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800" _dark={{ color: 'gray.100' }}>
            {formattedValue}
          </Text>
          <Text fontSize="md" color="gray.600" _dark={{ color: 'gray.400' }}>
            {unit}
          </Text>
        </HStack>
        
        <HStack gap={2}>
          <Icon as={trendIcon} color={trendColor} />
          <Text fontSize="sm" color={trendColor} fontWeight="medium">
            {formattedTrend}
          </Text>
          <Text fontSize="sm" color="gray.500">
            vs last period
          </Text>
        </HStack>
      </VStack>
    </BaseCard>
  )
})
