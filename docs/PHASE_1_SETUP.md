# Phase 1: Project Setup

## Goals
- Initialize Vite + React + TypeScript project
- Configure strict TypeScript
- Setup ESLint + Prettier
- Install all dependencies
- Create directory structure

## Time Estimate: 2 hours

## Steps

### 1. Initialize Vite Project

```powershell
Set-Location "D:\Dev\repos\fullstack-demo"
npm create vite@latest . -- --template react-ts
```

Answer prompts:
- Package name: `fullstack-demo`
- Overwrite existing files: `yes`

### 2. Install Core Dependencies

```powershell
# Install dependencies
npm install

# Chakra UI
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion

# Data management
npm install @tanstack/react-query zustand axios

# Utilities
npm install react-icons react-grid-layout

# Types
npm install -D @types/react-grid-layout
```

### 3. Install Dev Dependencies

```powershell
npm install -D eslint prettier @testing-library/react @testing-library/jest-dom vitest playwright msw
```

### 4. Create Directory Structure

```powershell
New-Item -ItemType Directory -Force -Path "src/components/layout"
New-Item -ItemType Directory -Force -Path "src/components/cards"
New-Item -ItemType Directory -Force -Path "src/components/microservices"
New-Item -ItemType Directory -Force -Path "src/hooks"
New-Item -ItemType Directory -Force -Path "src/types"
New-Item -ItemType Directory -Force -Path "src/stores"
New-Item -ItemType Directory -Force -Path "src/pages"
New-Item -ItemType Directory -Force -Path "src/mocks"
New-Item -ItemType Directory -Force -Path "tests/unit"
New-Item -ItemType Directory -Force -Path "tests/e2e"
```

### 5. Configure TypeScript (tsconfig.json)

Update with strict settings and path aliases:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 6. Configure Vite (vite.config.ts)

Add path alias resolver:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 7. Create ESLint Config (.eslintrc.cjs)

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

### 8. Create Prettier Config (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 9. Test Setup

```powershell
# Run dev server
npm run dev

# Should see app at http://localhost:5173
```

## Success Criteria

- ✅ `npm run dev` starts without errors
- ✅ Hot module replacement works
- ✅ TypeScript compiles with strict mode
- ✅ All directories created
- ✅ Path alias `@/*` resolves correctly

## Common Issues

**Issue:** Path alias not working  
**Fix:** Restart TypeScript server in Cursor/VSCode

**Issue:** ESLint errors  
**Fix:** Run `npm run lint` to see specific errors

## Next Steps

Once Phase 1 complete, move to `PHASE_2_TYPES.md`
