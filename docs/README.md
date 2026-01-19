# Aelpher 2.0 — Complete System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Requirements](#backend-requirements)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [Current Implementation Status](#current-implementation-status)
7. [Missing Components](#missing-components)
8. [Roadmap](#roadmap)

---

## Overview

**Aelpher 2.0** is a dual-theater personal execution control system designed to manage two parallel long-term strategic commitments:

- **IBM Internship** (Professional Track)
- **Computer Science Degree** (Academic Track)

### Core Philosophy

- **NOT a task manager** — It's an operational instrument panel
- **Local-first** — localStorage is the primary source of truth
- **Strict arm isolation** — No cross-arm data joins
- **Machine calculates, operator decides** — NBA scoring with manual override

### Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Framework | React 18 + Vite | ✅ Implemented |
| Styling | Tailwind CSS + shadcn/ui | ✅ Implemented |
| State | localStorage + React hooks | ✅ Implemented |
| Database | Supabase (PostgreSQL) | ❌ Not Connected |
| Auth | Supabase Auth | ❌ Not Connected |
| Sync | Background queue | ❌ Not Implemented |

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Dashboard (Main Page)
│   ├── MobileBlocker (viewport < 1024px)
│   ├── StrategicAwarenessHeader (Top 20%)
│   │   ├── MetricCard (Combined Progress)
│   │   ├── MetricCard (IBM Progress)
│   │   ├── MetricCard (CS Progress)
│   │   ├── EnergyAllocationBar
│   │   └── OverloadMeter
│   ├── TheaterBlock (IBM)
│   │   ├── NBAControl
│   │   │   ├── AddNBADialog
│   │   │   └── NBA Queue List
│   │   ├── ExecutionLog
│   │   └── ArmScopedReflection
│   └── TheaterBlock (CS)
│       ├── NBAControl
│       ├── ExecutionLog
│       └── ArmScopedReflection
```

### Core Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useLocalStorage` | Primary state management, persistence | `src/hooks/useLocalStorage.ts` |

### Utility Libraries

| Library | Purpose | File |
|---------|---------|------|
| `nba-scoring` | NBA score calculation, queue ranking | `src/lib/nba-scoring.ts` |
| `state-machine` | Status derivation from logs | `src/lib/state-machine.ts` |

### Design System

All colors are HSL-based and defined in `src/index.css`:

| Token | Purpose |
|-------|---------|
| `--status-active` | Green (142 71% 45%) |
| `--status-warm` | Yellow (45 93% 47%) |
| `--status-idle` | Gray (0 0% 45%) |
| `--status-blocked` | Red (0 84% 60%) |
| `--overload-*` | Gradient stops for risk meter |

### Responsive Behavior

- **Desktop (≥1024px)**: Full instrument panel
- **Tablet/Mobile (<1024px)**: Blocked with message screen

---

## Backend Requirements

### Authentication (Not Yet Implemented)

```typescript
// Required Supabase Auth Features
- Email/Password signup
- Session persistence
- Row Level Security (RLS) integration
```

### Real-time Sync (Not Yet Implemented)

```typescript
// Sync Queue Architecture
interface SyncQueue {
  id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  payload: Record<string, unknown>;
  timestamp: string;
  synced: boolean;
  retries: number;
}
```

### Edge Functions (Not Yet Implemented)

| Function | Purpose |
|----------|---------|
| `compute-overload` | Server-side overload risk calculation |
| `daily-digest` | Optional email summary |
| `export-data` | JSON/CSV export |

---

## Database Schema

### Supabase Tables (Planned)

```sql
-- Users (handled by Supabase Auth)
-- auth.users

-- Theaters State
CREATE TABLE theaters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'warm', 'idle', 'blocked')) DEFAULT 'idle',
  total_progress NUMERIC(5,2) DEFAULT 0,
  energy_allocation INTEGER DEFAULT 50,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, arm_type)
);

-- NBA Items
CREATE TABLE nba_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stale_days NUMERIC(5,1) DEFAULT 0,
  gap INTEGER CHECK (gap >= 0 AND gap <= 5) DEFAULT 0,
  has_early_progress_bonus BOOLEAN DEFAULT FALSE,
  is_manually_selected BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Execution Logs
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  duration INTEGER, -- minutes
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Reflections
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  evidence TEXT NOT NULL,
  context TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Global Metrics (denormalized for performance)
CREATE TABLE global_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  combined_progress NUMERIC(5,2) DEFAULT 0,
  energy_allocation_ibm INTEGER DEFAULT 50,
  energy_allocation_cs INTEGER DEFAULT 50,
  overload_risk NUMERIC(5,2) DEFAULT 0,
  last_sync_time TIMESTAMPTZ DEFAULT now(),
  last_computed TIMESTAMPTZ DEFAULT now()
);

-- Sync Queue (for offline support)
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  table_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  synced BOOLEAN DEFAULT FALSE,
  retries INTEGER DEFAULT 0
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nba_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users own their theaters"
  ON theaters FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their NBA items"
  ON nba_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their logs"
  ON execution_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their reflections"
  ON reflections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their metrics"
  ON global_metrics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their sync queue"
  ON sync_queue FOR ALL
  USING (auth.uid() = user_id);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_nba_items_user_arm ON nba_items(user_id, arm_type);
CREATE INDEX idx_execution_logs_user_arm ON execution_logs(user_id, arm_type);
CREATE INDEX idx_execution_logs_timestamp ON execution_logs(timestamp DESC);
CREATE INDEX idx_reflections_user_arm ON reflections(user_id, arm_type);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced) WHERE synced = FALSE;
```

---

## API Specifications

### REST Endpoints (via Supabase)

All endpoints use Supabase client library. Base pattern:

```typescript
import { supabase } from '@/lib/supabase';

// Example: Fetch theaters
const { data, error } = await supabase
  .from('theaters')
  .select('*')
  .eq('user_id', userId);
```

### API Operations

| Operation | Method | Table | Purpose |
|-----------|--------|-------|---------|
| Get theaters | SELECT | theaters | Load user's theaters |
| Update theater | UPDATE | theaters | Change status/progress |
| Add NBA | INSERT | nba_items | Create new NBA |
| Update NBA | UPDATE | nba_items | Modify/lock NBA |
| Delete NBA | DELETE | nba_items | Remove completed NBA |
| Add log | INSERT | execution_logs | Record activity |
| Get logs | SELECT | execution_logs | Display log table |
| Add reflection | INSERT | reflections | Record evidence |
| Get metrics | SELECT | global_metrics | Load dashboard metrics |
| Update metrics | UPSERT | global_metrics | Save computed metrics |

### Real-time Subscriptions (Planned)

```typescript
// Subscribe to NBA changes
supabase
  .channel('nba-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'nba_items',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle change
  })
  .subscribe();
```

---

## Current Implementation Status

### ✅ Fully Implemented

| Feature | Status |
|---------|--------|
| Desktop-only enforcement | ✅ |
| Strategic Awareness Header | ✅ |
| Dual Theater UI | ✅ |
| NBA Scoring Engine | ✅ |
| Manual Override Toggle | ✅ |
| Execution Log Table | ✅ |
| Arm-Scoped Reflections | ✅ |
| localStorage Persistence | ✅ |
| State Machine (status derivation) | ✅ |
| Overload Risk Calculation | ✅ |
| 5-minute Recompute Cycle | ✅ |
| TypeScript Type Safety | ✅ |
| Design System (status colors) | ✅ |

### ⚠️ Partially Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Energy Allocation | ⚠️ | Display only, no controls |
| Progress Tracking | ⚠️ | Hardcoded at 0%, needs input |

### ❌ Not Implemented

| Feature | Priority |
|---------|----------|
| Supabase Connection | High |
| User Authentication | High |
| Cloud Sync | High |
| Offline Queue | Medium |
| Export (JSON/CSV) | Medium |
| Keyboard Shortcuts | Medium |
| Dark Mode Toggle | Low |
| Activity Timeline | Low |
| Email Digests | Low |

---

## Missing Components

### Critical (Required for Production)

1. **Supabase Backend**
   - Database connection
   - Auth integration
   - RLS policies

2. **Sync Layer**
   - Offline queue
   - Conflict resolution
   - Retry logic

3. **Progress Controls**
   - Manual progress input
   - Progress history

4. **Energy Controls**
   - Slider to adjust allocation
   - Persist changes

### Nice to Have

1. **Export/Import**
   - JSON backup
   - CSV reports

2. **Keyboard Navigation**
   - Cmd+K command palette
   - Shortcuts for common actions

3. **Analytics**
   - Activity heatmap
   - Trend analysis

4. **Notifications**
   - Browser notifications for stale items
   - Email summaries

---

## Roadmap

### Phase 1: Foundation ✅
- [x] Core UI components
- [x] localStorage persistence
- [x] NBA scoring engine
- [x] State machine

### Phase 2: Backend (Next)
- [ ] Enable Lovable Cloud
- [ ] Create database tables
- [ ] Implement RLS policies
- [ ] Add authentication

### Phase 3: Sync
- [ ] Implement sync queue
- [ ] Add conflict resolution
- [ ] Background sync worker

### Phase 4: Enhancement
- [ ] Energy allocation controls
- [ ] Progress input controls
- [ ] Keyboard shortcuts
- [ ] Export functionality

### Phase 5: Polish
- [ ] Activity timeline
- [ ] Dark mode toggle
- [ ] Performance optimization
- [ ] Mobile PWA (future consideration)
