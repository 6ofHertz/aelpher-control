# Aelpher 2.0 Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│─────────────────│
│ id (PK)         │
│ email           │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐      ┌─────────────────┐
│    theaters     │      │  global_metrics │
│─────────────────│      │─────────────────│
│ id (PK)         │      │ id (PK)         │
│ user_id (FK)    │      │ user_id (FK) UK │
│ arm_type        │      │ combined_prog   │
│ status          │      │ energy_ibm      │
│ total_progress  │      │ energy_cs       │
│ energy_alloc    │      │ overload_risk   │
│ last_activity   │      │ last_sync       │
│ created_at      │      │ last_computed   │
│ updated_at      │      └─────────────────┘
└────────┬────────┘
         │
         │ 1:N (by user_id + arm_type)
         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   nba_items     │      │ execution_logs  │      │   reflections   │
│─────────────────│      │─────────────────│      │─────────────────│
│ id (PK)         │      │ id (PK)         │      │ id (PK)         │
│ user_id (FK)    │      │ user_id (FK)    │      │ user_id (FK)    │
│ arm_type        │      │ arm_type        │      │ arm_type        │
│ title           │      │ action          │      │ evidence        │
│ description     │      │ details         │      │ context         │
│ stale_days      │      │ duration        │      │ timestamp       │
│ gap             │      │ timestamp       │      └─────────────────┘
│ early_bonus     │      └─────────────────┘
│ manual_select   │
│ is_locked       │      ┌─────────────────┐
│ is_current      │      │   sync_queue    │
│ created_at      │      │─────────────────│
│ last_updated    │      │ id (PK)         │
└─────────────────┘      │ user_id (FK)    │
                         │ operation       │
                         │ table_name      │
                         │ payload (JSONB) │
                         │ timestamp       │
                         │ synced          │
                         │ retries         │
                         └─────────────────┘
```

---

## Table Specifications

### theaters

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK | gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → auth.users | - | Owner |
| arm_type | TEXT | CHECK (ibm/cs) | - | Theater type |
| status | TEXT | CHECK (active/warm/idle/blocked) | 'idle' | Current state |
| total_progress | NUMERIC(5,2) | - | 0 | Progress percentage |
| energy_allocation | INTEGER | - | 50 | Energy % for this arm |
| last_activity | TIMESTAMPTZ | - | now() | Last action time |
| created_at | TIMESTAMPTZ | - | now() | Creation time |
| updated_at | TIMESTAMPTZ | - | now() | Last update |

**Constraints**:
- `UNIQUE(user_id, arm_type)` - One theater per arm per user

---

### nba_items

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK | gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → auth.users | - | Owner |
| arm_type | TEXT | CHECK (ibm/cs) | - | Associated theater |
| title | TEXT | NOT NULL | - | NBA title |
| description | TEXT | - | NULL | Details |
| stale_days | NUMERIC(5,1) | - | 0 | Days since update |
| gap | INTEGER | CHECK (0-5) | 0 | Priority gap |
| has_early_progress_bonus | BOOLEAN | - | FALSE | +15 points if true |
| is_manually_selected | BOOLEAN | - | FALSE | Manual override flag |
| is_locked | BOOLEAN | - | FALSE | Lock status |
| is_current | BOOLEAN | - | FALSE | Currently active |
| created_at | TIMESTAMPTZ | - | now() | Creation time |
| last_updated | TIMESTAMPTZ | - | now() | Last update |

---

### execution_logs

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK | gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → auth.users | - | Owner |
| arm_type | TEXT | CHECK (ibm/cs) | - | Associated theater |
| action | TEXT | NOT NULL | - | Action description |
| details | TEXT | - | NULL | Additional details |
| duration | INTEGER | - | NULL | Minutes spent |
| timestamp | TIMESTAMPTZ | - | now() | When logged |

---

### reflections

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK | gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → auth.users | - | Owner |
| arm_type | TEXT | CHECK (ibm/cs) | - | Associated theater |
| evidence | TEXT | NOT NULL | - | Objective evidence |
| context | TEXT | - | NULL | Optional context |
| timestamp | TIMESTAMPTZ | - | now() | When recorded |

---

### global_metrics

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK | gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → auth.users, UNIQUE | - | Owner (1 per user) |
| combined_progress | NUMERIC(5,2) | - | 0 | Average progress |
| energy_allocation_ibm | INTEGER | - | 50 | IBM energy % |
| energy_allocation_cs | INTEGER | - | 50 | CS energy % |
| overload_risk | NUMERIC(5,2) | - | 0 | Risk percentage |
| last_sync_time | TIMESTAMPTZ | - | now() | Last cloud sync |
| last_computed | TIMESTAMPTZ | - | now() | Last calculation |

---

### sync_queue

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK | gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → auth.users | - | Owner |
| operation | TEXT | CHECK (INSERT/UPDATE/DELETE) | - | Operation type |
| table_name | TEXT | NOT NULL | - | Target table |
| payload | JSONB | NOT NULL | - | Operation data |
| timestamp | TIMESTAMPTZ | - | now() | When queued |
| synced | BOOLEAN | - | FALSE | Sync status |
| retries | INTEGER | - | 0 | Retry count |

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_theaters_user ON theaters(user_id);
CREATE INDEX idx_nba_items_user_arm ON nba_items(user_id, arm_type);
CREATE INDEX idx_nba_items_current ON nba_items(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_execution_logs_user_arm ON execution_logs(user_id, arm_type);
CREATE INDEX idx_execution_logs_timestamp ON execution_logs(timestamp DESC);
CREATE INDEX idx_reflections_user_arm ON reflections(user_id, arm_type);
CREATE INDEX idx_sync_queue_pending ON sync_queue(synced) WHERE synced = FALSE;
```

---

## Full Migration SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Theaters table
CREATE TABLE theaters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'warm', 'idle', 'blocked')) DEFAULT 'idle',
  total_progress NUMERIC(5,2) DEFAULT 0 CHECK (total_progress >= 0 AND total_progress <= 100),
  energy_allocation INTEGER DEFAULT 50 CHECK (energy_allocation >= 0 AND energy_allocation <= 100),
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, arm_type)
);

-- NBA items table
CREATE TABLE nba_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stale_days NUMERIC(5,1) DEFAULT 0,
  gap INTEGER DEFAULT 0 CHECK (gap >= 0 AND gap <= 5),
  has_early_progress_bonus BOOLEAN DEFAULT FALSE,
  is_manually_selected BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Execution logs table
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  duration INTEGER CHECK (duration IS NULL OR duration > 0),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Reflections table
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  evidence TEXT NOT NULL,
  context TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Global metrics table
CREATE TABLE global_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  combined_progress NUMERIC(5,2) DEFAULT 0,
  energy_allocation_ibm INTEGER DEFAULT 50,
  energy_allocation_cs INTEGER DEFAULT 50,
  overload_risk NUMERIC(5,2) DEFAULT 0,
  last_sync_time TIMESTAMPTZ DEFAULT now(),
  last_computed TIMESTAMPTZ DEFAULT now()
);

-- Sync queue table
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  table_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  synced BOOLEAN DEFAULT FALSE,
  retries INTEGER DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nba_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users own their theaters" ON theaters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their NBA items" ON nba_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their logs" ON execution_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their reflections" ON reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their metrics" ON global_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their sync queue" ON sync_queue FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_theaters_user ON theaters(user_id);
CREATE INDEX idx_nba_items_user_arm ON nba_items(user_id, arm_type);
CREATE INDEX idx_nba_items_current ON nba_items(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_execution_logs_user_arm ON execution_logs(user_id, arm_type);
CREATE INDEX idx_execution_logs_timestamp ON execution_logs(timestamp DESC);
CREATE INDEX idx_reflections_user_arm ON reflections(user_id, arm_type);
CREATE INDEX idx_sync_queue_pending ON sync_queue(synced) WHERE synced = FALSE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to theaters
CREATE TRIGGER theaters_updated_at
  BEFORE UPDATE ON theaters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```
