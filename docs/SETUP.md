# Aelpher 2.0 Setup Guide

## Prerequisites

- Node.js 18+
- Desktop browser (1024px+ viewport)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## First Launch

1. Open `http://localhost:5173` on a desktop browser
2. The system initializes with empty theaters
3. Add your first NBA to each theater
4. Begin logging execution activity

## Data Persistence

All data is stored in localStorage under the key `aelpher-2.0-state`.

To reset:
```javascript
localStorage.removeItem('aelpher-2.0-state');
location.reload();
```

## Configuration

The recompute interval is set to 5 minutes. To modify, edit `RECOMPUTE_INTERVAL` in `Dashboard.tsx`.
