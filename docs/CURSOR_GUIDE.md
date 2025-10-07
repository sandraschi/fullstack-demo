# Cursor IDE Integration Guide

## Overview

This guide explains how to use Cursor IDE effectively with fullstack-demo's `.cursorrules` file to generate clean, maintainable dashboard components.

## .cursorrules Integration

The project includes a `.cursorrules` file in the root directory that enforces:
- 200-line file limit
- Component separation patterns
- TypeScript strict mode
- Chakra UI only (no custom CSS)

Cursor AI will automatically follow these rules when generating code.

## Quick Commands

### Create New Service Card

```
Create a new service card for [SERVICE_NAME] that displays:
- Status badge (healthy/degraded/down)
- Uptime percentage
- Response time metrics
- Request count

Follow the card pattern in BaseCard.tsx. Create both the data hook (useServiceData.ts) 
and component (ServiceCard.tsx). Keep all files under 200 lines.
```

### Refactor Large Component

```
This component exceeds 200 lines. Refactor it into:
1. Data hook in hooks/
2. Presentation component in components/
3. Type definitions in types/

Follow the separation patterns in existing components.
```

### Add Metric Display

```
Add a metric card for [METRIC_NAME] that shows:
- Current value with unit
- Trend indicator (up/down arrow)
- Color coding (green=good, red=bad)

Use MetricCard pattern from cards/MetricCard.tsx
```

### Add Chart

```
Add a [CHART_TYPE] chart to [CARD_NAME] using recharts.
Wrap it in ChartCard component.
Data should come from use[Domain]Data hook.
Chart must be responsive and under 150 lines.
```

## Using Composer/Agent Mode

### When to Use Composer
- Generating multiple related files (hook + component + types)
- Refactoring large components into smaller ones
- Creating complete feature with tests
- Setting up new service integrations

### Example Composer Prompt

```
Create a complete implementation for monitoring the "Payment Service":

1. Type definition in types/microservices.types.ts
   - Add PaymentServiceData interface
   - Include status, transaction metrics, error rates

2. Data hook in hooks/usePaymentService.ts
   - Fetch from /api/services/payment
   - 30 second refresh interval
   - Handle loading and error states

3. Component in components/microservices/PaymentServiceCard.tsx
   - Use BaseCard wrapper
   - Display status badge
   - Show transaction rate and success rate
   - All under 150 lines

4. Add to Dashboard.tsx
   - Import and use hook
   - Place in grid with key "payment-service"

Follow all .cursorrules patterns.
```

## Using Chat Mode

### When to Use Chat
- Debugging specific issues
- Asking about patterns
- Quick one-line fixes
- Understanding existing code

### Example Chat Prompts

```
Why is this component exceeding 200 lines?
```

```
How should I split this logic between hook and component?
```

```
What's the correct Chakra UI pattern for a metric card with trend?
```

## Common Patterns

### Pattern 1: Service Card

```typescript
// 1. Define type (types/microservices.types.ts)
export interface ServiceXData {
  id: string;
  name: string;
  status: ServiceStatus;
  metrics: {...};
}

// 2. Create hook (hooks/useServiceX.ts)
export function useServiceX(id: string) {
  return useQuery({
    queryKey: ['service-x', id],
    queryFn: () => fetchServiceX(id),
    refetchInterval: 30000,
  });
}

// 3. Create component (components/microservices/ServiceXCard.tsx)
interface Props {
  data: ServiceXData;
}

export function ServiceXCard({ data }: Props) {
  return (
    <BaseCard title={data.name}>
      {/* Display logic only, no fetching */}
    </BaseCard>
  );
}
```

### Pattern 2: Metric Display

```typescript
<MetricCard
  title="Response Time"
  value={metrics.responseTime.p95}
  unit="ms"
  trend={calculateTrend(metrics)}
/>
```

### Pattern 3: Grid Layout

```typescript
const { layout, setLayout } = useGridLayout();

<DashboardGrid layout={layout} onLayoutChange={setLayout}>
  <div key="service-1">{/* Card */}</div>
  <div key="service-2">{/* Card */}</div>
</DashboardGrid>
```

## Troubleshooting

### Issue: Generated Component Too Large

**Solution:** Ask Cursor to refactor:
```
This component is [X] lines. Refactor following the separation pattern:
- Extract data logic to hook
- Extract complex calculations to utility
- Split into sub-components if needed
```

### Issue: Not Following Chakra UI Patterns

**Solution:** Reference existing components:
```
This uses inline styles. Rewrite using Chakra UI components only.
Follow the pattern in @components/cards/BaseCard.tsx
```

### Issue: Props Interface Too Complex

**Solution:** Simplify via composition:
```
This component has [X] props. Reduce to 3 or fewer by:
- Using composition (children prop)
- Moving config to context/store
- Combining related props into objects
```

## File Limits Reference

| File Type | Line Limit | Reason |
|-----------|-----------|--------|
| Component | 200 | Readability + maintainability |
| Hook | 100 | Single responsibility |
| Type definition | 150 | Clear interfaces |
| Store | 50 | Minimal global state |
| Test | 300 | Setup + multiple test cases |

## Best Practices

1. **Start Small:** Generate one file at a time
2. **Verify Each Step:** Check that generated code follows rules
3. **Use Examples:** Reference existing files with `@filename`
4. **Be Specific:** Detailed prompts = better results
5. **Iterate:** Refine generated code in small steps

## Anti-Patterns to Avoid

❌ **Don't:** "Create a complete dashboard with all features"  
✅ **Do:** "Create one service card following BaseCard pattern"

❌ **Don't:** "Make it look nice"  
✅ **Do:** "Use Chakra UI Box with borderRadius='lg' and boxShadow='sm'"

❌ **Don't:** "Add some state management"  
✅ **Do:** "Create Zustand store in stores/dashboard.store.ts for layout persistence"

## Quick Reference Card

```
📦 New Component    → Composer + detailed spec
🔧 Fix Bug          → Chat + specific issue
🔄 Refactor         → Composer + separation plan
📊 Add Feature      → Composer + step-by-step breakdown
❓ Question         → Chat + context reference
```

## Next Steps

1. Read `.cursorrules` file completely
2. Try creating a simple service card
3. Verify it follows all patterns
4. Iterate based on results
