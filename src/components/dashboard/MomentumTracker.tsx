import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap,
  Calendar,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '@/types/database';

interface MomentumTrackerProps {
  logs: ActivityLog[];
  daysToShow?: number;
}

export function MomentumTracker({ logs, daysToShow = 14 }: MomentumTrackerProps) {
  const dailyData = useMemo(() => {
    const days: { date: string; count: number; minutes: number }[] = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => 
        log.created_at.split('T')[0] === dateStr
      );
      
      days.push({
        date: dateStr,
        count: dayLogs.length,
        minutes: dayLogs.reduce((acc, log) => acc + (log.duration_minutes || 0), 0),
      });
    }
    
    return days;
  }, [logs, daysToShow]);

  const maxCount = Math.max(...dailyData.map(d => d.count), 1);
  
  // Calculate trend
  const trend = useMemo(() => {
    const firstHalf = dailyData.slice(0, Math.floor(daysToShow / 2));
    const secondHalf = dailyData.slice(Math.floor(daysToShow / 2));
    
    const firstAvg = firstHalf.reduce((acc, d) => acc + d.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, d) => acc + d.count, 0) / secondHalf.length;
    
    const diff = ((secondAvg - firstAvg) / Math.max(firstAvg, 1)) * 100;
    
    return {
      direction: diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable',
      percentage: Math.abs(diff).toFixed(0),
    };
  }, [dailyData, daysToShow]);

  const totalActivities = dailyData.reduce((acc, d) => acc + d.count, 0);
  const totalMinutes = dailyData.reduce((acc, d) => acc + d.minutes, 0);
  const avgPerDay = (totalActivities / daysToShow).toFixed(1);

  const getIntensityClass = (count: number) => {
    const ratio = count / maxCount;
    if (count === 0) return 'bg-muted/30';
    if (ratio < 0.25) return 'bg-primary/20';
    if (ratio < 0.5) return 'bg-primary/40';
    if (ratio < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/20">
            <Activity className="h-5 w-5 text-chart-1" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">MOMENTUM</h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              LAST {daysToShow} DAYS
            </p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5',
          trend.direction === 'up' && 'bg-status-active/20 text-status-active',
          trend.direction === 'down' && 'bg-status-blocked/20 text-status-blocked',
          trend.direction === 'stable' && 'bg-muted/50 text-muted-foreground'
        )}>
          {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
          {trend.direction === 'stable' && <Minus className="h-4 w-4" />}
          <span className="font-mono text-xs font-bold">
            {trend.direction === 'stable' ? 'Stable' : `${trend.percentage}%`}
          </span>
        </div>
      </div>

      {/* Heat Map */}
      <div className="mb-6">
        <div className="flex gap-1">
          {dailyData.map((day, index) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                {/* Day initial */}
                <span className="font-mono text-[9px] text-muted-foreground">
                  {dayName}
                </span>
                
                {/* Heat cell */}
                <div 
                  className={cn(
                    'relative w-full aspect-square rounded-md transition-all duration-300 hover:scale-110 cursor-pointer',
                    getIntensityClass(day.count),
                    isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                  )}
                  title={`${day.date}: ${day.count} activities, ${day.minutes} min`}
                >
                  {day.count > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-primary-foreground">
                      {day.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">Less</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-muted/30" />
            <div className="h-3 w-3 rounded-sm bg-primary/20" />
            <div className="h-3 w-3 rounded-sm bg-primary/40" />
            <div className="h-3 w-3 rounded-sm bg-primary/60" />
            <div className="h-3 w-3 rounded-sm bg-primary" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">More</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap className="h-3.5 w-3.5 text-status-warm" />
            <span className="font-mono text-lg font-bold text-foreground">{totalActivities}</span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase">Total</p>
        </div>
        
        <div className="text-center border-x border-border">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-lg font-bold text-foreground">{avgPerDay}</span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase">Avg/Day</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Activity className="h-3.5 w-3.5 text-chart-1" />
            <span className="font-mono text-lg font-bold text-foreground">{totalMinutes}</span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase">Minutes</p>
        </div>
      </div>
    </div>
  );
}
