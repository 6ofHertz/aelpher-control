import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Topic, 
  Subtopic, 
  Task, 
  Milestone, 
  ActivityLog,
  ArmType,
  ArmMetrics,
  DashboardMetrics,
  TaskInsert,
  ActivityLogInsert,
  SubtopicUpdate,
  TaskUpdate,
  MilestoneInsert
} from '@/types/database';
import { useToast } from '@/hooks/use-toast';

// ============================================
// TOPICS HOOK
// ============================================
export function useTopics(armType?: ArmType) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('topics')
      .select('*')
      .order('display_order', { ascending: true });

    if (armType) {
      query = query.eq('arm_type', armType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('[SUPABASE] Error fetching topics:', error);
      toast({ title: 'Error', description: 'Failed to fetch topics', variant: 'destructive' });
    } else {
      setTopics(data || []);
    }
    setLoading(false);
  }, [armType, toast]);

  useEffect(() => {
    fetchTopics();

    // Real-time subscription
    const channel = supabase
      .channel('topics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, () => {
        console.log('[SUPABASE] Topics changed, refetching...');
        fetchTopics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTopics]);

  return { topics, loading, refetch: fetchTopics };
}

// ============================================
// SUBTOPICS HOOK
// ============================================
export function useSubtopics(topicIds?: string[]) {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubtopics = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('subtopics')
      .select('*')
      .order('display_order', { ascending: true });

    if (topicIds && topicIds.length > 0) {
      query = query.in('topic_id', topicIds);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('[SUPABASE] Error fetching subtopics:', error);
      toast({ title: 'Error', description: 'Failed to fetch subtopics', variant: 'destructive' });
    } else {
      setSubtopics(data || []);
    }
    setLoading(false);
  }, [topicIds, toast]);

  const updateSubtopic = useCallback(async (id: string, updates: SubtopicUpdate) => {
    const { error } = await supabase
      .from('subtopics')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('[SUPABASE] Error updating subtopic:', error);
      toast({ title: 'Error', description: 'Failed to update subtopic', variant: 'destructive' });
      return false;
    }
    return true;
  }, [toast]);

  useEffect(() => {
    fetchSubtopics();

    const channel = supabase
      .channel('subtopics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtopics' }, () => {
        console.log('[SUPABASE] Subtopics changed, refetching...');
        fetchSubtopics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSubtopics]);

  return { subtopics, loading, refetch: fetchSubtopics, updateSubtopic };
}

// ============================================
// TASKS HOOK
// ============================================
export function useTasks(armType?: ArmType) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (armType) {
      query = query.eq('arm_type', armType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('[SUPABASE] Error fetching tasks:', error);
      toast({ title: 'Error', description: 'Failed to fetch tasks', variant: 'destructive' });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, [armType, toast]);

  const addTask = useCallback(async (task: TaskInsert) => {
    const { error } = await supabase.from('tasks').insert(task);
    if (error) {
      console.error('[SUPABASE] Error adding task:', error);
      toast({ title: 'Error', description: 'Failed to add task', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Task added successfully' });
    return true;
  }, [toast]);

  const updateTask = useCallback(async (id: string, updates: TaskUpdate) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('[SUPABASE] Error updating task:', error);
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
      return false;
    }
    return true;
  }, [toast]);

  const completeTask = useCallback(async (id: string) => {
    return updateTask(id, { status: 'completed' });
  }, [updateTask]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        console.log('[SUPABASE] Tasks changed, refetching...');
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  return { tasks, loading, refetch: fetchTasks, addTask, updateTask, completeTask };
}

// ============================================
// MILESTONES HOOK
// ============================================
export function useMilestones(armType?: ArmType) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('milestones')
      .select('*')
      .order('due_date', { ascending: true });

    if (armType) {
      query = query.eq('arm_type', armType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('[SUPABASE] Error fetching milestones:', error);
      toast({ title: 'Error', description: 'Failed to fetch milestones', variant: 'destructive' });
    } else {
      setMilestones(data || []);
    }
    setLoading(false);
  }, [armType, toast]);

  const addMilestone = useCallback(async (milestone: MilestoneInsert) => {
    const { error } = await supabase.from('milestones').insert(milestone);
    if (error) {
      console.error('[SUPABASE] Error adding milestone:', error);
      toast({ title: 'Error', description: 'Failed to add milestone', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Milestone added successfully' });
    return true;
  }, [toast]);

  const completeMilestone = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('milestones')
      .update({ is_completed: true })
      .eq('id', id);

    if (error) {
      console.error('[SUPABASE] Error completing milestone:', error);
      toast({ title: 'Error', description: 'Failed to complete milestone', variant: 'destructive' });
      return false;
    }
    return true;
  }, [toast]);

  useEffect(() => {
    fetchMilestones();

    const channel = supabase
      .channel('milestones-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => {
        console.log('[SUPABASE] Milestones changed, refetching...');
        fetchMilestones();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMilestones]);

  return { milestones, loading, refetch: fetchMilestones, addMilestone, completeMilestone };
}

// ============================================
// ACTIVITY LOGS HOOK
// ============================================
export function useActivityLogs(armType?: ArmType, limit = 50) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (armType) {
      query = query.eq('arm_type', armType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('[SUPABASE] Error fetching activity logs:', error);
      toast({ title: 'Error', description: 'Failed to fetch activity logs', variant: 'destructive' });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }, [armType, limit, toast]);

  const addLog = useCallback(async (log: ActivityLogInsert) => {
    const { error } = await supabase.from('activity_logs').insert(log);
    if (error) {
      console.error('[SUPABASE] Error adding activity log:', error);
      toast({ title: 'Error', description: 'Failed to log activity', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Logged', description: 'Activity recorded' });
    return true;
  }, [toast]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('activity-logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        console.log('[SUPABASE] Activity logs changed, refetching...');
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs, addLog };
}

// ============================================
// DASHBOARD METRICS HOOK
// ============================================
export function useDashboardMetrics() {
  const { topics } = useTopics();
  const { subtopics } = useSubtopics();
  const { tasks } = useTasks();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ibm: { totalSubtopics: 0, completedSubtopics: 0, progress: 0, activeTasks: 0, timeToday: 0 },
    cs: { totalSubtopics: 0, completedSubtopics: 0, progress: 0, activeTasks: 0, timeToday: 0 },
    combinedProgress: 0,
    totalActiveTasks: 0,
    totalTimeToday: 0,
  });

  useEffect(() => {
    const calculateArmMetrics = (arm: ArmType): ArmMetrics => {
      const armTopicIds = topics.filter(t => t.arm_type === arm).map(t => t.id);
      const armSubtopics = subtopics.filter(s => armTopicIds.includes(s.topic_id));
      const armTasks = tasks.filter(t => t.arm_type === arm);

      const total = armSubtopics.length;
      const completed = armSubtopics.filter(s => s.is_completed).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      const activeTasks = armTasks.filter(t => t.status !== 'completed').length;

      // Calculate time today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeToday = armTasks
        .filter(t => {
          if (!t.completed_at) return false;
          const completedDate = new Date(t.completed_at);
          return completedDate >= today;
        })
        .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

      return { totalSubtopics: total, completedSubtopics: completed, progress, activeTasks, timeToday };
    };

    const ibmMetrics = calculateArmMetrics('ibm');
    const csMetrics = calculateArmMetrics('cs');

    const totalSubtopics = ibmMetrics.totalSubtopics + csMetrics.totalSubtopics;
    const totalCompleted = ibmMetrics.completedSubtopics + csMetrics.completedSubtopics;
    const combinedProgress = totalSubtopics > 0 ? Math.round((totalCompleted / totalSubtopics) * 100) : 0;

    setMetrics({
      ibm: ibmMetrics,
      cs: csMetrics,
      combinedProgress,
      totalActiveTasks: ibmMetrics.activeTasks + csMetrics.activeTasks,
      totalTimeToday: ibmMetrics.timeToday + csMetrics.timeToday,
    });
  }, [topics, subtopics, tasks]);

  return metrics;
}

// ============================================
// NEXT BEST ACTION HOOK
// ============================================
export function useNextBestAction(armType: ArmType) {
  const { topics } = useTopics(armType);
  const topicIds = topics.map(t => t.id);
  const { subtopics } = useSubtopics(topicIds);
  const [nba, setNba] = useState<Subtopic | null>(null);

  useEffect(() => {
    // Find first incomplete subtopic
    const incompleteSubtopics = subtopics
      .filter(s => !s.is_completed)
      .sort((a, b) => a.display_order - b.display_order);

    setNba(incompleteSubtopics[0] || null);
  }, [subtopics]);

  return nba;
}
