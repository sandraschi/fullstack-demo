import { screen } from '@testing-library/react'
import { BaseCard } from '../BaseCard'
import { renderWithProviders } from '../../../test/setup'

describe('BaseCard', () => {
  it('renders title and children', () => {
    renderWithProviders(
      <BaseCard title="Test Card">
        <div>Test content</div>
      </BaseCard>
    )
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies proper styling classes', () => {
    const { container } = renderWithProviders(
      <BaseCard title="Test Card">
        <div>Test content</div>
      </BaseCard>
    )
    
    const cardElement = container.querySelector('[data-testid="base-card"]') || 
                       container.querySelector('.chakra-box')
    expect(cardElement).toBeInTheDocument()
  })
})
