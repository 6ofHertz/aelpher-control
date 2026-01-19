# Aelpher 2.0 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Planned
- Supabase backend integration
- User authentication
- Cloud sync with offline queue
- Energy allocation controls
- Keyboard shortcuts

---

## [0.1.0] - 2024-01-15

### Added

#### Core Architecture
- React 18 + Vite + TypeScript foundation
- Tailwind CSS + shadcn/ui design system
- Local-first architecture with localStorage persistence
- 5-minute periodic recompute cycle

#### UI Components
- `MobileBlocker` - Desktop-only enforcement (< 1024px blocked)
- `StrategicAwarenessHeader` - Global metrics dashboard (top 20%)
  - Combined progress metric
  - IBM progress metric
  - CS progress metric
  - Energy allocation bar (IBM vs CS)
  - Overload risk meter with gradient
- `TheaterBlock` - Dual theater containers
  - IBM Internship theater
  - Computer Science Degree theater
  - Status badge (Active/Warm/Idle/Blocked)
  - Progress bar
- `NBAControl` - NBA management
  - Score display
  - AUTO/MANUAL mode toggle
  - Manual lock mechanism
  - Add NBA dialog
  - Queue display (top 3)
- `ExecutionLog` - Activity tracking
  - Monospace table layout
  - Military time formatting
  - Duration tracking
  - Scrollable with 100-item limit
- `ArmScopedReflection` - Evidence tracking
  - Collapsible panel
  - Evidence + context fields
  - No scoring impact
  - 50-item limit per arm

#### Logic Engine
- `nba-scoring.ts` - NBA scoring algorithm
  - Staleness scoring (> 5 days = 50 pts)
  - Gap scoring (gap × 10)
  - Early progress bonus (+15 pts)
  - Queue ranking
  - Manual override handling
- `state-machine.ts` - Status derivation
  - Active: ≤ 2 hours
  - Warm: ≤ 24 hours
  - Idle: ≤ 7 days
  - Blocked: > 7 days or explicit blocker

#### State Management
- `useLocalStorage` hook
  - Full state persistence
  - Theater updates
  - Log management
  - NBA management
  - Reflection management
  - Console audit logging

#### Design System
- Status colors (HSL-based)
  - Active: Green (142 71% 45%)
  - Warm: Yellow (45 93% 47%)
  - Idle: Gray (0 0% 45%)
  - Blocked: Red (0 84% 60%)
- Overload gradient tokens
- Monospace font (Fira Code)
- Sans font (Lato)
- Serif font (EB Garamond)

#### Documentation
- `docs/README.md` - Complete system overview
- `docs/ARCHITECTURE.md` - System design
- `docs/FRONTEND.md` - Frontend documentation
- `docs/BACKEND.md` - Backend documentation (planned)
- `docs/API.md` - API specifications
- `docs/DATABASE.md` - Database schema
- `docs/PHILOSOPHY.md` - Design philosophy
- `docs/RULES.md` - Operational rules
- `docs/SETUP.md` - Setup guide
- `docs/CHANGELOG.md` - This file

#### Type Definitions
- `ArmType` - 'ibm' | 'cs'
- `StatusType` - 'active' | 'warm' | 'idle' | 'blocked'
- `LogEntry` - Execution log record
- `NBAItem` - Next Best Action item
- `TheaterState` - Theater state object
- `GlobalMetrics` - Dashboard metrics
- `Reflection` - Evidence record
- `AelpherState` - Complete app state

### Technical Details
- Storage key: `aelpher-2.0-state`
- Recompute interval: 5 minutes
- Log retention: 100 items per arm
- Reflection retention: 50 items per arm
- NBA queue display: Top 3 items

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.1.0 | 2024-01-15 | Initial release with core functionality |

---

## Migration Notes

### From v0.x to v1.0 (Future)

When backend is added:
1. Enable Lovable Cloud
2. Run database migrations
3. Data will auto-sync from localStorage
4. localStorage remains primary until sync confirmed
