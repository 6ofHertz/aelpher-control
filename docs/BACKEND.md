# Aelpher 2.0 Backend Documentation

## Current Status: NOT IMPLEMENTED

The backend layer requires Lovable Cloud to be enabled before implementation.

---

## Planned Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                                                              │
│  useLocalStorage ──────► localStorage (Primary Truth)        │
│        │                                                     │
│        ▼                                                     │
│  useSyncQueue ──────────► Sync Queue (IndexedDB)             │
│        │                                                     │
└────────┼─────────────────────────────────────────────────────┘
         │
         ▼ (Background Sync)
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth      │  │  Database   │  │   Edge Functions    │  │
│  │ (Supabase)  │  │ (PostgreSQL)│  │    (Deno)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                Row Level Security                    │    │
│  │         (Users can only access own data)             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Tables

### theaters
Stores theater state for each arm (IBM/CS).

```sql
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
```

### nba_items
Next Best Action queue items.

```sql
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
```

### execution_logs
Activity tracking.

```sql
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  duration INTEGER, -- minutes
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

### reflections
Evidence-only observations.

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  arm_type TEXT CHECK (arm_type IN ('ibm', 'cs')) NOT NULL,
  evidence TEXT NOT NULL,
  context TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

### global_metrics
Denormalized metrics for dashboard.

```sql
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
```

### sync_queue
Offline operation queue.

```sql
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

---

## Row Level Security

All tables enforce user isolation:

```sql
-- Enable RLS
ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nba_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users own their data" ON theaters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their data" ON nba_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their data" ON execution_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their data" ON reflections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their data" ON global_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their data" ON sync_queue
  FOR ALL USING (auth.uid() = user_id);
```

---

## Edge Functions (Planned)

### compute-overload

Calculates overload risk on the server.

```typescript
// supabase/functions/compute-overload/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { user_id } = await req.json();

  // Fetch theaters and NBAs
  const { data: ibm } = await supabase
    .from('theaters')
    .select('*, nba_items(*)')
    .eq('user_id', user_id)
    .eq('arm_type', 'ibm')
    .single();

  const { data: cs } = await supabase
    .from('theaters')
    .select('*, nba_items(*)')
    .eq('user_id', user_id)
    .eq('arm_type', 'cs')
    .single();

  // Calculate overload (same logic as frontend)
  const overloadRisk = computeOverloadRisk(ibm, cs);

  // Update metrics
  await supabase
    .from('global_metrics')
    .upsert({
      user_id,
      overload_risk: overloadRisk,
      last_computed: new Date().toISOString()
    });

  return new Response(JSON.stringify({ overloadRisk }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### daily-digest (Optional)

Sends email summary.

```typescript
// supabase/functions/daily-digest/index.ts
// Triggered by cron: 0 8 * * * (8 AM daily)
```

---

## Authentication Flow

### Signup

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// On success, initialize theaters
await supabase.from('theaters').insert([
  { user_id: data.user.id, arm_type: 'ibm' },
  { user_id: data.user.id, arm_type: 'cs' }
]);

await supabase.from('global_metrics').insert({
  user_id: data.user.id
});
```

### Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});
```

### Session Check

```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login
}
```

---

## Sync Strategy

### Local-First Principle

1. All writes go to localStorage FIRST
2. Writes are queued for background sync
3. Sync happens when online
4. Conflicts: Last-write-wins (with timestamp)

### Sync Queue Processing

```typescript
async function processQueue() {
  const queue = getLocalQueue();
  
  for (const item of queue) {
    try {
      await syncToSupabase(item);
      markSynced(item.id);
    } catch (error) {
      incrementRetry(item.id);
      if (item.retries >= MAX_RETRIES) {
        markFailed(item.id);
      }
    }
  }
}
```

### Conflict Resolution

```typescript
function resolveConflict(local: Record, remote: Record): Record {
  // Simple: Last-write-wins
  if (new Date(local.updatedAt) > new Date(remote.updatedAt)) {
    return local;
  }
  return remote;
}
```

---

## Implementation Steps

### To enable backend:

1. **Enable Lovable Cloud**
   - Go to Connectors → Lovable Cloud
   - Set "Enable Lovable Cloud" to "Always allow"

2. **Create Tables**
   - Run the SQL migrations provided above

3. **Enable RLS**
   - Apply security policies

4. **Create Edge Functions**
   - Deploy compute-overload function

5. **Update Frontend**
   - Add `src/lib/supabase.ts` client
   - Add `useSyncQueue` hook
   - Integrate auth flow
