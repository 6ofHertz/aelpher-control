import { Clock, Target, TrendingUp, Zap } from 'lucide-react';
import { StreakCounter } from './StreakCounter';
import { cn } from '@/lib/utils';

interface HeroStatsProps {
  streak: number;
  weeklyTasks: number;
  weeklyGoal: number;
  timeToday: number;
  combinedProgress: number;
}

export function HeroStats({ 
  streak, 
  weeklyTasks, 
  weeklyGoal, 
  timeToday, 
  combinedProgress 
}: HeroStatsProps) {
  const weeklyProgress = weeklyGoal > 0 ? Math.min((weeklyTasks / weeklyGoal) * 100, 100) : 0;
  
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg">
      {/* Subtle gradient background */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at top right, hsl(var(--primary) / 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom left, hsl(var(--accent-foreground) / 0.08) 0%, transparent 50%)'
        }}
      />
      
      <div className="relative z-10 grid grid-cols-4 gap-6">
        {/* Streak Counter */}
        <div className="flex items-center justify-center border-r border-border pr-6">
          <StreakCounter streak={streak} isNewRecord={false} />
        </div>
        
        {/* Weekly Progress - Big Circular */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-28 w-28">
            {/* Background circle */}
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--muted) / 0.3)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${weeklyProgress * 2.64} 264`}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent-foreground))" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold text-foreground">
                {weeklyTasks}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                /{weeklyGoal} TASKS
              </span>
            </div>
          </div>
          <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">
            Weekly Progress
          </p>
        </div>
        
        {/* Time Today */}
        <div className="flex flex-col items-center justify-center border-l border-border pl-6">
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-status-active/20 to-status-active/5',
            'shadow-inner'
          )}>
            <Clock className="h-8 w-8 text-status-active" />
          </div>
          <div className="mt-3 text-center">
            <span className="font-mono text-2xl font-bold text-foreground">
              {timeToday}
            </span>
            <span className="font-mono text-sm text-muted-foreground"> min</span>
          </div>
          <p className="font-mono text-xs uppercase text-muted-foreground">
            Time Today
          </p>
        </div>
        
        {/* Combined Progress */}
        <div className="flex flex-col items-center justify-center border-l border-border pl-6">
          <div className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-primary/20 to-primary/5',
            'shadow-inner'
          )}>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div className="mt-3 text-center">
            <span className="font-mono text-2xl font-bold text-foreground">
              {combinedProgress}
            </span>
            <span className="font-mono text-sm text-muted-foreground">%</span>
          </div>
          <p className="font-mono text-xs uppercase text-muted-foreground">
            Overall Progress
          </p>
        </div>
      </div>
    </div>
  );
}
