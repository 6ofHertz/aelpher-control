import { AlertTriangle, ArrowRight, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Subtopic, Topic } from '@/types/database';

interface UrgentBannerProps {
  nba: Subtopic | null;
  parentTopic?: Topic | null;
  onComplete?: () => void;
  armType: 'ibm' | 'cs';
}

export function UrgentBanner({ nba, parentTopic, onComplete, armType }: UrgentBannerProps) {
  if (!nba) {
    // All complete state
    return (
      <div className={cn(
        'relative overflow-hidden rounded-2xl border p-5',
        'bg-gradient-to-r from-status-active/10 via-status-active/5 to-transparent',
        'border-status-active/30'
      )}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-active/20">
            <CheckCircle className="h-6 w-6 text-status-active" />
          </div>
          <div className="flex-1">
            <h3 className="font-mono text-lg font-bold text-status-active">
              ALL CAUGHT UP!
            </h3>
            <p className="font-mono text-sm text-muted-foreground">
              Great job! No pending actions for {armType.toUpperCase()}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine urgency level based on display order (lower = more urgent)
  const getUrgencyLevel = (): 'high' | 'medium' | 'low' => {
    if (nba.display_order <= 1) return 'high';
    if (nba.display_order <= 3) return 'medium';
    return 'low';
  };
  
  const urgencyLevel = getUrgencyLevel();
  
  const urgencyStyles = {
    high: {
      bg: 'from-status-blocked/15 via-status-blocked/5 to-transparent',
      border: 'border-status-blocked/40',
      icon: 'text-status-blocked',
      iconBg: 'bg-status-blocked/20',
      pulse: true,
    },
    medium: {
      bg: 'from-status-warm/15 via-status-warm/5 to-transparent',
      border: 'border-status-warm/40',
      icon: 'text-status-warm',
      iconBg: 'bg-status-warm/20',
      pulse: false,
    },
    low: {
      bg: 'from-primary/10 via-primary/5 to-transparent',
      border: 'border-primary/30',
      icon: 'text-primary',
      iconBg: 'bg-primary/20',
      pulse: false,
    },
  };
  
  const style = urgencyStyles[urgencyLevel];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border p-5',
      'bg-gradient-to-r',
      style.bg,
      style.border
    )}>
      {/* Pulse animation for high urgency */}
      {style.pulse && (
        <div className="absolute inset-0 animate-pulse opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-status-blocked/20 to-transparent" />
        </div>
      )}
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          style.iconBg,
          style.pulse && 'animate-pulse'
        )}>
          {urgencyLevel === 'high' ? (
            <AlertTriangle className={cn('h-6 w-6', style.icon)} />
          ) : (
            <Zap className={cn('h-6 w-6', style.icon)} />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase',
              urgencyLevel === 'high' && 'bg-status-blocked/20 text-status-blocked',
              urgencyLevel === 'medium' && 'bg-status-warm/20 text-status-warm',
              urgencyLevel === 'low' && 'bg-primary/20 text-primary'
            )}>
              {urgencyLevel === 'high' ? 'Priority' : 'Next Up'}
            </span>
            {parentTopic && (
              <span className="font-mono text-xs text-muted-foreground truncate">
                {parentTopic.title}
              </span>
            )}
          </div>
          
          <h3 className="mt-1 font-mono text-lg font-bold text-foreground truncate">
            {nba.title}
          </h3>
          
          {nba.description && (
            <p className="mt-0.5 font-mono text-sm text-muted-foreground line-clamp-1">
              {nba.description}
            </p>
          )}
        </div>
        
        {/* Action Button */}
        <Button 
          onClick={onComplete}
          className={cn(
            'shrink-0 gap-2 font-mono shadow-lg transition-all hover:scale-105',
            urgencyLevel === 'high' && 'bg-status-blocked hover:bg-status-blocked/90',
            urgencyLevel === 'medium' && 'bg-status-warm hover:bg-status-warm/90',
            urgencyLevel === 'low' && ''
          )}
        >
          Complete
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
