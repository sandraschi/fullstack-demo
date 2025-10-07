import { screen } from '@testing-library/react'
import { MetricCard } from '../MetricCard'
import { renderWithProviders } from '../../../test/setup'

describe('MetricCard', () => {
  it('renders metric title and value', () => {
    renderWithProviders(
      <MetricCard
        title="Total Requests"
        value={1250}
        unit="req/min"
        trend={12.5}
        trendDirection="up"
      />
    )
    
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('1.3K')).toBeInTheDocument()
    expect(screen.getByText('req/min')).toBeInTheDocument()
  })

  it('displays positive trend correctly', () => {
    renderWithProviders(
      <MetricCard
        title="Total Requests"
        value={1250}
        unit="req/min"
        trend={12.5}
        trendDirection="up"
      />
    )
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('displays negative trend correctly', () => {
    renderWithProviders(
      <MetricCard
        title="Error Rate"
        value={0.03}
        unit="%"
        trend={-15.0}
        trendDirection="down"
      />
    )
    
    expect(screen.getByText('-15.0%')).toBeInTheDocument()
  })

  it('displays stable trend correctly', () => {
    renderWithProviders(
      <MetricCard
        title="Memory Usage"
        value={45}
        unit="%"
        trend={0.5}
        trendDirection="stable"
      />
    )
    
    expect(screen.getByText('+0.5%')).toBeInTheDocument()
  })

  it('formats large numbers correctly', () => {
    renderWithProviders(
      <MetricCard
        title="Total Requests"
        value={1500000}
        unit="req"
        trend={5.0}
        trendDirection="up"
      />
    )
    
    expect(screen.getByText('1.5M')).toBeInTheDocument()
  })

  it('formats medium numbers correctly', () => {
    renderWithProviders(
      <MetricCard
        title="Total Requests"
        value={15000}
        unit="req"
        trend={5.0}
        trendDirection="up"
      />
    )
    
    expect(screen.getByText('15.0K')).toBeInTheDocument()
  })
})
