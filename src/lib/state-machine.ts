import type { StatusType, LogEntry } from '@/types';

/**
 * State Machine for Aelpher 2.0
 * 
 * Derives theater status from logs:
 * - Active: Activity within last 2 hours
 * - Warm: Activity within last 24 hours
 * - Idle: Activity within last 7 days
 * - Blocked: No activity for 7+ days OR explicit block log
 */

export function deriveStatusFromLogs(logs: LogEntry[]): StatusType {
  if (logs.length === 0) {
    console.log('[STATE-MACHINE] No logs → IDLE');
    return 'idle';
  }

  // Check for explicit block
  const recentLogs = logs.slice(0, 10);
  const hasBlocker = recentLogs.some(log => 
    log.action.toLowerCase().includes('blocked') || 
    log.action.toLowerCase().includes('blocker') ||
    log.details.toLowerCase().includes('blocked')
  );
  
  if (hasBlocker) {
    console.log('[STATE-MACHINE] Blocker detected in recent logs → BLOCKED');
    return 'blocked';
  }

  // Calculate time since last activity
  const lastLog = logs[0];
  const lastActivity = new Date(lastLog.timestamp);
  const now = new Date();
  const hoursAgo = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  let status: StatusType;
  if (hoursAgo <= 2) {
    status = 'active';
  } else if (hoursAgo <= 24) {
    status = 'warm';
  } else if (hoursAgo <= 168) { // 7 days
    status = 'idle';
  } else {
    status = 'blocked';
  }

  console.log(`[STATE-MACHINE] Last activity ${hoursAgo.toFixed(1)}h ago → ${status.toUpperCase()}`);
  return status;
}

export function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'active': return 'text-status-active';
    case 'warm': return 'text-status-warm';
    case 'idle': return 'text-status-idle';
    case 'blocked': return 'text-status-blocked';
  }
}

export function getStatusBgColor(status: StatusType): string {
  switch (status) {
    case 'active': return 'bg-status-active/20';
    case 'warm': return 'bg-status-warm/20';
    case 'idle': return 'bg-status-idle/20';
    case 'blocked': return 'bg-status-blocked/20';
  }
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    month: '2-digit',
    day: '2-digit',
  }).replace(',', '');
}

export function formatMilitaryTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
