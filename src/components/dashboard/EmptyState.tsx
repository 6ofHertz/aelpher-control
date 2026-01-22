import { ReactNode } from 'react';
import { Rocket, BookOpen, Plus, Upload, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'tasks' | 'topics' | 'activity' | 'milestones';
  armType?: 'ibm' | 'cs';
  onAction?: () => void;
}

const emptyStates = {
  tasks: {
    icon: Rocket,
    title: 'No tasks yet',
    description: 'Start your journey by adding your first task',
    illustration: (
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
        <div className="absolute inset-4 animate-pulse rounded-full bg-primary/20" style={{ animationDelay: '0.2s' }} />
        <div className="absolute inset-8 flex items-center justify-center rounded-full bg-primary/30">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
      </div>
    ),
    actions: [
      { label: 'Add Task', icon: Plus, variant: 'default' as const },
    ],
  },
  topics: {
    icon: BookOpen,
    title: 'No learning tracks',
    description: 'Add topics to start tracking your progress',
    illustration: (
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i}
                className="h-12 w-12 animate-pulse rounded-xl bg-muted/30"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    actions: [
      { label: 'Import Syllabus', icon: Upload, variant: 'outline' as const },
      { label: 'Add Topic', icon: Plus, variant: 'default' as const },
    ],
  },
  activity: {
    icon: BookOpen,
    title: 'No activity yet',
    description: 'Your learning journey will be tracked here',
    illustration: (
      <div className="relative h-24 w-full max-w-[200px]">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="absolute left-0 right-0 h-6 animate-pulse rounded bg-muted/20"
            style={{ 
              top: `${i * 28}px`,
              animationDelay: `${i * 0.15}s`,
              width: `${100 - i * 20}%`
            }}
          />
        ))}
      </div>
    ),
    actions: [
      { label: 'Log Activity', icon: Plus, variant: 'default' as const },
    ],
  },
  milestones: {
    icon: Rocket,
    title: 'No milestones set',
    description: 'Set goals to track your critical path',
    illustration: (
      <div className="relative h-32 w-32">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted) / 0.2)"
            strokeWidth="4"
            strokeDasharray="8 4"
            className="animate-[spin_20s_linear_infinite]"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="hsl(var(--muted) / 0.3)"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-[spin_15s_linear_infinite_reverse]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Rocket className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </div>
    ),
    actions: [
      { label: 'Add Milestone', icon: Plus, variant: 'default' as const },
    ],
  },
};

export function EmptyState({ type, armType, onAction }: EmptyStateProps) {
  const state = emptyStates[type];
  const ArmIcon = armType === 'ibm' ? Briefcase : armType === 'cs' ? GraduationCap : null;
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Illustration */}
      <div className="mb-6">
        {state.illustration}
      </div>
      
      {/* Title with arm badge */}
      <div className="flex items-center gap-2 mb-2">
        {ArmIcon && (
          <div className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md',
            armType === 'ibm' ? 'bg-primary/20' : 'bg-accent-foreground/20'
          )}>
            <ArmIcon className={cn(
              'h-3.5 w-3.5',
              armType === 'ibm' ? 'text-primary' : 'text-accent-foreground'
            )} />
          </div>
        )}
        <h3 className="font-mono text-lg font-bold text-foreground">
          {state.title}
        </h3>
      </div>
      
      {/* Description */}
      <p className="font-mono text-sm text-muted-foreground max-w-[280px]">
        {state.description}
      </p>
      
      {/* Actions */}
      {state.actions.length > 0 && onAction && (
        <div className="mt-6 flex gap-3">
          {state.actions.map((action) => (
            <Button 
              key={action.label}
              variant={action.variant}
              className="gap-2 font-mono"
              onClick={onAction}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
