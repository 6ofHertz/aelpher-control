import { useMemo } from 'react';
import { Briefcase, GraduationCap, Clock, Target, Plus } from 'lucide-react';
import { useDashboardMetrics, useTopics, useSubtopics, useActivityLogs, useNextBestAction } from '@/hooks/useSupabaseData';
import { HeroStats } from '@/components/dashboard/HeroStats';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { UrgentBanner } from '@/components/dashboard/UrgentBanner';
import { FeynmanCard } from '@/components/dashboard/FeynmanCard';
import { ModernActivityFeed } from '@/components/dashboard/ModernActivityFeed';
import { MilestoneTracker } from '@/components/dashboard/MilestoneTracker';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CombinedDashboard() {
  const metrics = useDashboardMetrics();
  const { topics: ibmTopics } = useTopics('ibm');
  const { topics: csTopics } = useTopics('cs');
  const allTopics = useMemo(() => [...ibmTopics, ...csTopics], [ibmTopics, csTopics]);
  const topicIds = useMemo(() => allTopics.map(t => t.id), [allTopics]);
  const { subtopics } = useSubtopics(topicIds);
  const { logs } = useActivityLogs(undefined, 15);
  
  const ibmNba = useNextBestAction('ibm');
  const csNba = useNextBestAction('cs');
  
  // Calculate streak (simplified - would need proper activity tracking)
  const streak = useMemo(() => {
    // Count consecutive days with activity
    const uniqueDays = new Set(
      logs.map(log => new Date(log.created_at).toDateString())
    );
    return uniqueDays.size;
  }, [logs]);
  
  // Calculate weekly tasks completed
  const weeklyTasks = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs.filter(log => new Date(log.created_at) >= weekAgo).length;
  }, [logs]);
  
  // Get subtopic counts per topic
  const getTopicProgress = (topicId: string) => {
    const topicSubs = subtopics.filter(s => s.topic_id === topicId);
    return {
      completed: topicSubs.filter(s => s.is_completed).length,
      total: topicSubs.length,
    };
  };
  
  // Find parent topic for NBA
  const ibmNbaParent = ibmNba ? ibmTopics.find(t => t.id === ibmNba.topic_id) : null;
  const csNbaParent = csNba ? csTopics.find(t => t.id === csNba.topic_id) : null;
  
  // Handle NBA completion
  const { updateSubtopic } = useSubtopics(topicIds);
  const handleCompleteNba = async (nbaId: string) => {
    await updateSubtopic(nbaId, { is_completed: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Your execution control center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Quick Log
          </Button>
        </div>
      </div>

      {/* Hero Stats Section */}
      <HeroStats 
        streak={streak}
        weeklyTasks={weeklyTasks}
        weeklyGoal={20}
        timeToday={metrics.totalTimeToday}
        combinedProgress={metrics.combinedProgress}
      />

      {/* Next Best Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">IBM Next Action</span>
          </div>
          <UrgentBanner 
            nba={ibmNba}
            parentTopic={ibmNbaParent}
            onComplete={() => ibmNba && handleCompleteNba(ibmNba.id)}
            armType="ibm"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-accent-foreground" />
            <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">CS Next Action</span>
          </div>
          <UrgentBanner 
            nba={csNba}
            parentTopic={csNbaParent}
            onComplete={() => csNba && handleCompleteNba(csNba.id)}
            armType="cs"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        {/* IBM Categories */}
        {ibmTopics.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-mono text-sm font-bold text-foreground">IBM INTERNSHIP</span>
              <span className="font-mono text-xs text-muted-foreground">
                {metrics.ibm.completedSubtopics}/{metrics.ibm.totalSubtopics} complete
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {ibmTopics.map(topic => {
                const progress = getTopicProgress(topic.id);
                return (
                  <CategoryCard
                    key={topic.id}
                    topic={topic}
                    completedCount={progress.completed}
                    totalCount={progress.total}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* CS Categories */}
        {csTopics.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-foreground/20">
                <GraduationCap className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
              <span className="font-mono text-sm font-bold text-foreground">CS DEGREE</span>
              <span className="font-mono text-xs text-muted-foreground">
                {metrics.cs.completedSubtopics}/{metrics.cs.totalSubtopics} complete
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {csTopics.map(topic => {
                const progress = getTopicProgress(topic.id);
                return (
                  <CategoryCard
                    key={topic.id}
                    topic={topic}
                    completedCount={progress.completed}
                    totalCount={progress.total}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state when no topics */}
        {allTopics.length === 0 && (
          <EmptyState type="topics" />
        )}
      </div>

      {/* Bottom Grid: Feynman + Activity + Milestones */}
      <div className="grid grid-cols-3 gap-4">
        <FeynmanCard />
        <ModernActivityFeed logs={logs} />
        <MilestoneTracker />
      </div>
    </div>
  );
}
