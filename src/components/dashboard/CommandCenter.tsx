import { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Cpu, 
  Radio, 
  Shield, 
  Zap,
  TrendingUp,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CommandCenterProps {
  systemStatus: 'optimal' | 'active' | 'idle' | 'overloaded';
  ibmProgress: number;
  csProgress: number;
  activeTasks: number;
  focusScore: number;
}

export function CommandCenter({ 
  systemStatus, 
  ibmProgress, 
  csProgress, 
  activeTasks,
  focusScore 
}: CommandCenterProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 2000);
    return () => clearInterval(pulseTimer);
  }, []);

  const statusConfig = {
    optimal: { 
      color: 'text-status-active', 
      bg: 'bg-status-active/20', 
      border: 'border-status-active/40',
      label: 'OPTIMAL',
      glow: 'shadow-[0_0_20px_hsl(var(--status-active)/0.3)]'
    },
    active: { 
      color: 'text-primary', 
      bg: 'bg-primary/20', 
      border: 'border-primary/40',
      label: 'ACTIVE',
      glow: 'shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
    },
    idle: { 
      color: 'text-status-idle', 
      bg: 'bg-status-idle/20', 
      border: 'border-status-idle/40',
      label: 'IDLE',
      glow: ''
    },
    overloaded: { 
      color: 'text-status-blocked', 
      bg: 'bg-status-blocked/20', 
      border: 'border-status-blocked/40',
      label: 'OVERLOAD',
      glow: 'shadow-[0_0_20px_hsl(var(--status-blocked)/0.3)]'
    },
  };

  const config = statusConfig[systemStatus];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border-2 bg-card/80 backdrop-blur-sm p-4',
      config.border,
      config.glow,
      'transition-all duration-500'
    )}>
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, hsl(var(--accent-foreground)) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-6">
        {/* System Status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-xl border-2',
            config.bg,
            config.border
          )}>
            {/* Pulse ring */}
            <div className={cn(
              'absolute inset-0 rounded-xl animate-ping opacity-30',
              config.bg,
              pulseActive ? 'opacity-30' : 'opacity-0'
            )} />
            <Cpu className={cn('h-7 w-7', config.color)} />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <Radio className={cn('h-3 w-3 animate-pulse', config.color)} />
              <span className={cn('font-mono text-xs font-bold uppercase', config.color)}>
                SYSTEM {config.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-foreground">
                AELPHER
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                v2.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="flex items-center gap-6 rounded-xl border border-border bg-background/50 px-6 py-3">
          {/* IBM Progress */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">IBM</p>
              <p className="font-mono text-lg font-bold text-foreground">{ibmProgress}%</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          {/* CS Progress */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-foreground/20">
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">CS</p>
              <p className="font-mono text-lg font-bold text-foreground">{csProgress}%</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Active Tasks */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-warm/20">
              <Activity className="h-4 w-4 text-status-warm" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">QUEUE</p>
              <p className="font-mono text-lg font-bold text-foreground">{activeTasks}</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Focus Score */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              focusScore >= 70 ? 'bg-status-active/20' : focusScore >= 40 ? 'bg-status-warm/20' : 'bg-status-blocked/20'
            )}>
              <Brain className={cn(
                'h-4 w-4',
                focusScore >= 70 ? 'text-status-active' : focusScore >= 40 ? 'text-status-warm' : 'text-status-blocked'
              )} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">FOCUS</p>
              <p className="font-mono text-lg font-bold text-foreground">{focusScore}</p>
            </div>
          </div>
        </div>

        {/* Time & AI Status */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                AI ACTIVE
              </span>
            </div>
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          
          <div className={cn(
            'flex h-14 w-14 items-center justify-center rounded-xl',
            'bg-gradient-to-br from-primary/30 to-accent-foreground/30',
            'border border-primary/40'
          )}>
            <Shield className="h-7 w-7 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
