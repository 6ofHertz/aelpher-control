import { useMemo } from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { useDashboardMetrics, useTopics, useSubtopics, useActivityLogs, useNextBestAction } from '@/hooks/useSupabaseData';
import { CommandCenter } from '@/components/dashboard/CommandCenter';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { HeroStats } from '@/components/dashboard/HeroStats';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { UrgentBanner } from '@/components/dashboard/UrgentBanner';
import { MomentumTracker } from '@/components/dashboard/MomentumTracker';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ModernActivityFeed } from '@/components/dashboard/ModernActivityFeed';
import { MilestoneTracker } from '@/components/dashboard/MilestoneTracker';
import { EmptyState } from '@/components/dashboard/EmptyState';

export function CombinedDashboard() {
  const metrics = useDashboardMetrics();
  const { topics: ibmTopics } = useTopics('ibm');
  const { topics: csTopics } = useTopics('cs');
  const allTopics = useMemo(() => [...ibmTopics, ...csTopics], [ibmTopics, csTopics]);
  const topicIds = useMemo(() => allTopics.map(t => t.id), [allTopics]);
  const { subtopics, updateSubtopic } = useSubtopics(topicIds);
  const { logs, addLog } = useActivityLogs(undefined, 30);
  
  const ibmNba = useNextBestAction('ibm');
  const csNba = useNextBestAction('cs');
  
  // Calculate streak
  const streak = useMemo(() => {
    const uniqueDays = new Set(logs.map(log => new Date(log.created_at).toDateString()));
    return uniqueDays.size;
  }, [logs]);
  
  // Calculate weekly tasks
  const weeklyTasks = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logs.filter(log => new Date(log.created_at) >= weekAgo).length;
  }, [logs]);

  // Calculate stale count (items not updated in 5+ days)
  const staleCount = useMemo(() => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    return subtopics.filter(s => !s.is_completed && new Date(s.updated_at) < fiveDaysAgo).length;
  }, [subtopics]);

  // System status
  const systemStatus = useMemo(() => {
    if (staleCount > 5) return 'overloaded';
    if (weeklyTasks >= 10) return 'optimal';
    if (weeklyTasks >= 5) return 'active';
    return 'idle';
  }, [staleCount, weeklyTasks]);

  // Focus score
  const focusScore = useMemo(() => {
    const base = Math.min(weeklyTasks * 5, 50);
    const streakBonus = Math.min(streak * 5, 30);
    const stalePenalty = staleCount * 5;
    return Math.max(0, Math.min(100, base + streakBonus - stalePenalty));
  }, [weeklyTasks, streak, staleCount]);
  
  const getTopicProgress = (topicId: string) => {
    const topicSubs = subtopics.filter(s => s.topic_id === topicId);
    return {
      completed: topicSubs.filter(s => s.is_completed).length,
      total: topicSubs.length,
    };
  };
  
  const ibmNbaParent = ibmNba ? ibmTopics.find(t => t.id === ibmNba.topic_id) : null;
  const csNbaParent = csNba ? csTopics.find(t => t.id === csNba.topic_id) : null;
  
  const handleCompleteNba = async (nbaId: string) => {
    await updateSubtopic(nbaId, { is_completed: true });
  };

  const handleLogActivity = async (data: { action: string; details?: string; armType: 'ibm' | 'cs'; durationMinutes?: number }) => {
    await addLog({
      action: data.action,
      details: data.details || null,
      arm_type: data.armType,
      duration_minutes: data.durationMinutes || null,
      task_id: null,
    });
  };

  const handleQuickComplete = () => {
    const nba = ibmNba || csNba;
    if (nba) handleCompleteNba(nba.id);
  };

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <CommandCenter 
        systemStatus={systemStatus}
        ibmProgress={metrics.ibm.progress}
        csProgress={metrics.cs.progress}
        activeTasks={subtopics.filter(s => !s.is_completed).length}
        focusScore={focusScore}
      />

      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">EXECUTION CONTROL</h1>
          <p className="text-sm text-muted-foreground font-mono">Intelligent tracking & planning system</p>
        </div>
        <QuickActions 
          topics={allTopics}
          onLogActivity={handleLogActivity}
          onQuickComplete={handleQuickComplete}
        />
      </div>

      {/* Hero Stats */}
      <HeroStats 
        streak={streak}
        weeklyTasks={weeklyTasks}
        weeklyGoal={20}
        timeToday={metrics.totalTimeToday}
        combinedProgress={metrics.combinedProgress}
      />

      {/* Main Grid: NBAs + AI Insights */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
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

          {/* Momentum Tracker */}
          <MomentumTracker logs={logs} daysToShow={14} />
        </div>

        {/* AI Insights Panel */}
        <AIInsightsPanel 
          ibmProgress={metrics.ibm.progress}
          csProgress={metrics.cs.progress}
          streak={streak}
          weeklyTasks={weeklyTasks}
          staleCount={staleCount}
        />
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
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
                  <CategoryCard key={topic.id} topic={topic} completedCount={progress.completed} totalCount={progress.total} />
                );
              })}
            </div>
          </div>
        )}

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
                  <CategoryCard key={topic.id} topic={topic} completedCount={progress.completed} totalCount={progress.total} />
                );
              })}
            </div>
          </div>
        )}

        {allTopics.length === 0 && <EmptyState type="topics" />}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-4">
        <ModernActivityFeed logs={logs} />
        <MilestoneTracker />
      </div>
    </div>
  );
}
