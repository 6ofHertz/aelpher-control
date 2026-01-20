import { Target, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNextBestAction, useSubtopics, useTopics } from '@/hooks/useSupabaseData';
import type { ArmType } from '@/types/database';
import { cn } from '@/lib/utils';

interface NBACardProps {
  armType: ArmType;
}

export function NBACard({ armType }: NBACardProps) {
  const nba = useNextBestAction(armType);
  const { topics } = useTopics(armType);
  const topicIds = topics.map(t => t.id);
  const { updateSubtopic } = useSubtopics(topicIds);

  const parentTopic = nba ? topics.find(t => t.id === nba.topic_id) : null;

  const handleComplete = async () => {
    if (!nba) return;
    await updateSubtopic(nba.id, { is_completed: true });
  };

  return (
    <div className={cn(
      'rounded-lg border bg-card p-4',
      armType === 'ibm' ? 'border-primary/30' : 'border-accent-foreground/30'
    )}>
      <div className="flex items-center gap-2">
        <Target className={cn(
          'h-4 w-4',
          armType === 'ibm' ? 'text-primary' : 'text-accent-foreground'
        )} />
        <span className="font-mono text-xs font-medium uppercase text-muted-foreground">
          NEXT BEST ACTION
        </span>
      </div>

      {nba ? (
        <div className="mt-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {parentTopic && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {parentTopic.title}
                </span>
              )}
              <h3 className="font-mono text-sm font-bold text-foreground">
                {nba.title}
              </h3>
              {nba.description && (
                <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                  {nba.description}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-7 gap-1 font-mono text-xs"
              onClick={handleComplete}
            >
              <Check className="h-3 w-3" />
              DONE
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-1 text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-[10px]">Complete to unlock next action</span>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-center rounded-md border border-dashed border-border py-6">
          <span className="font-mono text-xs text-muted-foreground">ALL COMPLETE</span>
        </div>
      )}
    </div>
  );
}
