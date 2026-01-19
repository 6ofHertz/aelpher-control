# Aelpher 2.0 Architecture

## Overview

Aelpher 2.0 is a dual-theater personal execution control system designed for managing two parallel long-term commitments: IBM Internship and CS Degree.

## Core Principles

1. **Desktop-Only**: Blocks all viewports < 1024px
2. **Local-First**: localStorage is the primary source of truth
3. **Strict Arm Isolation**: No cross-arm data joins between IBM and CS theaters
4. **Instrument Panel UI**: Flat, high-density cards with full subtle outlines

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIC AWARENESS HEADER                │
│    (Combined Progress | Energy Allocation | Overload Risk)   │
├─────────────────────────────────────────────────────────────┤
│                      IBM INTERNSHIP THEATER                  │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │    NBA CONTROL      │  │      EXECUTION LOG          │   │
│  │  (Score + Override) │  │    (Monospace Table)        │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ARM-SCOPED REFLECTION                    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      CS DEGREE THEATER                       │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │    NBA CONTROL      │  │      EXECUTION LOG          │   │
│  │  (Score + Override) │  │    (Monospace Table)        │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ARM-SCOPED REFLECTION                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. User actions → localStorage (immediate)
2. localStorage → UI (reactive)
3. Periodic recompute (5 min) → State machine derivation
4. Future: Background sync → Supabase (not yet implemented)

## Key Components

| Component | Purpose |
|-----------|---------|
| `useLocalStorage` | Primary data store hook |
| `StrategicAwarenessHeader` | Global metrics display |
| `TheaterBlock` | Theater container with NBA + logs |
| `NBAControl` | NBA scoring + manual override |
| `ExecutionLog` | Activity log table |
| `ArmScopedReflection` | Evidence tracking (no scoring) |

## State Machine

Status derivation from logs:
- **Active**: Activity ≤ 2 hours ago
- **Warm**: Activity ≤ 24 hours ago  
- **Idle**: Activity ≤ 7 days ago
- **Blocked**: Activity > 7 days OR explicit blocker log

## NBA Scoring

```
Score = (Staleness > 5 days ? 50 : 0) + (Gap × 10) + (Early Bonus ? 15 : 0)
```

- Staleness: Days since last update
- Gap: Priority gap (0-5 scale)
- Early Progress Bonus: +15 if started ahead of schedule
