import { useMemo } from 'react';
import { GraduationCap, Clock, Target, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { useDashboardMetrics, useTopics, useSubtopics, useNextBestAction, useActivityLogs } from '@/hooks/useSupabaseData';
import { EnhancedProgressRing } from '@/components/dashboard/EnhancedProgressRing';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { UrgentBanner } from '@/components/dashboard/UrgentBanner';
import { MilestoneTracker } from '@/components/dashboard/MilestoneTracker';
import { ModernActivityFeed } from '@/components/dashboard/ModernActivityFeed';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function CSDashboard() {
  const metrics = useDashboardMetrics();
  const { topics } = useTopics('cs');
  const topicIds = useMemo(() => topics.map(t => t.id), [topics]);
  const { subtopics, updateSubtopic } = useSubtopics(topicIds);
  const nba = useNextBestAction('cs');
  const nbaParent = nba ? topics.find(t => t.id === nba.topic_id) : null;
  const { logs } = useActivityLogs('cs', 10);

  const handleToggleSubtopic = async (id: string, currentValue: boolean) => {
    await updateSubtopic(id, { is_completed: !currentValue });
  };
  
  const handleCompleteNba = async () => {
    if (nba) {
      await updateSubtopic(nba.id, { is_completed: true });
    }
  };
  
  const getTopicProgress = (topicId: string) => {
    const topicSubs = subtopics.filter(s => s.topic_id === topicId);
    return {
      completed: topicSubs.filter(s => s.is_completed).length,
      total: topicSubs.length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-accent-foreground/30 to-accent-foreground/10 shadow-lg'
          )}>
            <GraduationCap className="h-7 w-7 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">CS Degree</h1>
            <p className="text-muted-foreground">
              Year 2 Semester 2 — Academic track
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Main Progress */}
        <div className={cn(
          'col-span-1 flex flex-col items-center justify-center rounded-2xl border p-6',
          'bg-gradient-to-br from-accent-foreground/10 to-transparent border-accent-foreground/20'
        )}>
          <EnhancedProgressRing 
            progress={metrics.cs.progress} 
            label="PROGRESS"
            sublabel={`${metrics.cs.completedSubtopics}/${metrics.cs.totalSubtopics}`}
            size={110}
            variant="cs"
          />
        </div>

        {/* Metric Cards */}
        <div className="col-span-4 grid grid-cols-4 gap-4">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-muted-foreground">Active Tasks</span>
              <Target className="h-4 w-4 text-status-warm" />
            </div>
            <span className="mt-2 font-mono text-3xl font-bold text-status-warm">
              {metrics.cs.activeTasks}
            </span>
          </div>
          
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-muted-foreground">Time Today</span>
              <Clock className="h-4 w-4 text-status-active" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-status-active">
                {metrics.cs.timeToday}
              </span>
              <span className="font-mono text-sm text-muted-foreground">min</span>
            </div>
          </div>
          
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-muted-foreground">Completed</span>
              <TrendingUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-accent-foreground">
                {metrics.cs.completedSubtopics}
              </span>
              <span className="font-mono text-sm text-muted-foreground">units</span>
            </div>
          </div>
          
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-muted-foreground">Remaining</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold text-foreground">
                {metrics.cs.totalSubtopics - metrics.cs.completedSubtopics}
              </span>
              <span className="font-mono text-sm text-muted-foreground">units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Action */}
      <UrgentBanner 
        nba={nba}
        parentTopic={nbaParent}
        onComplete={handleCompleteNba}
        armType="cs"
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Topics & Subtopics */}
        <div className="col-span-2 space-y-4">
          <h2 className="font-mono text-sm font-bold uppercase text-muted-foreground">
            Course Units
          </h2>
          
          {topics.length === 0 ? (
            <EmptyState type="topics" armType="cs" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {topics.map(topic => {
                const progress = getTopicProgress(topic.id);
                const topicSubtopics = subtopics.filter(s => s.topic_id === topic.id);
                const progressPct = progress.total > 0 
                  ? Math.round((progress.completed / progress.total) * 100)
                  : 0;

                return (
                  <div 
                    key={topic.id} 
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-sm font-bold text-foreground">
                        {topic.title}
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                    
                    <Progress value={progressPct} className="mt-2 h-2" />
                    
                    {topic.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                        {topic.description}
                      </p>
                    )}
                    
                    {/* Subtopics */}
                    <div className="mt-3 space-y-1 max-h-[180px] overflow-auto">
                      {topicSubtopics.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleToggleSubtopic(sub.id, sub.is_completed)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all',
                            sub.is_completed 
                              ? 'bg-status-active/10 hover:bg-status-active/15' 
                              : 'hover:bg-muted/30'
                          )}
                        >
                          <div className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors',
                            sub.is_completed 
                              ? 'border-status-active bg-status-active text-background' 
                              : 'border-border'
                          )}>
                            {sub.is_completed && (
                              <span className="text-[10px]">✓</span>
                            )}
                          </div>
                          <span className={cn(
                            'font-mono text-xs flex-1',
                            sub.is_completed && 'line-through text-muted-foreground'
                          )}>
                            {sub.title}
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <MilestoneTracker armType="cs" />
          <ModernActivityFeed logs={logs} />
        </div>
      </div>
    </div>
  );
}
