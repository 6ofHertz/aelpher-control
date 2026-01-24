import { useState } from 'react';
import { 
  ChevronRight, 
  Clock, 
  GripVertical, 
  PlayCircle, 
  CheckCircle,
  Circle,
  Zap,
  Target,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Subtopic, Topic } from '@/types/database';

interface QueueItem {
  subtopic: Subtopic;
  topic: Topic;
  score: number;
  estimatedMinutes: number;
  urgency: 'critical' | 'high' | 'normal' | 'low';
}

interface SmartQueueProps {
  items: QueueItem[];
  onStartTask: (subtopicId: string) => void;
  onCompleteTask: (subtopicId: string) => void;
}

export function SmartQueue({ items, onStartTask, onCompleteTask }: SmartQueueProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const urgencyConfig = {
    critical: {
      color: 'text-status-blocked',
      bg: 'bg-status-blocked/10',
      border: 'border-status-blocked/40',
      badge: 'bg-status-blocked text-background',
    },
    high: {
      color: 'text-status-warm',
      bg: 'bg-status-warm/10',
      border: 'border-status-warm/40',
      badge: 'bg-status-warm text-background',
    },
    normal: {
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/40',
      badge: 'bg-primary text-primary-foreground',
    },
    low: {
      color: 'text-muted-foreground',
      bg: 'bg-muted/20',
      border: 'border-muted/40',
      badge: 'bg-muted text-foreground',
    },
  };

  const handleStart = (id: string) => {
    setActiveTaskId(id);
    onStartTask(id);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">SMART QUEUE</h3>
            <p className="font-mono text-[10px] text-muted-foreground">
              AI-PRIORITIZED • {items.length} ITEMS
            </p>
          </div>
        </div>
        
        {items.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Clock className="h-3 w-3" />
            {items.reduce((acc, item) => acc + item.estimatedMinutes, 0)} min total
          </div>
        )}
      </div>

      {/* Queue Items */}
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-status-active mb-3" />
            <p className="font-mono text-sm font-semibold text-foreground">Queue Clear!</p>
            <p className="font-mono text-xs text-muted-foreground">All tasks completed</p>
          </div>
        ) : (
          items.slice(0, 5).map((item, index) => {
            const config = urgencyConfig[item.urgency];
            const isActive = activeTaskId === item.subtopic.id;
            const isFirst = index === 0;

            return (
              <div 
                key={item.subtopic.id}
                className={cn(
                  'group relative flex items-center gap-4 px-6 py-4 transition-all duration-300',
                  isFirst && 'bg-gradient-to-r from-primary/5 to-transparent',
                  isActive && 'bg-primary/10'
                )}
              >
                {/* Position Indicator */}
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold',
                  isFirst ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                )}>
                  {isFirst ? <Zap className="h-4 w-4" /> : index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase',
                      config.badge
                    )}>
                      {item.urgency === 'critical' ? 'CRITICAL' : 
                       item.urgency === 'high' ? 'HIGH' : 
                       item.urgency === 'normal' ? 'NEXT' : 'LOW'}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground truncate">
                      {item.topic.title}
                    </span>
                  </div>
                  
                  <h4 className="mt-1 font-mono text-sm font-semibold text-foreground truncate">
                    {item.subtopic.title}
                  </h4>
                  
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{item.estimatedMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Score: {item.score}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isActive ? (
                    <Button 
                      size="sm" 
                      className="gap-2 font-mono text-xs bg-status-active hover:bg-status-active/90"
                      onClick={() => onCompleteTask(item.subtopic.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant={isFirst ? "default" : "outline"}
                      className="gap-2 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStart(item.subtopic.id)}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Start
                    </Button>
                  )}
                </div>

                {/* First item glow effect */}
                {isFirst && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-transparent" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {items.length > 5 && (
        <div className="border-t border-border bg-muted/20 px-6 py-3">
          <Button variant="ghost" className="w-full gap-2 font-mono text-xs">
            View all {items.length} items
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
