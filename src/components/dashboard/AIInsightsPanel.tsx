import { useState } from 'react';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'recommendation' | 'pattern' | 'warning' | 'achievement';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIInsightsPanelProps {
  ibmProgress: number;
  csProgress: number;
  streak: number;
  weeklyTasks: number;
  staleCount: number;
}

export function AIInsightsPanel({ 
  ibmProgress, 
  csProgress, 
  streak, 
  weeklyTasks,
  staleCount 
}: AIInsightsPanelProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Generate dynamic insights based on current data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Balance check
    const imbalance = Math.abs(ibmProgress - csProgress);
    if (imbalance > 20) {
      const lagging = ibmProgress < csProgress ? 'IBM' : 'CS';
      insights.push({
        id: 'balance',
        type: 'recommendation',
        title: `${lagging} track needs attention`,
        description: `Your ${lagging} progress is ${imbalance.toFixed(0)}% behind. Consider allocating more focus time to balance your execution.`,
        action: `Focus on ${lagging}`,
        priority: 'high',
      });
    }

    // Streak momentum
    if (streak >= 7) {
      insights.push({
        id: 'streak',
        type: 'achievement',
        title: 'Momentum building!',
        description: `${streak} day streak! You're in the top 10% of consistent learners. Keep the momentum going.`,
        priority: 'low',
      });
    } else if (streak === 0) {
      insights.push({
        id: 'streak-start',
        type: 'recommendation',
        title: 'Start your streak today',
        description: 'Complete just one task to begin building momentum. Small wins compound over time.',
        action: 'Log activity',
        priority: 'medium',
      });
    }

    // Stale items warning
    if (staleCount > 0) {
      insights.push({
        id: 'stale',
        type: 'warning',
        title: `${staleCount} stale items detected`,
        description: 'Some tasks haven\'t been touched in over 5 days. Review and either complete or reschedule.',
        action: 'Review stale',
        priority: staleCount > 3 ? 'high' : 'medium',
      });
    }

    // Weekly velocity
    if (weeklyTasks >= 15) {
      insights.push({
        id: 'velocity',
        type: 'pattern',
        title: 'High velocity week',
        description: `${weeklyTasks} activities logged this week. You're on fire! Consider documenting what's working.`,
        priority: 'low',
      });
    } else if (weeklyTasks < 5) {
      insights.push({
        id: 'low-velocity',
        type: 'recommendation',
        title: 'Boost your weekly output',
        description: 'Your weekly activity is below average. Try the Pomodoro technique or time-blocking.',
        action: 'Plan week',
        priority: 'medium',
      });
    }

    // Progress milestone
    const avgProgress = (ibmProgress + csProgress) / 2;
    if (avgProgress >= 50 && avgProgress < 55) {
      insights.push({
        id: 'halfway',
        type: 'achievement',
        title: 'Halfway milestone reached!',
        description: 'You\'ve completed 50% of your learning objectives. The finish line is in sight.',
        priority: 'low',
      });
    }

    return insights.slice(0, 3); // Max 3 insights at a time
  };

  const insights = generateInsights();

  const typeConfig = {
    recommendation: {
      icon: Lightbulb,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30',
    },
    pattern: {
      icon: TrendingUp,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
      border: 'border-chart-1/30',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-status-warm',
      bg: 'bg-status-warm/10',
      border: 'border-status-warm/30',
    },
    achievement: {
      icon: Sparkles,
      color: 'text-status-active',
      bg: 'bg-status-active/10',
      border: 'border-status-active/30',
    },
  };

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">AI INSIGHTS</h3>
            <p className="font-mono text-[10px] text-muted-foreground">ANALYZING PATTERNS</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <Zap className="mx-auto h-8 w-8 text-status-active mb-2" />
            <p className="font-mono text-sm text-muted-foreground">All systems optimal</p>
            <p className="font-mono text-xs text-muted-foreground/60">No immediate actions needed</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">AI INSIGHTS</h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              {insights.length} RECOMMENDATION{insights.length !== 1 ? 'S' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          const isExpanded = expandedInsight === insight.id;

          return (
            <button
              key={insight.id}
              onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
              className={cn(
                'w-full rounded-xl border p-4 text-left transition-all duration-300',
                config.bg,
                config.border,
                isExpanded && 'ring-2 ring-primary/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  config.bg
                )}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono text-sm font-semibold text-foreground truncate">
                      {insight.title}
                    </h4>
                    {insight.priority === 'high' && (
                      <span className="shrink-0 rounded-full bg-status-blocked/20 px-2 py-0.5 font-mono text-[10px] font-bold text-status-blocked">
                        PRIORITY
                      </span>
                    )}
                  </div>
                  
                  <p className={cn(
                    'mt-1 font-mono text-xs text-muted-foreground transition-all duration-300',
                    isExpanded ? 'line-clamp-none' : 'line-clamp-2'
                  )}>
                    {insight.description}
                  </p>

                  {isExpanded && insight.action && (
                    <Button 
                      size="sm" 
                      className="mt-3 gap-2 font-mono text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {insight.action}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <ChevronRight className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300',
                  isExpanded && 'rotate-90'
                )} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
