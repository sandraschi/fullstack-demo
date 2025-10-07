import React, { useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TimeSeriesChartProps {
  data: Array<{
    timestamp: string
    value: number
    label?: string
  }>
  color?: string
  yAxisLabel?: string
}

export const TimeSeriesChart = React.memo(function TimeSeriesChart({ data, color = '#3182ce', yAxisLabel }: TimeSeriesChartProps) {
  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }, [])

  // Format tooltip
  const formatTooltip = useCallback((value: number, name: string) => {
    return [`${value.toFixed(1)} ${yAxisLabel || ''}`, name]
  }, [yAxisLabel])

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => data, [data])

  if (data.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatTimestamp}
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip 
          labelFormatter={(label) => `Time: ${formatTimestamp(label)}`}
          formatter={formatTooltip}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})
