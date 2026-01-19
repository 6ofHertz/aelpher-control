# Aelpher 2.0 API Documentation

## Overview

Aelpher uses Supabase as the backend, which provides auto-generated REST and GraphQL APIs from the database schema.

**Current Status**: APIs are NOT ACTIVE (requires Lovable Cloud)

---

## API Base URL

```
https://<project-ref>.supabase.co/rest/v1/
```

Headers required:
```
apikey: <supabase-anon-key>
Authorization: Bearer <user-jwt>
Content-Type: application/json
```

---

## Endpoints

### Theaters

#### Get User Theaters

```http
GET /rest/v1/theaters?user_id=eq.{user_id}
```

Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "arm_type": "ibm",
    "status": "active",
    "total_progress": 45.5,
    "energy_allocation": 60,
    "last_activity": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "uuid",
    "user_id": "uuid",
    "arm_type": "cs",
    "status": "warm",
    "total_progress": 32.0,
    "energy_allocation": 40,
    "last_activity": "2024-01-14T18:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-14T18:00:00Z"
  }
]
```

#### Update Theater

```http
PATCH /rest/v1/theaters?id=eq.{theater_id}
Content-Type: application/json

{
  "status": "active",
  "total_progress": 50.0,
  "updated_at": "2024-01-15T12:00:00Z"
}
```

---

### NBA Items

#### Get NBA Queue

```http
GET /rest/v1/nba_items?user_id=eq.{user_id}&arm_type=eq.{arm_type}&order=created_at.desc
```

Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "arm_type": "ibm",
    "title": "Complete Python module",
    "description": "Finish the data structures section",
    "stale_days": 2.5,
    "gap": 3,
    "has_early_progress_bonus": false,
    "is_manually_selected": false,
    "is_locked": false,
    "is_current": true,
    "created_at": "2024-01-10T00:00:00Z",
    "last_updated": "2024-01-13T00:00:00Z"
  }
]
```

#### Create NBA

```http
POST /rest/v1/nba_items
Content-Type: application/json

{
  "user_id": "uuid",
  "arm_type": "ibm",
  "title": "New task",
  "description": "Task description",
  "gap": 2,
  "has_early_progress_bonus": false
}
```

#### Update NBA (Lock/Unlock)

```http
PATCH /rest/v1/nba_items?id=eq.{nba_id}
Content-Type: application/json

{
  "is_locked": true,
  "is_manually_selected": true,
  "is_current": true,
  "last_updated": "2024-01-15T12:00:00Z"
}
```

#### Delete NBA

```http
DELETE /rest/v1/nba_items?id=eq.{nba_id}
```

---

### Execution Logs

#### Get Logs

```http
GET /rest/v1/execution_logs?user_id=eq.{user_id}&arm_type=eq.{arm_type}&order=timestamp.desc&limit=100
```

Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "arm_type": "ibm",
    "action": "Completed module",
    "details": "Finished Python basics chapter",
    "duration": 45,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

#### Create Log

```http
POST /rest/v1/execution_logs
Content-Type: application/json

{
  "user_id": "uuid",
  "arm_type": "ibm",
  "action": "Reviewed code",
  "details": "PR review for team project",
  "duration": 30
}
```

---

### Reflections

#### Get Reflections

```http
GET /rest/v1/reflections?user_id=eq.{user_id}&arm_type=eq.{arm_type}&order=timestamp.desc&limit=50
```

Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "arm_type": "cs",
    "evidence": "Successfully debugged the memory leak issue",
    "context": "This confirms understanding of garbage collection",
    "timestamp": "2024-01-15T09:00:00Z"
  }
]
```

#### Create Reflection

```http
POST /rest/v1/reflections
Content-Type: application/json

{
  "user_id": "uuid",
  "arm_type": "cs",
  "evidence": "Passed midterm exam with 92%",
  "context": "Data structures module complete"
}
```

---

### Global Metrics

#### Get Metrics

```http
GET /rest/v1/global_metrics?user_id=eq.{user_id}
```

Response:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "combined_progress": 38.75,
  "energy_allocation_ibm": 60,
  "energy_allocation_cs": 40,
  "overload_risk": 25.5,
  "last_sync_time": "2024-01-15T12:00:00Z",
  "last_computed": "2024-01-15T12:00:00Z"
}
```

#### Update Metrics

```http
POST /rest/v1/global_metrics
Prefer: resolution=merge-duplicates
Content-Type: application/json

{
  "user_id": "uuid",
  "overload_risk": 30.0,
  "last_computed": "2024-01-15T12:05:00Z"
}
```

---

## Edge Function APIs

### POST /functions/v1/compute-overload

Triggers server-side overload calculation.

Request:
```json
{
  "user_id": "uuid"
}
```

Response:
```json
{
  "overloadRisk": 32.5,
  "computed_at": "2024-01-15T12:00:00Z"
}
```

---

## Real-time Subscriptions

### Subscribe to NBA Changes

```typescript
const channel = supabase
  .channel('nba-realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'nba_items',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('NBA change:', payload);
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: new record
      // payload.old: old record (for UPDATE/DELETE)
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Subscribe to Log Updates

```typescript
const channel = supabase
  .channel('logs-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'execution_logs',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New log:', payload.new);
    }
  )
  .subscribe();
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid/expired JWT) |
| 403 | Forbidden (RLS policy violation) |
| 404 | Not found |
| 409 | Conflict (unique constraint) |
| 500 | Server error |

### Error Response Format

```json
{
  "message": "new row violates row-level security policy",
  "code": "42501",
  "details": null,
  "hint": null
}
```

---

## Rate Limits

Supabase free tier:
- 500 requests/minute
- 2 GB database
- 1 GB file storage

For Aelpher usage patterns, this is more than sufficient.

---

## TypeScript Client Usage

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Type-safe queries
const { data, error } = await supabase
  .from('theaters')
  .select('*')
  .eq('arm_type', 'ibm')
  .single();

// data is typed as Theater | null
```
