import { ScrollArea } from '@/components/ui/scroll-area';
import type { LogEntry } from '@/types';
import { formatMilitaryTime } from '@/lib/state-machine';
import { cn } from '@/lib/utils';

interface ExecutionLogProps {
  logs: LogEntry[];
  maxHeight?: string;
}

export function ExecutionLog({ logs, maxHeight = '200px' }: ExecutionLogProps) {
  if (logs.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/20">
        <span className="font-mono text-xs text-muted-foreground">NO LOGS RECORDED</span>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('rounded-md border border-border')} style={{ height: maxHeight }}>
      <table className="w-full font-mono text-xs">
        <thead className="sticky top-0 bg-card">
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="p-2 font-medium">TIME</th>
            <th className="p-2 font-medium">ACTION</th>
            <th className="p-2 font-medium">DETAILS</th>
            <th className="p-2 font-medium text-right">DURATION</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr 
              key={log.id} 
              className={cn(
                'border-b border-border/50 hover:bg-muted/30',
                index % 2 === 0 && 'bg-muted/10'
              )}
            >
              <td className="p-2 text-muted-foreground">{formatMilitaryTime(log.timestamp)}</td>
              <td className="p-2 font-medium text-foreground">{log.action}</td>
              <td className="max-w-[200px] truncate p-2 text-muted-foreground" title={log.details}>
                {log.details}
              </td>
              <td className="p-2 text-right text-muted-foreground">
                {log.duration ? `${log.duration}m` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
