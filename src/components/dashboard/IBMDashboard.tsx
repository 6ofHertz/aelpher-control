import { Briefcase, Clock, Target, TrendingUp, Plus } from 'lucide-react';
import { useDashboardMetrics, useTopics, useSubtopics, useTasks } from '@/hooks/useSupabaseData';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MilestoneTracker } from '@/components/dashboard/MilestoneTracker';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { NBACard } from '@/components/dashboard/NBACard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function IBMDashboard() {
  const metrics = useDashboardMetrics();
  const { topics } = useTopics('ibm');
  const topicIds = topics.map(t => t.id);
  const { subtopics, updateSubtopic } = useSubtopics(topicIds);

  const handleToggleSubtopic = async (id: string, currentValue: boolean) => {
    await updateSubtopic(id, { is_completed: !currentValue });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold text-foreground">IBM INTERNSHIP</h1>
            <p className="font-mono text-sm text-muted-foreground">
              Professional development track
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-1 flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-card p-4">
          <ProgressRing 
            progress={metrics.ibm.progress} 
            label="PROGRESS"
            sublabel={`${metrics.ibm.completedSubtopics}/${metrics.ibm.totalSubtopics}`}
            size={100}
            variant="ibm"
          />
        </div>
        <MetricCard 
          label="Active Tasks"
          value={metrics.ibm.activeTasks}
          icon={<Target className="h-4 w-4" />}
          variant="warning"
        />
        <MetricCard 
          label="Time Today"
          value={metrics.ibm.timeToday}
          unit="min"
          icon={<Clock className="h-4 w-4" />}
          variant="success"
        />
        <MetricCard 
          label="Completed"
          value={metrics.ibm.completedSubtopics}
          unit="items"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="primary"
        />
        <MetricCard 
          label="Remaining"
          value={metrics.ibm.totalSubtopics - metrics.ibm.completedSubtopics}
          unit="items"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Topics & Subtopics */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm font-medium text-foreground">LEARNING TRACKS</span>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-auto p-4">
              {topics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                  <span className="mt-2 font-mono text-xs text-muted-foreground">NO TOPICS YET</span>
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    Add topics in the database to track progress
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.map(topic => {
                    const topicSubtopics = subtopics.filter(s => s.topic_id === topic.id);
                    const completedCount = topicSubtopics.filter(s => s.is_completed).length;
                    const progress = topicSubtopics.length > 0 
                      ? Math.round((completedCount / topicSubtopics.length) * 100)
                      : 0;

                    return (
                      <div key={topic.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-mono text-sm font-bold text-foreground">
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {completedCount}/{topicSubtopics.length}
                            </span>
                            <Progress value={progress} className="h-2 w-24" />
                          </div>
                        </div>
                        {topic.description && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {topic.description}
                          </p>
                        )}
                        
                        {topicSubtopics.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {topicSubtopics.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => handleToggleSubtopic(sub.id, sub.is_completed)}
                                className={cn(
                                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                                  sub.is_completed 
                                    ? 'bg-status-active/10 text-status-active' 
                                    : 'bg-muted/20 hover:bg-muted/40'
                                )}
                              >
                                <div className={cn(
                                  'flex h-4 w-4 items-center justify-center rounded-sm border',
                                  sub.is_completed 
                                    ? 'border-status-active bg-status-active' 
                                    : 'border-border'
                                )}>
                                  {sub.is_completed && (
                                    <span className="text-[10px] text-white">✓</span>
                                  )}
                                </div>
                                <span className={cn(
                                  'font-mono text-xs',
                                  sub.is_completed && 'line-through opacity-60'
                                )}>
                                  {sub.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-4">
          <NBACard armType="ibm" />
          <MilestoneTracker armType="ibm" />
          <ActivityFeed armType="ibm" maxItems={10} />
        </div>
      </div>
    </div>
  );
}
