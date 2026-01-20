// Database type definitions for Aelpher 2.0

export type ArmType = 'ibm' | 'cs';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type MilestoneCategory = 'Assignment' | 'Certification' | 'Finance';

export interface Topic {
  id: string;
  arm_type: ArmType;
  title: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  subtopic_id: string | null;
  arm_type: ArmType;
  title: string;
  description: string | null;
  status: TaskStatus;
  duration_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  arm_type: ArmType;
  title: string;
  description: string | null;
  due_date: string;
  category: MilestoneCategory;
  is_completed: boolean;
  amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  arm_type: ArmType;
  action: string;
  details: string | null;
  duration_minutes: number | null;
  task_id: string | null;
  created_at: string;
}

// Extended types with joins
export interface TopicWithSubtopics extends Topic {
  subtopics: Subtopic[];
}

export interface SubtopicWithTopic extends Subtopic {
  topic: Topic;
}

// Metrics types
export interface ArmMetrics {
  totalSubtopics: number;
  completedSubtopics: number;
  progress: number;
  activeTasks: number;
  timeToday: number;
}

export interface DashboardMetrics {
  ibm: ArmMetrics;
  cs: ArmMetrics;
  combinedProgress: number;
  totalActiveTasks: number;
  totalTimeToday: number;
}

// Insert types (omit auto-generated fields)
export type TopicInsert = Omit<Topic, 'id' | 'created_at' | 'updated_at'>;
export type SubtopicInsert = Omit<Subtopic, 'id' | 'created_at' | 'updated_at'>;
export type TaskInsert = Omit<Task, 'id' | 'completed_at' | 'created_at' | 'updated_at'>;
export type MilestoneInsert = Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;
export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>;

// Update types
export type TaskUpdate = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
export type SubtopicUpdate = Partial<Omit<Subtopic, 'id' | 'created_at' | 'updated_at'>>;
export type MilestoneUpdate = Partial<Omit<Milestone, 'id' | 'created_at' | 'updated_at'>>;
