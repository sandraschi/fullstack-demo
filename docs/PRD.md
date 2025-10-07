# Fullstack Demo - Product Requirements Document

**Version:** 1.0  
**Date:** 2025-10-06  
**Status:** Draft  

## Executive Summary

Fullstack-demo is a **reference implementation** of clean React dashboard architecture, built to demonstrate how to avoid the monolithic component anti-patterns that plague AI-generated dashboards. This project serves as both a working example and a template for building maintainable, scalable microservice dashboards.

### Key Principles
- **200-line file limit** enforced via .cursorrules
- **Strict separation of concerns** (data/logic/presentation)
- **Component library first** (Chakra UI - no custom CSS)
- **Type-safe** (TypeScript strict mode)
- **Testable** (isolated, small components)

## Problem Statement

### Current Pain Points
1. **LLM-generated dashboards become unmaintainable**
   - Single files with 1000+ lines
   - Inline styles, embedded logic, tangled concerns
   - One edit breaks everything (brittle)
   - Difficult to test or refactor

2. **Common Anti-Patterns**
   - Massive monolithic components
   - Prop drilling through 5+ levels
   - Data fetching scattered everywhere
   - Inline event handlers with business logic
   - CSS/styling chaos (inline styles + CSS modules + styled-components)

3. **Why This Happens**
   - LLMs generate complete solutions in single files
   - No natural refactoring pressure during generation
   - Mixed concerns feel "simpler" initially but collapse under change
   - Developers don't have time to refactor before next feature

## Solution Overview

### Architecture Philosophy
**"Small files, clear boundaries, composition over complexity"**

### Core Constraints
- **Max 200 lines per file** (hard limit)
- **Max 3 props per component** (forces composition)
- **Max 2 JSX nesting levels** (prevents pyramid code)
- **Single responsibility** (one concern per file)

### Tech Stack

**Frontend Core:**
- React 18+ (functional components + hooks only)
- TypeScript 5+ (strict mode enabled)
- Vite (fast builds, HMR)

**UI Framework:**
- Chakra UI 3.x (component library)
- react-icons (icon library)
- react-grid-layout (dashboard grid system)

**Data & State:**
- TanStack Query 5.x (server state management)
- Zustand 4.x (global client state)
- Axios (HTTP client)

**Development:**
- ESLint + Prettier (code quality)
- Vitest (unit tests)
- Playwright (E2E tests)

## User Stories

### As a Developer
1. **I want to add a new service card in < 10 minutes**
   - Create type definition
   - Create data hook
   - Create component
   - Compose in dashboard
   - All under 200 lines each

2. **I want to understand any component in < 2 minutes**
   - File is small enough to read entirely
   - Single responsibility is obvious
   - Dependencies are explicit (imports)
   - Types document behavior

3. **I want to refactor without fear**
   - Tests catch breaking changes
   - Small files = small blast radius
   - Clear boundaries = clear dependencies

### As a Team Lead
1. **I want consistent code quality**
   - .cursorrules enforces patterns
   - Cursor Agent generates compliant code
   - PR reviews focus on logic, not style

2. **I want new developers productive fast**
   - Clear patterns to follow
   - Small files = easy to understand
   - Examples in every category

## Functional Requirements

### FR-1: Dashboard Layout
**Priority:** P0 (Critical)

**Description:**  
Dashboard displays microservice status cards in a responsive grid layout.

**Acceptance Criteria:**
- Grid is 12 columns on desktop, responsive on mobile
- Cards can be dragged to reorder
- Cards can be resized (within constraints)
- Layout persists to localStorage
- Supports dark/light theme

**Components:**
- `DashboardGrid.tsx` - Grid container
- `TopBar.tsx` - Header with actions
- `Dashboard.tsx` - Page composition

### FR-2: Service Status Cards
**Priority:** P0 (Critical)

**Description:**  
Each microservice displays status, health metrics, and basic info in a card.

**Acceptance Criteria:**
- Shows service name and current status (healthy/degraded/down)
- Color-coded badge (green/yellow/red)
- Displays uptime percentage
- Shows last check timestamp
- Auto-refreshes every 30 seconds

**Components:**
- `BaseCard.tsx` - Reusable wrapper
- `ServiceCard.tsx` - Service-specific implementation
- `useServiceStatus.ts` - Data fetching hook

### FR-3: Metrics Display
**Priority:** P1 (High)

**Description:**  
Numeric metrics with trend indicators for key service KPIs.

**Acceptance Criteria:**
- Displays large numeric value
- Shows unit (ms, %, req/s, etc)
- Trend arrow (up/down) with percentage change
- Color-coded trend (green=good, red=bad)
- Tooltip with historical context

**Components:**
- `MetricCard.tsx` - Metric display
- `useServiceMetrics.ts` - Metric data hook

### FR-4: Time-Series Charts
**Priority:** P1 (High)

**Description:**  
Visualize service metrics over time (response times, error rates, throughput).

**Acceptance Criteria:**
- Line chart for time-series data
- Responsive to container size
- Interactive tooltips on hover
- Time range selector (1h, 6h, 24h, 7d)
- Smooth updates without full re-render

**Components:**
- `ChartCard.tsx` - Chart wrapper
- `TimeSeriesChart.tsx` - Recharts implementation
- `useTimeSeriesData.ts` - Time-series hook

### FR-5: API Mocking (Development)
**Priority:** P0 (Critical for development)

**Description:**  
Mock API responses for development without running actual services.

**Acceptance Criteria:**
- Mock endpoints return realistic data
- Simulated latency (50-200ms)
- Occasional error responses (5% rate)
- Status changes over time
- Configurable via environment variables

**Implementation:**
- MSW (Mock Service Worker) for API mocking
- Mock data generators with realistic values

## Non-Functional Requirements

### NFR-1: Performance
- Initial page load < 2 seconds
- Dashboard refresh < 500ms
- Grid interactions < 16ms (60 FPS)
- Bundle size < 500KB (gzipped)

### NFR-2: Code Quality
- **ALL files under 200 lines** (enforced by .cursorrules)
- TypeScript strict mode enabled
- 80%+ test coverage
- Zero ESLint errors
- Prettier formatted

### NFR-3: Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios meet standards

### NFR-4: Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Architecture

### Directory Structure
```
fullstack-demo/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── DashboardGrid.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── cards/
│   │   │   ├── BaseCard.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── ChartCard.tsx
│   │   │   └── StatusCard.tsx
│   │   └── microservices/
│   │       ├── ServiceStatusCard.tsx
│   │       └── ServiceMetricsCard.tsx
│   ├── hooks/
│   │   ├── useServiceStatus.ts
│   │   ├── useServiceMetrics.ts
│   │   ├── useTimeSeriesData.ts
│   │   └── useGridLayout.ts
│   ├── types/
│   │   ├── microservices.types.ts
│   │   └── dashboard.types.ts
│   ├── stores/
│   │   └── dashboard.store.ts
│   ├── pages/
│   │   └── Dashboard.tsx
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── data.ts
│   ├── theme.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   ├── PRD.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── ARCHITECTURE.md
│   └── CURSOR_GUIDE.md
├── tests/
│   ├── unit/
│   └── e2e/
├── .cursorrules
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Data Flow

```
API/Mock → TanStack Query Hook → Component Props → Chakra UI Component
                      ↓
              Zustand Store (global state)
                      ↓
           localStorage (layout persistence)
```

### Component Hierarchy

```
App
└── Dashboard (page)
    ├── TopBar (layout)
    └── DashboardGrid (layout)
        ├── ServiceStatusCard (microservice)
        │   └── BaseCard (card)
        ├── MetricCard (card)
        └── ChartCard (card)
            └── TimeSeriesChart (chart)
```

## Service Definitions

### Monitored Services (Mock Data)

1. **API Gateway**
   - Status, uptime, request rate, error rate
   - Response time metrics (p50, p95, p99)
   - Active connections

2. **Auth Service**
   - Authentication success/failure rates
   - Token generation rate
   - Active sessions

3. **Database Service**
   - Connection pool status
   - Query performance
   - Replication lag

4. **Cache Service**
   - Hit/miss ratio
   - Memory usage
   - Eviction rate

## MVP Scope

### Phase 1 - Core Dashboard (Week 1)
- [x] Project setup with Vite + TypeScript
- [ ] Chakra UI configuration + theme
- [ ] Base components (BaseCard, TopBar, DashboardGrid)
- [ ] Mock API setup with MSW
- [ ] 2 service cards (API Gateway, Auth Service)

### Phase 2 - Data & Interactivity (Week 1)
- [ ] TanStack Query setup
- [ ] Data hooks for all services
- [ ] Grid layout persistence
- [ ] Dark/light theme toggle
- [ ] Auto-refresh every 30s

### Phase 3 - Metrics & Charts (Week 2)
- [ ] MetricCard component with trends
- [ ] ChartCard component with Recharts
- [ ] Time-series data hooks
- [ ] Time range selector

### Phase 4 - Polish & Testing (Week 2)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Unit tests for all components
- [ ] E2E tests for core flows
- [ ] Documentation completion

## Success Metrics

### Code Quality
- All files < 200 lines ✓
- Zero TypeScript errors ✓
- 80%+ test coverage ✓
- Zero ESLint errors ✓

### Developer Experience
- Add new service card in < 10 minutes
- Understand any component in < 2 minutes
- Refactor without breaking tests

### Performance
- Lighthouse score > 90
- Bundle size < 500KB
- Dashboard refresh < 500ms

## Out of Scope (v1)

- Real backend integration (mock only)
- User authentication
- Multi-dashboard support
- Historical data storage
- Alert configuration
- Export/reporting features

## Dependencies

### Required
- Node.js 18+
- npm 9+
- Modern browser (Chrome/Firefox/Safari/Edge)

### Optional
- Cursor IDE (for .cursorrules integration)
- VSCode (alternative IDE)

## Risks & Mitigation

### Risk: 200-line limit too restrictive
**Mitigation:** Provides examples of proper decomposition patterns. If needed, can increase to 250 lines in Phase 2.

### Risk: Chakra UI learning curve
**Mitigation:** Comprehensive component examples. Team familiar with similar libraries (MUI, Ant Design).

### Risk: Mock data feels unrealistic
**Mitigation:** Use realistic ranges and patterns. Add configurable scenarios (high load, errors, etc).

## References

- Gemini conversation on dashboard architecture (2025-10-06)
- Cursor .cursorrules best practices: cursor.directory
- Chakra UI docs: chakra-ui.com
- TanStack Query docs: tanstack.com/query

## Appendix A: Example Service Response

```json
{
  "id": "api-gateway",
  "name": "API Gateway",
  "status": "healthy",
  "uptime": 99.97,
  "lastCheck": "2025-10-06T18:30:00Z",
  "metrics": {
    "responseTime": {
      "p50": 45,
      "p95": 120,
      "p99": 250
    },
    "requestRate": 1250,
    "errorRate": 0.03,
    "activeConnections": 342
  }
}
```

## Appendix B: Cursor Commands

See `docs/CURSOR_GUIDE.md` for detailed Cursor IDE integration instructions.
