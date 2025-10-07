import { useState, useEffect } from 'react'
import { GridItem } from '@/types/dashboard.types'

// Default grid configuration
const DEFAULT_GRID_CONFIG = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 60,
  margin: [10, 10] as [number, number],
  containerPadding: [20, 20] as [number, number],
}

// Default card sizes
const DEFAULT_CARD_SIZES = {
  service: { w: 3, h: 2 },
  metric: { w: 2, h: 2 },
  chart: { w: 4, h: 3 },
  large: { w: 6, h: 4 },
}

// Storage key for localStorage
const STORAGE_KEY = 'dashboard-grid-layout'

// Hook for managing grid layout state
export function useGridLayout() {
  const [layout, setLayout] = useState<GridItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load layout from localStorage on mount
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(STORAGE_KEY)
      if (savedLayout) {
        setLayout(JSON.parse(savedLayout))
      }
    } catch (error) {
      console.warn('Failed to load grid layout from localStorage:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && layout.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
      } catch (error) {
        console.warn('Failed to save grid layout to localStorage:', error)
      }
    }
  }, [layout, isLoaded])

  // Update layout
  const updateLayout = (newLayout: GridItem[]) => {
    setLayout(newLayout)
  }

  // Add new item to layout
  const addItem = (item: GridItem) => {
    setLayout(prev => [...prev, item])
  }

  // Remove item from layout
  const removeItem = (itemId: string) => {
    setLayout(prev => prev.filter(item => item.i !== itemId))
  }

  // Reset layout to default
  const resetLayout = () => {
    setLayout([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    layout,
    updateLayout,
    addItem,
    removeItem,
    resetLayout,
    isLoaded,
    gridConfig: DEFAULT_GRID_CONFIG,
    cardSizes: DEFAULT_CARD_SIZES,
  }
}

