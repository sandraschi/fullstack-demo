import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface DashboardState {
  selectedService: string | null
  refreshInterval: number
  theme: 'light' | 'dark'
  showMetrics: boolean
  showCharts: boolean
  setSelectedService: (service: string | null) => void
  setRefreshInterval: (interval: number) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleMetrics: () => void
  toggleCharts: () => void
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        selectedService: null,
        refreshInterval: 30000, // 30 seconds
        theme: 'light',
        showMetrics: true,
        showCharts: true,
        setSelectedService: (service) => set({ selectedService: service }),
        setRefreshInterval: (interval) => set({ refreshInterval: interval }),
        setTheme: (theme) => set({ theme }),
        toggleMetrics: () => set((state) => ({ showMetrics: !state.showMetrics })),
        toggleCharts: () => set((state) => ({ showCharts: !state.showCharts })),
      }),
      { 
        name: 'dashboard-store',
        partialize: (state) => ({
          refreshInterval: state.refreshInterval,
          theme: state.theme,
          showMetrics: state.showMetrics,
          showCharts: state.showCharts,
        }),
      }
    )
  )
)

