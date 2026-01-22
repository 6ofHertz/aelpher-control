import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  isNewRecord?: boolean;
}

export function StreakCounter({ streak, isNewRecord = false }: StreakCounterProps) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    if (isNewRecord) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isNewRecord, streak]);

  const flameSize = Math.min(streak * 2 + 24, 48); // Grows with streak, max 48px
  
  return (
    <div className="relative flex flex-col items-center justify-center gap-2">
      {/* Animated Flame */}
      <div className={cn(
        'relative transition-transform duration-500',
        animate && 'animate-bounce'
      )}>
        {/* Glow effect */}
        <div 
          className={cn(
            'absolute inset-0 blur-xl transition-opacity duration-500',
            streak > 0 ? 'opacity-60' : 'opacity-0'
          )}
          style={{
            background: `radial-gradient(circle, hsl(var(--status-warm) / 0.5) 0%, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />
        
        {/* Flame Icon */}
        <Flame 
          className={cn(
            'relative z-10 transition-all duration-500',
            streak === 0 && 'text-muted-foreground/30',
            streak > 0 && streak < 7 && 'text-status-warm',
            streak >= 7 && streak < 14 && 'text-status-warm drop-shadow-lg',
            streak >= 14 && 'text-status-blocked drop-shadow-lg',
          )}
          style={{ 
            width: flameSize, 
            height: flameSize,
            filter: streak >= 7 ? `drop-shadow(0 0 ${streak}px hsl(var(--status-warm)))` : undefined
          }}
          fill={streak > 0 ? 'currentColor' : 'none'}
        />
        
        {/* Particles for high streaks */}
        {streak >= 14 && (
          <>
            <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 animate-ping rounded-full bg-status-warm opacity-75" />
            <span className="absolute -top-2 left-1/3 h-1 w-1 animate-ping rounded-full bg-status-blocked opacity-50" style={{ animationDelay: '0.3s' }} />
            <span className="absolute -top-2 right-1/3 h-1 w-1 animate-ping rounded-full bg-status-blocked opacity-50" style={{ animationDelay: '0.6s' }} />
          </>
        )}
      </div>
      
      {/* Streak Number */}
      <div className="text-center">
        <span className={cn(
          'font-mono text-3xl font-bold transition-all duration-300',
          streak === 0 && 'text-muted-foreground',
          streak > 0 && 'text-foreground'
        )}>
          {streak}
        </span>
        <p className="font-mono text-xs uppercase text-muted-foreground">
          Day Streak
        </p>
      </div>
      
      {/* New Record Badge */}
      {isNewRecord && (
        <div className="absolute -right-2 -top-2 rounded-full bg-status-warm px-2 py-0.5 text-[10px] font-bold text-background shadow-lg animate-bounce">
          NEW!
        </div>
      )}
    </div>
  );
}
