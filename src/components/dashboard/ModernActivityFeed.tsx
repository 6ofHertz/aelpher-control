import { format } from 'date-fns';
import { Activity, Clock, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '@/types/database';

interface ModernActivityFeedProps {
  logs: ActivityLog[];
  loading?: boolean;
  onAddActivity?: () => void;
}

export function ModernActivityFeed({ logs, loading, onAddActivity }: ModernActivityFeedProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">RECENT ACTIVITY</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <EmptyState type="activity" onAction={onAddActivity} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">RECENT ACTIVITY</h3>
            <p className="font-mono text-[10px] text-muted-foreground">{logs.length} entries</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <ScrollArea className="h-[280px]">
        <div className="p-2">
          {logs.map((log, index) => (
            <div 
              key={log.id}
              className={cn(
                'group relative flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/20',
              )}
            >
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'h-3 w-3 rounded-full',
                  log.arm_type === 'ibm' ? 'bg-primary' : 'bg-accent-foreground'
                )} />
                {index < logs.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: '40px' }} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase',
                    log.arm_type === 'ibm' 
                      ? 'bg-primary/15 text-primary' 
                      : 'bg-accent-foreground/15 text-accent-foreground'
                  )}>
                    {log.arm_type}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {format(new Date(log.created_at), 'MMM d, HH:mm')}
                  </span>
                </div>
                
                <p className="mt-1 font-mono text-sm font-medium text-foreground line-clamp-1">
                  {log.action}
                </p>
                
                {log.details && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground line-clamp-1">
                    {log.details}
                  </p>
                )}
                
                {log.duration_minutes && (
                  <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono text-[10px]">{log.duration_minutes} min</span>
                  </div>
                )}
              </div>
              
              {/* Hover indicator */}
              <ChevronRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
