-- =============================================
-- AELPHER 2.0 DATABASE SCHEMA
-- Topics, Subtopics, Tasks, Milestones
-- =============================================

-- Create enum for arm types
CREATE TYPE public.arm_type AS ENUM ('ibm', 'cs');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');

-- Create enum for milestone categories
CREATE TYPE public.milestone_category AS ENUM ('Assignment', 'Certification', 'Finance');

-- =============================================
-- TOPICS TABLE
-- Top-level categories for each arm
-- =============================================
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arm_type public.arm_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Topics are public read (no auth required for this personal tool)
CREATE POLICY "Topics are viewable by everyone" 
ON public.topics FOR SELECT USING (true);

CREATE POLICY "Topics are insertable by everyone" 
ON public.topics FOR INSERT WITH CHECK (true);

CREATE POLICY "Topics are updatable by everyone" 
ON public.topics FOR UPDATE USING (true);

CREATE POLICY "Topics are deletable by everyone" 
ON public.topics FOR DELETE USING (true);

-- =============================================
-- SUBTOPICS TABLE
-- Child items under topics
-- =============================================
CREATE TABLE public.subtopics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subtopics are viewable by everyone" 
ON public.subtopics FOR SELECT USING (true);

CREATE POLICY "Subtopics are insertable by everyone" 
ON public.subtopics FOR INSERT WITH CHECK (true);

CREATE POLICY "Subtopics are updatable by everyone" 
ON public.subtopics FOR UPDATE USING (true);

CREATE POLICY "Subtopics are deletable by everyone" 
ON public.subtopics FOR DELETE USING (true);

-- =============================================
-- TASKS TABLE
-- Individual work items linked to subtopics
-- =============================================
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE SET NULL,
  arm_type public.arm_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'pending',
  duration_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone" 
ON public.tasks FOR SELECT USING (true);

CREATE POLICY "Tasks are insertable by everyone" 
ON public.tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Tasks are updatable by everyone" 
ON public.tasks FOR UPDATE USING (true);

CREATE POLICY "Tasks are deletable by everyone" 
ON public.tasks FOR DELETE USING (true);

-- =============================================
-- MILESTONES TABLE
-- Key dates and financial targets
-- =============================================
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arm_type public.arm_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category public.milestone_category NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  amount NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Milestones are viewable by everyone" 
ON public.milestones FOR SELECT USING (true);

CREATE POLICY "Milestones are insertable by everyone" 
ON public.milestones FOR INSERT WITH CHECK (true);

CREATE POLICY "Milestones are updatable by everyone" 
ON public.milestones FOR UPDATE USING (true);

CREATE POLICY "Milestones are deletable by everyone" 
ON public.milestones FOR DELETE USING (true);

-- =============================================
-- ACTIVITY LOGS TABLE
-- Execution log entries
-- =============================================
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arm_type public.arm_type NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  duration_minutes INTEGER,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity logs are viewable by everyone" 
ON public.activity_logs FOR SELECT USING (true);

CREATE POLICY "Activity logs are insertable by everyone" 
ON public.activity_logs FOR INSERT WITH CHECK (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_topics_arm_type ON public.topics(arm_type);
CREATE INDEX idx_subtopics_topic_id ON public.subtopics(topic_id);
CREATE INDEX idx_subtopics_is_completed ON public.subtopics(is_completed);
CREATE INDEX idx_tasks_arm_type ON public.tasks(arm_type);
CREATE INDEX idx_tasks_subtopic_id ON public.tasks(subtopic_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_completed_at ON public.tasks(completed_at);
CREATE INDEX idx_milestones_arm_type ON public.milestones(arm_type);
CREATE INDEX idx_milestones_due_date ON public.milestones(due_date);
CREATE INDEX idx_milestones_category ON public.milestones(category);
CREATE INDEX idx_activity_logs_arm_type ON public.activity_logs(arm_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- =============================================
-- UPDATE TIMESTAMP TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_topics_updated_at
BEFORE UPDATE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subtopics_updated_at
BEFORE UPDATE ON public.subtopics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-COMPLETE TASK TRIGGER
-- When task is marked completed, set completed_at
-- =============================================
CREATE OR REPLACE FUNCTION public.set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_task_completed_at_trigger
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.set_task_completed_at();