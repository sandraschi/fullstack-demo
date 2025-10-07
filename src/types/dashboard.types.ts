// Dashboard configuration types
export interface DashboardConfig {
  refreshInterval: number
  theme: 'light' | 'dark'
  gridLayout: GridLayout
}

// Grid layout types
export interface GridLayout {
  breakpoints: Record<string, number>
  cols: Record<string, number>
  rowHeight: number
  margin: [number, number]
  containerPadding: [number, number]
}

// Card size types
export interface CardSize {
  w: number
  h: number
}

export interface CardSizes {
  service: CardSize
  metric: CardSize
  chart: CardSize
  large: CardSize
}

// Grid item types
export interface GridItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

// Card variant types
export type CardVariant = 'metric' | 'status' | 'chart'
export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

