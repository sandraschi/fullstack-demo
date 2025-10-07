import { Box } from '@chakra-ui/react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useGridLayout } from '@/hooks/useGridLayout'
import { ServiceCard } from '@/components/microservices/ServiceCard'
import { MetricCard } from '@/components/cards/MetricCard'
import { ChartCard } from '@/components/cards/ChartCard'
import { generateMetricData, MOCK_TIME_SERIES } from '@/mocks/timeSeriesData'

const ResponsiveGridLayout = WidthProvider(Responsive)

export function AdvancedDashboardGrid() {
  const { layout, updateLayout, gridConfig, cardSizes, isLoaded } = useGridLayout()
  const metricData = generateMetricData()

  // Generate initial layout if empty
  const getInitialLayout = () => {
    if (layout.length > 0) return layout

    const initialLayout = [
      // Service cards
      { i: 'api-gateway', x: 0, y: 0, w: cardSizes.service.w, h: cardSizes.service.h },
      { i: 'chat-service', x: 3, y: 0, w: cardSizes.service.w, h: cardSizes.service.h },
      { i: 'image-service', x: 6, y: 0, w: cardSizes.service.w, h: cardSizes.service.h },
      { i: 'tts-stt-service', x: 9, y: 0, w: cardSizes.service.w, h: cardSizes.service.h },

      // Metric cards
      { i: 'total-requests', x: 0, y: 2, w: cardSizes.metric.w, h: cardSizes.metric.h },
      { i: 'avg-response-time', x: 2, y: 2, w: cardSizes.metric.w, h: cardSizes.metric.h },
      { i: 'error-rate', x: 4, y: 2, w: cardSizes.metric.w, h: cardSizes.metric.h },
      { i: 'active-connections', x: 6, y: 2, w: cardSizes.metric.w, h: cardSizes.metric.h },

      // Chart cards
      { i: 'response-time-chart', x: 0, y: 4, w: cardSizes.chart.w, h: cardSizes.chart.h },
      { i: 'request-rate-chart', x: 4, y: 4, w: cardSizes.chart.w, h: cardSizes.chart.h },
      { i: 'error-rate-chart', x: 8, y: 4, w: cardSizes.chart.w, h: cardSizes.chart.h },
    ]

    return initialLayout
  }

  const currentLayout = getInitialLayout()

  const handleLayoutChange = (newLayout: any) => {
    updateLayout(newLayout)
  }

  if (!isLoaded) {
    return <Box>Loading dashboard...</Box>
  }

  return (
    <Box>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: currentLayout, md: currentLayout, sm: currentLayout, xs: currentLayout, xxs: currentLayout }}
        breakpoints={gridConfig.breakpoints}
        cols={gridConfig.cols}
        rowHeight={gridConfig.rowHeight}
        margin={gridConfig.margin}
        containerPadding={gridConfig.containerPadding}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".drag-handle"
      >
            {/* Service Cards */}
            <Box key="api-gateway">
              <ServiceCard serviceId="api-gateway" serviceName="API Gateway" />
            </Box>
            <Box key="chat-service">
              <ServiceCard serviceId="chat-service" serviceName="Chat Service" />
            </Box>
            <Box key="image-service">
              <ServiceCard serviceId="image-service" serviceName="Image Service" />
            </Box>
            <Box key="tts-stt-service">
              <ServiceCard serviceId="tts-stt-service" serviceName="TTS/STT Service" />
            </Box>

            {/* Metric Cards */}
        <Box key="total-requests">
          <MetricCard
            title="Total Requests"
            value={metricData.totalRequests.value}
            unit={metricData.totalRequests.unit}
            trend={metricData.totalRequests.trend}
            trendDirection={metricData.totalRequests.trendDirection}
          />
        </Box>
        <Box key="avg-response-time">
          <MetricCard
            title="Avg Response Time"
            value={metricData.avgResponseTime.value}
            unit={metricData.avgResponseTime.unit}
            trend={metricData.avgResponseTime.trend}
            trendDirection={metricData.avgResponseTime.trendDirection}
          />
        </Box>
        <Box key="error-rate">
          <MetricCard
            title="Error Rate"
            value={metricData.errorRate.value}
            unit={metricData.errorRate.unit}
            trend={metricData.errorRate.trend}
            trendDirection={metricData.errorRate.trendDirection}
          />
        </Box>
        <Box key="active-connections">
          <MetricCard
            title="Active Connections"
            value={metricData.activeConnections.value}
            unit={metricData.activeConnections.unit}
            trend={metricData.activeConnections.trend}
            trendDirection={metricData.activeConnections.trendDirection}
          />
        </Box>

        {/* Chart Cards */}
        <Box key="response-time-chart">
          <ChartCard
            title="Response Time Trend"
            data={MOCK_TIME_SERIES.responseTime}
            yAxisLabel="ms"
            color="#3182ce"
          />
        </Box>
        <Box key="request-rate-chart">
          <ChartCard
            title="Request Rate Trend"
            data={MOCK_TIME_SERIES.requestRate}
            yAxisLabel="req/min"
            color="#38a169"
          />
        </Box>
        <Box key="error-rate-chart">
          <ChartCard
            title="Error Rate Trend"
            data={MOCK_TIME_SERIES.errorRate}
            yAxisLabel="%"
            color="#e53e3e"
          />
        </Box>
      </ResponsiveGridLayout>
    </Box>
  )
}
