# Aelpher 2.0 Type Definitions

## Complete TypeScript Interfaces

```typescript
// src/types/index.ts

// Arm types - strictly isolated
export type ArmType = 'ibm' | 'cs';

// Status derived from logs via state machine
export type StatusType = 'active' | 'warm' | 'idle' | 'blocked';

// Execution log entry
export interface LogEntry {
  id: string;                    // UUID
  armType: ArmType;              // Which theater
  timestamp: string;             // ISO 8601
  action: string;                // What was done
  details: string;               // Additional info
  duration?: number;             // Minutes (optional)
}

// Next Best Action item
export interface NBAItem {
  id: string;                    // UUID
  armType: ArmType;              // Which theater
  title: string;                 // NBA title
  description: string;           // Details
  score: number;                 // Calculated score (0-100+)
  staleDays: number;             // Days since last update
  gap: number;                   // Priority gap (0-5)
  hasEarlyProgressBonus: boolean; // +15 if true
  isManuallySelected: boolean;   // User override flag
  isLocked: boolean;             // Lock status
  createdAt: string;             // ISO 8601
  lastUpdated: string;           // ISO 8601
}

// Theater state (one per arm)
export interface TheaterState {
  armType: ArmType;              // 'ibm' or 'cs'
  status: StatusType;            // Derived from logs
  currentNBA: NBAItem | null;    // Active NBA
  nbaQueue: NBAItem[];           // All NBAs for this arm
  logs: LogEntry[];              // Execution history
  totalProgress: number;         // 0-100
  energyAllocation: number;      // 0-100 (% of total energy)
  lastActivity: string;          // ISO 8601
}

// Global dashboard metrics
export interface GlobalMetrics {
  combinedProgress: number;      // Average of both theaters
  energyAllocationIBM: number;   // IBM energy %
  energyAllocationCS: number;    // CS energy %
  overloadRisk: number;          // 0-100
  lastSyncTime: string;          // ISO 8601
}

// Arm-scoped reflection (evidence only)
export interface Reflection {
  id: string;                    // UUID
  armType: ArmType;              // Which theater
  timestamp: string;             // ISO 8601
  evidence: string;              // Objective observation
  context: string;               // Optional context
}

// Complete application state
export interface AelpherState {
  ibm: TheaterState;             // IBM Internship theater
  cs: TheaterState;              // CS Degree theater
  globalMetrics: GlobalMetrics;  // Dashboard metrics
  reflections: Reflection[];     // All reflections
  lastComputed: string;          // ISO 8601 - last recompute
}
```

---

## Database Type Mappings

When Supabase is connected, types map to database columns:

| TypeScript | PostgreSQL | Notes |
|------------|------------|-------|
| `string` (UUID) | `UUID` | gen_random_uuid() default |
| `string` (ISO) | `TIMESTAMPTZ` | now() default |
| `string` | `TEXT` | Variable length |
| `number` | `NUMERIC(5,2)` | For decimals |
| `number` | `INTEGER` | For whole numbers |
| `boolean` | `BOOLEAN` | true/false |
| `ArmType` | `TEXT` + CHECK | Constrained enum |
| `StatusType` | `TEXT` + CHECK | Constrained enum |

---

## Supabase Generated Types (Future)

When connected to Supabase, generate types with:

```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.ts
```

This will create:

```typescript
// src/types/database.ts (auto-generated)
export interface Database {
  public: {
    Tables: {
      theaters: {
        Row: { ... }
        Insert: { ... }
        Update: { ... }
      }
      nba_items: { ... }
      execution_logs: { ... }
      reflections: { ... }
      global_metrics: { ... }
      sync_queue: { ... }
    }
  }
}
```

---

## Utility Types

```typescript
// For creating new items (omit auto-generated fields)
type CreateLog = Omit<LogEntry, 'id' | 'armType' | 'timestamp'>;
type CreateNBA = Omit<NBAItem, 'id' | 'armType' | 'createdAt' | 'lastUpdated' | 'score'>;
type CreateReflection = Omit<Reflection, 'id' | 'timestamp'>;

// For partial updates
type UpdateTheater = Partial<TheaterState>;
type UpdateNBA = Partial<NBAItem>;
type UpdateMetrics = Partial<GlobalMetrics>;
```

---

## Validation Constraints

```typescript
// Runtime validation helpers
const isValidArmType = (value: string): value is ArmType => 
  ['ibm', 'cs'].includes(value);

const isValidStatus = (value: string): value is StatusType =>
  ['active', 'warm', 'idle', 'blocked'].includes(value);

const isValidGap = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 5;

const isValidProgress = (value: number): boolean =>
  value >= 0 && value <= 100;
```
