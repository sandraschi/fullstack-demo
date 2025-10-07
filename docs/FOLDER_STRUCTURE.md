# Strict Folder Layout Plan - Chakra UI Project

**Purpose:** Complete folder structure with every file location defined  
**Enforced by:** .cursorrules + this document  
**Rationale:** Gemini's recommendation for preventing monolithic code

## Complete Project Structure

```
fullstack-demo/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx              # Header with icon buttons (< 150 lines)
│   │   │   ├── Sidebar.tsx             # Navigation sidebar (< 150 lines)
│   │   │   ├── DashboardGrid.tsx       # react-grid-layout wrapper (< 100 lines)
│   │   │   ├── ErrorBoundary.tsx       # Error boundary (< 80 lines)
│   │   │   └── index.ts                # Barrel export
│   │   │
│   │   ├── cards/
│   │   │   ├── BaseCard.tsx            # Base wrapper (< 60 lines)
│   │   │   ├── MetricCard.tsx          # Number + trend (< 100 lines)
│   │   │   ├── ChartCard.tsx           # Chart wrapper (< 80 lines)
│   │   │   ├── StatusCard.tsx          # Status badge display (< 80 lines)
│   │   │   ├── TableCard.tsx           # Data table wrapper (< 100 lines)
│   │   │   └── index.ts                # Barrel export
│   │   │
│   │   ├── microservices/
│   │   │   ├── ApiGatewayCard.tsx      # API Gateway metrics (< 150 lines)
│   │   │   ├── AuthServiceCard.tsx     # Auth service metrics (< 150 lines)
│   │   │   ├── DatabaseCard.tsx        # Database metrics (< 150 lines)
│   │   │   ├── CacheCard.tsx           # Cache metrics (< 150 lines)
│   │   │   ├── ChatServiceCard.tsx     # Chat service (backend) (< 150 lines)
│   │   │   ├── ImageServiceCard.tsx    # Image gen service (< 150 lines)
│   │   │   ├── TtsServiceCard.tsx      # TTS/STT service (< 150 lines)
│   │   │   └── index.ts                # Barrel export
│   │   │
│   │   ├── charts/
│   │   │   ├── LineChart.tsx           # Time series (< 150 lines)
│   │   │   ├── BarChart.tsx            # Bar chart (< 150 lines)
│   │   │   ├── PieChart.tsx            # Pie chart (< 150 lines)
│   │   │   └── index.ts                # Barrel export
│   │   │
│   │   └── ui/                          # Reusable UI elements
│   │       ├── LoadingSpinner.tsx      # Loading state (< 30 lines)
│   │       ├── EmptyState.tsx          # Empty state UI (< 50 lines)
│   │       ├── ErrorMessage.tsx        # Error display (< 50 lines)
│   │       └── index.ts                # Barrel export
│   │
│   ├── hooks/
│   │   ├── useServiceStatus.ts         # Service health hook (< 80 lines)
│   │   ├── useServiceMetrics.ts        # Service metrics hook (< 80 lines)
│   │   ├── useTimeSeriesData.ts        # Time series data (< 100 lines)
│   │   ├── useGridLayout.ts            # Grid layout persistence (< 60 lines)
│   │   ├── useWebSocket.ts             # WebSocket connection (< 100 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── types/
│   │   ├── microservices.types.ts      # Service data types (< 150 lines)
│   │   ├── dashboard.types.ts          # Dashboard config types (< 100 lines)
│   │   ├── chart.types.ts              # Chart data types (< 100 lines)
│   │   ├── api.types.ts                # API response types (< 100 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── stores/
│   │   ├── dashboard.store.ts          # Dashboard state (< 50 lines)
│   │   ├── theme.store.ts              # Theme preferences (< 30 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── services/
│   │   ├── api.ts                      # Axios instance config (< 50 lines)
│   │   ├── websocket.ts                # WebSocket client (< 80 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── config/
│   │   ├── constants.ts                # App constants (< 50 lines)
│   │   ├── endpoints.ts                # API endpoints (< 50 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx               # Main dashboard (< 150 lines)
│   │   ├── Settings.tsx                # Settings page (< 150 lines)
│   │   ├── NotFound.tsx                # 404 page (< 50 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── mocks/
│   │   ├── handlers.ts                 # MSW handlers (< 150 lines)
│   │   ├── data.ts                     # Mock data generators (< 150 lines)
│   │   ├── browser.ts                  # Browser worker (< 30 lines)
│   │   └── index.ts                    # Barrel export
│   │
│   ├── theme.ts                        # Chakra UI theme (< 200 lines)
│   ├── App.tsx                         # Root component (< 100 lines)
│   ├── main.tsx                        # Entry point (< 50 lines)
│   └── vite-env.d.ts                   # Vite types
│
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   │   ├── BaseCard.test.tsx
│   │   │   │   └── MetricCard.test.tsx
│   │   │   └── layout/
│   │   │       └── TopBar.test.tsx
│   │   ├── hooks/
│   │   │   └── useServiceStatus.test.ts
│   │   └── setup.ts                    # Test setup
│   │
│   └── e2e/
│       ├── dashboard.spec.ts           # Dashboard E2E tests
│       └── playwright.config.ts
│
├── docs/                                # Documentation (already created)
│   ├── PRD.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── CURSOR_GUIDE.md
│   ├── PHASE_*.md
│   ├── BACKEND_*.md
│   └── FOLDER_STRUCTURE.md             # This file
│
├── .cursorrules                         # Cursor AI rules
├── .env.example                         # Environment template
├── .env.local                           # Local environment (gitignored)
├── .eslintrc.cjs                        # ESLint config
├── .prettierrc                          # Prettier config
├── .gitignore
├── index.html                           # HTML entry point
├── package.json
├── tsconfig.json                        # TypeScript config
├── tsconfig.node.json                   # Node TypeScript config
├── vite.config.ts                       # Vite config
└── README.md
```

## File Naming Conventions

### Components
- **PascalCase.tsx** for component files
- Match component name: `BaseCard.tsx` exports `BaseCard`
- Index files: `index.ts` (lowercase) for barrel exports

### Hooks
- **camelCase.ts** starting with `use`: `useServiceStatus.ts`
- One hook per file
- Export named function matching filename

### Types
- **camelCase.types.ts**: `microservices.types.ts`
- Group related types in single file
- Use namespaces if needed

### Stores
- **camelCase.store.ts**: `dashboard.store.ts`
- One store per domain
- Keep stores tiny (< 50 lines)

## Barrel Export Pattern

Each folder with multiple files MUST have `index.ts`:

```typescript
// components/cards/index.ts
export { BaseCard } from './BaseCard';
export { MetricCard } from './MetricCard';
export { ChartCard } from './ChartCard';
export { StatusCard } from './StatusCard';
export { TableCard } from './TableCard';
```

**Benefits:**
- Cleaner imports: `import { BaseCard, MetricCard } from '@/components/cards'`
- Easier refactoring
- Clear public API

## Import Alias Configuration

Use `@/` prefix for all src imports:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Usage:**
```typescript
import { BaseCard } from '@/components/cards';
import { useServiceStatus } from '@/hooks';
import { ServiceData } from '@/types';
```

## File Size Enforcement

### Automated Checking (Optional)

Create `scripts/check-file-sizes.ts`:
```typescript
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const MAX_LINES = 200;
const violations: string[] = [];

function checkDirectory(dir: string) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', 'build'].includes(file)) {
        checkDirectory(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n').length;
      if (lines > MAX_LINES) {
        violations.push(`${fullPath}: ${lines} lines (max: ${MAX_LINES})`);
      }
    }
  }
}

checkDirectory('./src');

if (violations.length > 0) {
  console.error('❌ File size violations:');
  violations.forEach(v => console.error(`  ${v}`));
  process.exit(1);
} else {
  console.log('✅ All files under 200 lines');
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "check-sizes": "tsx scripts/check-file-sizes.ts",
    "pre-commit": "npm run check-sizes && npm run lint"
  }
}
```

## Folder Creation Order

Create folders in this order:

### Phase 1: Essential Structure
```powershell
New-Item -ItemType Directory -Force -Path "src/components/layout"
New-Item -ItemType Directory -Force -Path "src/components/cards"
New-Item -ItemType Directory -Force -Path "src/components/ui"
New-Item -ItemType Directory -Force -Path "src/hooks"
New-Item -ItemType Directory -Force -Path "src/types"
New-Item -ItemType Directory -Force -Path "src/pages"
```

### Phase 2: State & Services
```powershell
New-Item -ItemType Directory -Force -Path "src/stores"
New-Item -ItemType Directory -Force -Path "src/services"
New-Item -ItemType Directory -Force -Path "src/config"
New-Item -ItemType Directory -Force -Path "src/mocks"
```

### Phase 3: Service-Specific
```powershell
New-Item -ItemType Directory -Force -Path "src/components/microservices"
New-Item -ItemType Directory -Force -Path "src/components/charts"
```

### Phase 4: Testing
```powershell
New-Item -ItemType Directory -Force -Path "tests/unit/components/cards"
New-Item -ItemType Directory -Force -Path "tests/unit/components/layout"
New-Item -ItemType Directory -Force -Path "tests/unit/hooks"
New-Item -ItemType Directory -Force -Path "tests/e2e"
```

## Prohibited Folders

**NEVER create these folders:**
- ❌ `utils/` - Too generic, use specific hooks instead
- ❌ `helpers/` - Same as utils, anti-pattern
- ❌ `common/` - Everything becomes "common"
- ❌ `shared/` - Use specific folders with barrel exports
- ❌ `lib/` - Confusing with node_modules
- ❌ `core/` - Every file should be core

**Instead:**
- Data transformation → hooks
- Formatting → components
- Business logic → services
- Constants → config

## File Organization Rules

### 1. Components Folder
- **layout/** - Layout wrappers only (TopBar, Sidebar, Grid)
- **cards/** - Reusable card components
- **microservices/** - Service-specific cards (one per service)
- **charts/** - Chart components (one per chart type)
- **ui/** - Generic UI elements (spinners, empty states)

### 2. One Concern Per File
```
✅ GOOD:
src/hooks/useServiceStatus.ts        (fetches status only)
src/hooks/useServiceMetrics.ts       (fetches metrics only)

❌ BAD:
src/hooks/useServiceData.ts          (fetches everything)
```

### 3. Maximum File Depth: 3 Levels
```
✅ GOOD:
src/components/cards/BaseCard.tsx

❌ BAD:
src/components/cards/base/variants/DefaultCard.tsx
```

## Quick Reference Card

**Where does X go?**

| What | Where | Max Lines |
|------|-------|-----------|
| React component | `components/` | 200 |
| Data hook | `hooks/` | 100 |
| Type definition | `types/` | 150 |
| Global state | `stores/` | 50 |
| API config | `services/` | 80 |
| Constants | `config/` | 50 |
| Page | `pages/` | 150 |
| Mock data | `mocks/` | 150 |
| Chart | `components/charts/` | 150 |
| Test | `tests/unit/` or `tests/e2e/` | 300 |

## Related Documentation

- `.cursorrules` - Enforcement rules
- `IMPLEMENTATION_PLAN.md` - Build phases
- `CURSOR_GUIDE.md` - Cursor integration
