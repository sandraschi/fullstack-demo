# Cursor Implementation Guide - How to Build This Project

**Purpose:** Step-by-step instructions for using Cursor IDE to build fullstack-demo  
**Audience:** Developers starting implementation  
**Time:** 2 weeks for frontend, 2 weeks for backend

## Quick Start

```powershell
# 1. Open project in Cursor
Set-Location "D:\Dev\repos\fullstack-demo"
cursor .

# 2. Start with Phase 1
# (See detailed steps below)
```

## ⚠️ Critical: Don't Do This

**❌ WRONG Approach:**
```
"Read all docs and build the entire dashboard"
```

**Why wrong:**
- Overwhelms Cursor's context window
- Generates monolithic code
- Violates file size limits
- Hard to debug when things break

## ✅ Correct Approach: Phase-by-Phase

Work incrementally following the implementation phases.

---

## Phase 1: Project Setup (Day 1)

### Step 1: Initial Cursor Setup

**Open Composer (Ctrl+I):**
```
I'm starting Phase 1 of fullstack-demo project.

Read these files to understand architecture:
- @docs/FOLDER_STRUCTURE.md
- @docs/PHASE_1_SETUP.md
- @.cursorrules

Then execute Phase 1 setup from PHASE_1_SETUP.md:
1. Initialize Vite + React + TypeScript
2. Install all dependencies
3. Configure TypeScript strict mode
4. Setup ESLint + Prettier
5. Create directory structure from FOLDER_STRUCTURE.md
6. Verify compilation

Follow .cursorrules file size limits strictly.
```

### Step 2: Verify Setup

```powershell
# Check if dev server runs
npm run dev

# Check TypeScript
npm run type-check

# Check linting
npm run lint
```

### Step 3: Save Progress

Write to basic memory:
```
Phase 1 complete - Project initialized
- Vite + React + TS running
- All directories created
- ESLint/Prettier configured
- Dev server works at localhost:5173
```

**Success Criteria:**
- ✅ `npm run dev` works
- ✅ All directories exist
- ✅ TypeScript compiles
- ✅ No ESLint errors

---

## Phase 2: Chakra UI Setup (Day 2)

### Step 1: Theme Configuration

**Composer (Ctrl+I):**
```
Phase 2: Setup Chakra UI theme

Read:
- @docs/PHASE_1_SETUP.md (section 2.1-2.2)
- @.cursorrules (styling rules)

Tasks:
1. Create src/theme.ts following Chakra UI 3.x patterns
2. Update src/main.tsx with ChakraProvider
3. Add ColorModeScript
4. Configure TanStack Query client
5. Test dark/light mode toggle

File size limit: theme.ts < 200 lines
```

### Step 2: Verify Theme

```powershell
# Start dev server
npm run dev

# Open browser devtools
# Toggle dark mode (if TopBar exists)
# Verify theme applied
```

**Success Criteria:**
- ✅ Theme configured
- ✅ Dark/light mode works
- ✅ ChakraProvider wraps app

---

## Phase 3: Type Definitions (Day 3)

### Step 1: Create Types

**Composer (Ctrl+I):**
```
Phase 3: Create TypeScript type definitions

Read:
- @docs/PRD.md (Appendix A: Service Response format)
- @docs/FOLDER_STRUCTURE.md (types/ section)
- @.cursorrules (TypeScript rules)

Create these type files in src/types/:
1. microservices.types.ts - ServiceData, ServiceStatus, ServiceMetrics
2. dashboard.types.ts - DashboardLayout, TimeRange, DashboardConfig
3. chart.types.ts - TimeSeriesPoint, TimeSeriesData
4. index.ts - Barrel exports

Each file under 150 lines. Use discriminated unions where appropriate.
```

### Step 2: Verify Types

```powershell
# Type check
npm run type-check

# Should have no errors
```

**Success Criteria:**
- ✅ All type files created in correct locations
- ✅ Files under 150 lines each
- ✅ Barrel exports work
- ✅ TypeScript strict mode passes

---

## Phase 4: Mock API Setup (Day 3-4)

### Step 1: MSW Configuration

**Composer (Ctrl+I):**
```
Phase 4: Setup Mock Service Worker API

Read:
- @docs/PRD.md (Appendix A for response format)
- @docs/FOLDER_STRUCTURE.md (mocks/ section)
- @.cursorrules (file organization)

Create in src/mocks/:
1. data.ts - Mock service data generators (4 services from PRD)
2. handlers.ts - MSW request handlers
3. browser.ts - Worker setup
4. index.ts - Barrel exports

Update src/main.tsx to start MSW in dev mode.

Each file under 150 lines. Use realistic data ranges.
```

### Step 2: Test Mock API

```powershell
# Start dev server
npm run dev

# Open browser console
# Should see: [MSW] Mocking enabled
# Test endpoint: fetch('http://localhost:5173/api/services')
```

**Success Criteria:**
- ✅ MSW intercepts requests
- ✅ Mock data returns realistic values
- ✅ Console shows MSW active
- ✅ All 4 services defined (API Gateway, Auth, Database, Cache)

---

## Phase 5: Base Components (Days 4-5)

### Step 1: Create Base Components

**Composer (Ctrl+I):**
```
Phase 5: Create base layout and card components

Read:
- @docs/FOLDER_STRUCTURE.md (components/ section)
- @.cursorrules (Component Size Limits, Card Pattern, TopBar Pattern)

Create these components:

1. src/components/cards/BaseCard.tsx
   - Under 60 lines
   - Props: title, children, actions (optional)
   - Use only Chakra UI (Box, Heading, Flex)

2. src/components/layout/TopBar.tsx
   - Under 150 lines
   - Icon buttons: Refresh, Theme Toggle, Settings, Logout
   - Props: onRefresh, onSettings, onLogout callbacks

3. src/components/layout/DashboardGrid.tsx
   - Under 100 lines
   - Wrap react-grid-layout
   - Props: layout, onLayoutChange, children

4. src/components/ui/LoadingSpinner.tsx
   - Under 30 lines
   - Chakra UI Spinner component

Add index.ts barrel exports to each folder.
```

### Step 2: Test Components

Create a test page to verify components render:

**Chat (Ctrl+L):**
```
Create a test page at src/pages/ComponentTest.tsx that displays:
- BaseCard with sample content
- TopBar with console.log callbacks
- LoadingSpinner

Keep under 100 lines.
```

**Success Criteria:**
- ✅ All components under size limits
- ✅ Components render without errors
- ✅ Dark/light mode works on all components
- ✅ Barrel exports work

---

## Phase 6: Data Hooks (Day 5)

### Step 1: Create Data Fetching Hooks

**Composer (Ctrl+I):**
```
Phase 6: Create TanStack Query data hooks

Read:
- @docs/FOLDER_STRUCTURE.md (hooks/ section)
- @.cursorrules (Data Fetching pattern)
- @src/types/microservices.types.ts (for type imports)

Create in src/hooks/:

1. useServiceStatus.ts
   - Hook: useServiceStatus(serviceId: string)
   - Fetches from /api/services/:id
   - Returns useQuery result
   - 30 second refetch interval
   - Under 80 lines

2. useAllServices.ts
   - Hook: useAllServices()
   - Fetches from /api/services
   - Returns all service data
   - 30 second refetch interval
   - Under 80 lines

3. useGridLayout.ts
   - Hook: useGridLayout()
   - Manages grid layout state
   - Persists to localStorage
   - Returns { layout, setLayout, resetLayout }
   - Under 60 lines

4. index.ts - Barrel exports

Use TanStack Query. All files under 100 lines.
```

### Step 2: Test Hooks

**Chat (Ctrl+L):**
```
Update ComponentTest.tsx to test data hooks:
- Display data from useAllServices()
- Show loading and error states
- Verify 30s auto-refresh works
```

**Success Criteria:**
- ✅ Hooks fetch data successfully
- ✅ Mock API responds correctly
- ✅ Auto-refresh works
- ✅ All files under 100 lines

---

## Phase 7: Service Cards (Days 6-7)

### Step 1: Create Service Cards

**Composer (Ctrl+I) - Repeat for each service:**
```
Create a service card for [API Gateway/Auth/Database/Cache]

Read:
- @docs/PRD.md (Service definitions)
- @docs/FOLDER_STRUCTURE.md (microservices/ section)
- @.cursorrules (Card Pattern)
- @src/components/cards/BaseCard.tsx (for reference)

Create src/components/microservices/[ServiceName]Card.tsx:
- Under 150 lines
- Props: data from useServiceStatus hook
- Display: Status badge, uptime, key metrics
- Use BaseCard wrapper
- Chakra UI only

Follow the pattern in .cursorrules exactly.
```

### Step 2: Create Main Dashboard

**Composer (Ctrl+I):**
```
Create the main Dashboard page

Read:
- @docs/FOLDER_STRUCTURE.md (pages/ section)
- @.cursorrules (pages should be composition only)
- @src/hooks/* (for data fetching)
- @src/components/layout/DashboardGrid.tsx
- @src/components/microservices/* (all service cards)

Create src/pages/Dashboard.tsx:
- Under 150 lines
- Use useAllServices() hook
- Display all 4 service cards in DashboardGrid
- TopBar with callbacks
- Handle loading/error states
- Composition only, no business logic

Update App.tsx to render Dashboard instead of ComponentTest.
```

**Success Criteria:**
- ✅ All 4 service cards display
- ✅ Real data from mock API
- ✅ Auto-refresh every 30s
- ✅ Grid layout works
- ✅ All components under size limits

---

## Using Cursor Effectively

### File References with `@`

Always use `@` to reference files:

```
Create X following the pattern in @.cursorrules

Location per @docs/FOLDER_STRUCTURE.md

Use types from @src/types/microservices.types.ts
```

### Composer vs Chat

**Use Composer (Ctrl+I) for:**
- Multi-file operations (setup, creating hook+component pairs)
- Entire features (Phase 1 setup, Mock API)
- Complex refactoring

**Use Chat (Ctrl+L) for:**
- Single questions
- Debugging specific issues
- Quick fixes
- Clarifications

### Pattern for Each Component

```
Create [ComponentName] component

Read:
- @.cursorrules ([relevant rule section])
- @docs/FOLDER_STRUCTURE.md ([component location])
- @src/[reference-file].tsx (if exists)

Requirements:
- Props: [list]
- Location: [exact path from FOLDER_STRUCTURE.md]
- Max lines: [limit from .cursorrules]
- Use only Chakra UI
- [Specific requirements]
```

### Verification After Generation

**After Cursor generates code:**

```powershell
# 1. Check file sizes
Get-ChildItem -Recurse src/*.tsx, src/*.ts | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    if ($lines -gt 200) {
        Write-Host "❌ $($_.Name): $lines lines" -ForegroundColor Red
    }
}

# 2. Type check
npm run type-check

# 3. Lint
npm run lint

# 4. Manual test
npm run dev
```

### Warning Signs to Stop and Refactor

🚨 **Stop if Cursor generates:**
- Files > 200 lines → Ask Cursor to split
- Inline styles → Ask to use Chakra UI
- Logic in page components → Ask to move to hooks
- Files in wrong location → Check FOLDER_STRUCTURE.md
- Multiple concerns → Ask to separate

**Example refactor request:**
```
This component is 250 lines. Following @.cursorrules, refactor it into:
1. Data hook in src/hooks/
2. Presentation component in src/components/
Keep all files under 200 lines.
```

---

## Phase-by-Phase Progress Tracking

### After Each Phase

1. **Verify success criteria**
2. **Run checks** (types, lint, manual test)
3. **Save progress to basic memory:**

```
Phase [X] complete - [Phase Name]
Date: [YYYY-MM-DD-HHMM]

Completed:
- [Task 1]
- [Task 2]
- [Task 3]

Files created:
- [path/to/file1.tsx] ([X] lines)
- [path/to/file2.ts] ([X] lines)

Next: Phase [X+1] - [Next Phase Name]
```

4. **Commit to git:**
```powershell
git add .
git commit -m "Phase X complete: [Phase Name]"
```

### Daily Checklist

- [ ] All new files under 200 lines
- [ ] TypeScript compiles (npm run type-check)
- [ ] ESLint passes (npm run lint)
- [ ] Manual testing works (npm run dev)
- [ ] Progress saved to basic memory
- [ ] Changes committed to git

---

## Common Cursor Prompts

### Starting a Phase
```
Start Phase [X]: [Phase Name]

Read:
- @docs/PHASE_[X]_[NAME].md
- @docs/FOLDER_STRUCTURE.md
- @.cursorrules

Execute the tasks from PHASE_[X]_[NAME].md
Follow all .cursorrules limits.
```

### Creating Component + Hook Pair
```
Create a complete implementation for [Feature]:

1. Data hook in src/hooks/use[Feature].ts
   - Use TanStack Query
   - Fetch from [endpoint]
   - Under 100 lines

2. Component in src/components/[category]/[Feature].tsx
   - Props from hook result
   - Use Chakra UI only
   - Under 150 lines

3. Add barrel exports to index.ts files

Follow @.cursorrules patterns.
```

### Debugging
```
The [component] is not working correctly.

Current behavior: [describe issue]
Expected behavior: [what should happen]

File: @src/components/[path]/[Component].tsx

Debug and fix following @.cursorrules.
```

### Refactoring
```
This file is too large: @src/[path]/[File].tsx

Refactor according to @.cursorrules:
- Split into [hook/component/subcomponent]
- Keep all files under 200 lines
- Maintain functionality
- Update imports
```

---

## Timeline & Milestones

### Week 1: Foundation
- **Day 1:** Phase 1 - Project setup ✓
- **Day 2:** Phase 2 - Chakra UI theme ✓
- **Day 3:** Phase 3 - Types, Phase 4 - Mock API ✓
- **Day 4-5:** Phase 5 - Base components ✓
- **Day 5:** Phase 6 - Data hooks ✓

**Milestone:** Dashboard skeleton with mock data

### Week 2: Features
- **Days 6-7:** Phase 7 - Service cards ✓
- **Days 8-9:** Phase 8 - Charts ✓
- **Days 10-14:** Phase 9 - Polish & testing ✓

**Milestone:** Complete MVP dashboard

---

## Troubleshooting

### Cursor Not Following .cursorrules
**Solution:** Explicitly reference it:
```
Following @.cursorrules, create...
```

### Files Too Large
**Solution:** Ask for refactoring:
```
This exceeds 200 lines from @.cursorrules. Split into smaller files.
```

### Wrong File Location
**Solution:** Check and specify:
```
According to @docs/FOLDER_STRUCTURE.md, this should go in [path]
```

### TypeScript Errors
**Solution:**
```
Fix TypeScript errors in @src/[path]/[file].ts

Follow @.cursorrules TypeScript rules.
```

---

## Next Steps

1. **Read all docs first** (you are here)
2. **Open Cursor** in project directory
3. **Start Phase 1** using Composer
4. **Work incrementally** phase-by-phase
5. **Save progress** after each phase
6. **Verify** after every generation

## Related Documentation

- `FOLDER_STRUCTURE.md` - Where every file goes
- `PHASE_*.md` - Detailed phase instructions
- `.cursorrules` - Enforcement rules (auto-applied)
- `CURSOR_GUIDE.md` - Cursor IDE tips
- `PRD.md` - Product requirements

---

**Ready to start? Open Cursor and begin Phase 1!** 🚀
