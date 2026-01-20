import { Briefcase, GraduationCap, Clock, Target, TrendingUp } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useSupabaseData';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { MilestoneTracker } from '@/components/dashboard/MilestoneTracker';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { NBACard } from '@/components/dashboard/NBACard';

export function CombinedDashboard() {
  const metrics = useDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold text-foreground">GLOBAL DASHBOARD</h1>
          <p className="font-mono text-sm text-muted-foreground">
            Combined IBM + CS execution overview
          </p>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Combined Progress */}
        <div className="col-span-1 flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4">
          <ProgressRing 
            progress={metrics.combinedProgress} 
            label="COMBINED"
            size={100}
          />
        </div>

        {/* Individual Arm Progress */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-primary/30 bg-card p-4">
            <ProgressRing 
              progress={metrics.ibm.progress} 
              label="IBM"
              sublabel={`${metrics.ibm.completedSubtopics}/${metrics.ibm.totalSubtopics}`}
              size={80}
              variant="ibm"
            />
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-accent-foreground/30 bg-card p-4">
            <ProgressRing 
              progress={metrics.cs.progress} 
              label="CS"
              sublabel={`${metrics.cs.completedSubtopics}/${metrics.cs.totalSubtopics}`}
              size={80}
              variant="cs"
            />
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <MetricCard 
            label="Active Tasks"
            value={metrics.totalActiveTasks}
            icon={<Target className="h-4 w-4" />}
            variant="warning"
          />
          <MetricCard 
            label="Time Today"
            value={metrics.totalTimeToday}
            unit="min"
            icon={<Clock className="h-4 w-4" />}
            variant="success"
          />
          <MetricCard 
            label="IBM Active"
            value={metrics.ibm.activeTasks}
            icon={<Briefcase className="h-4 w-4" />}
          />
          <MetricCard 
            label="CS Active"
            value={metrics.cs.activeTasks}
            icon={<GraduationCap className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Critical Path / Milestones */}
        <div className="col-span-1">
          <MilestoneTracker />
        </div>

        {/* Activity Feed */}
        <div className="col-span-1">
          <ActivityFeed maxItems={15} />
        </div>

        {/* NBA Cards */}
        <div className="col-span-1 space-y-4">
          <NBACard armType="ibm" />
          <NBACard armType="cs" />
        </div>
      </div>
    </div>
  );
}
