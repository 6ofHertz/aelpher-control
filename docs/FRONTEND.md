# Aelpher 2.0 Frontend Documentation

## Overview

The frontend is built with React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui.

---

## File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── ArmScopedReflection.tsx
│   ├── ExecutionLog.tsx
│   ├── MobileBlocker.tsx
│   ├── NBAControl.tsx
│   ├── StrategicAwarenessHeader.tsx
│   └── TheaterBlock.tsx
├── hooks/
│   └── useLocalStorage.ts     # Primary state management
├── lib/
│   ├── nba-scoring.ts         # NBA score calculation
│   ├── state-machine.ts       # Status derivation
│   ├── supabase.ts            # (Future) Supabase client
│   └── utils.ts               # Utility functions
├── pages/
│   ├── Dashboard.tsx          # Main application page
│   ├── Index.tsx              # Entry point
│   └── NotFound.tsx           # 404 page
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx                    # Router configuration
├── index.css                  # Design system tokens
└── main.tsx                   # React entry point
```

---

## Components

### MobileBlocker

**Purpose**: Blocks access on viewports < 1024px

**Props**: None

**Behavior**:
- Renders a full-screen overlay on mobile/tablet
- Shows "DESKTOP REQUIRED" message
- Uses Tailwind's `lg:hidden` for visibility control

---

### StrategicAwarenessHeader

**Purpose**: Displays global metrics (top 20% of screen)

**Props**:
```typescript
interface StrategicAwarenessHeaderProps {
  globalMetrics: GlobalMetrics;
  ibm: TheaterState;
  cs: TheaterState;
}
```

**Sub-components**:
- `MetricCard` - Individual metric display
- `EnergyAllocationBar` - IBM vs CS energy split
- `OverloadMeter` - Risk gradient bar

---

### TheaterBlock

**Purpose**: Container for a single theater (IBM or CS)

**Props**:
```typescript
interface TheaterBlockProps {
  theater: TheaterState;
  onAddLog: (log: Omit<LogEntry, 'id' | 'armType' | 'timestamp'>) => void;
  onAddNBA: (nba: Omit<NBAItem, 'id' | 'armType' | 'createdAt' | 'lastUpdated' | 'score'>) => void;
  onSelectNBA: (nbaId: string | null, isManual: boolean) => void;
  onAddReflection: (evidence: string, context: string) => void;
  reflections: Reflection[];
}
```

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (Icon, Title, Status Badge, Progress, Add Log)   │
├──────────────────────────┬──────────────────────────────┤
│      NBA CONTROL         │       EXECUTION LOG          │
├──────────────────────────┴──────────────────────────────┤
│                  ARM-SCOPED REFLECTION                   │
└─────────────────────────────────────────────────────────┘
```

---

### NBAControl

**Purpose**: NBA scoring display + manual override

**Props**:
```typescript
interface NBAControlProps {
  armType: ArmType;
  currentNBA: NBAItem | null;
  nbaQueue: NBAItem[];
  onSelectNBA: (nbaId: string | null, isManual: boolean) => void;
  onAddNBA: (nba: Omit<NBAItem, 'id' | 'armType' | 'createdAt' | 'lastUpdated' | 'score'>) => void;
}
```

**Features**:
- AUTO/MANUAL mode toggle
- Add NBA dialog
- Queue display (top 3)
- Lock indicator

---

### ExecutionLog

**Purpose**: Monospace activity log table

**Props**:
```typescript
interface ExecutionLogProps {
  logs: LogEntry[];
  maxHeight?: string;
}
```

**Columns**:
- TIME (military format)
- ACTION
- DETAILS (truncated)
- DURATION (minutes)

---

### ArmScopedReflection

**Purpose**: Evidence-only reflection tool (no scoring impact)

**Props**:
```typescript
interface ArmScopedReflectionProps {
  armType: ArmType;
  reflections: Reflection[];
  onAddReflection: (evidence: string, context: string) => void;
}
```

**Behavior**:
- Collapsible panel
- Evidence + optional context fields
- Filters by armType (strict isolation)

---

## State Management

### useLocalStorage Hook

**Storage Key**: `aelpher-2.0-state`

**Methods**:

| Method | Parameters | Purpose |
|--------|------------|---------|
| `updateTheater` | `(armType, updates)` | Partial theater update |
| `addLog` | `(armType, log)` | Add execution log |
| `addNBA` | `(armType, nba)` | Add NBA to queue |
| `setCurrentNBA` | `(armType, id, isManual)` | Select active NBA |
| `updateGlobalMetrics` | `(metrics)` | Update global stats |
| `addReflection` | `(reflection)` | Add arm-scoped reflection |
| `resetState` | `()` | Clear all data |

**Persistence**:
- Saves to localStorage on every state change
- Loads from localStorage on mount
- Console logs all state transitions for audit

---

## Styling

### Design Tokens (index.css)

```css
/* Status colors */
--status-active: 142 71% 45%;    /* Green */
--status-warm: 45 93% 47%;       /* Yellow */
--status-idle: 0 0% 45%;         /* Gray */
--status-blocked: 0 84% 60%;     /* Red */

/* Fonts */
--font-sans: 'Lato', sans-serif;
--font-serif: 'EB Garamond', serif;
--font-mono: 'Fira Code', monospace;
```

### Tailwind Classes

```typescript
// Status colors
'text-status-active'  // Green text
'text-status-warm'    // Yellow text
'text-status-idle'    // Gray text
'text-status-blocked' // Red text

'bg-status-active/20' // Green background (20% opacity)
// etc.
```

---

## Routing

```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

Currently single-page. Future routes:
- `/settings` - User preferences
- `/export` - Data export
- `/auth` - Login/signup

---

## Performance

### Optimizations Applied

1. **Memoization**: useCallback for handler functions
2. **Lazy evaluation**: NBA scores computed on-demand
3. **Truncation**: Logs capped at 100, reflections at 50
4. **Scroll virtualization**: ScrollArea for log tables

### Recompute Cycle

- Interval: 5 minutes (`RECOMPUTE_INTERVAL = 5 * 60 * 1000`)
- Triggers: Status derivation, NBA ranking, overload calculation
- Can be manually triggered by any write operation
