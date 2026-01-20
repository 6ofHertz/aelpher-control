import { useState } from 'react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { 
  Target, 
  Calendar, 
  DollarSign, 
  Award, 
  BookOpen,
  Check,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMilestones } from '@/hooks/useSupabaseData';
import type { Milestone, MilestoneCategory, ArmType, MilestoneInsert } from '@/types/database';
import { cn } from '@/lib/utils';

interface MilestoneTrackerProps {
  armType?: ArmType;
}

const categoryIcons = {
  Assignment: BookOpen,
  Certification: Award,
  Finance: DollarSign,
};

const categoryColors = {
  Assignment: 'text-primary bg-primary/10 border-primary/30',
  Certification: 'text-status-warm bg-status-warm/10 border-status-warm/30',
  Finance: 'text-status-active bg-status-active/10 border-status-active/30',
};

function getMilestoneStatus(milestone: Milestone) {
  if (milestone.is_completed) return 'completed';
  const dueDate = new Date(milestone.due_date);
  if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
  if (isToday(dueDate)) return 'due-today';
  const daysUntil = differenceInDays(dueDate, new Date());
  if (daysUntil <= 3) return 'due-soon';
  return 'upcoming';
}

function AddMilestoneDialog({ armType, onAdd }: { armType?: ArmType; onAdd: (m: MilestoneInsert) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('Assignment');
  const [selectedArm, setSelectedArm] = useState<ArmType>(armType || 'ibm');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate) return;
    setSubmitting(true);
    
    const success = await onAdd({
      title: title.trim(),
      description: null,
      due_date: new Date(dueDate).toISOString(),
      category,
      arm_type: selectedArm,
      is_completed: false,
      amount: category === 'Finance' && amount ? parseFloat(amount) : null,
    });

    if (success) {
      setTitle('');
      setDueDate('');
      setCategory('Assignment');
      setAmount('');
      setOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 font-mono text-xs">
          <Plus className="h-3 w-3" />
          ADD MILESTONE
        </Button>
      </DialogTrigger>
      <DialogContent className="font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">ADD MILESTONE</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs">TITLE</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Complete Red Hat Module"
              className="font-mono"
            />
          </div>
          
          {!armType && (
            <div className="space-y-2">
              <Label className="font-mono text-xs">ARM</Label>
              <Select value={selectedArm} onValueChange={(v) => setSelectedArm(v as ArmType)}>
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ibm">IBM Internship</SelectItem>
                  <SelectItem value="cs">CS Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-mono text-xs">CATEGORY</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MilestoneCategory)}>
              <SelectTrigger className="font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Certification">Certification</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-xs">DUE DATE</Label>
            <Input 
              type="date"
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="font-mono"
            />
          </div>

          {category === 'Finance' && (
            <div className="space-y-2">
              <Label className="font-mono text-xs">AMOUNT (optional)</Label>
              <Input 
                type="number"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="font-mono"
              />
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full font-mono" 
            disabled={!title.trim() || !dueDate || submitting}
          >
            {submitting ? 'SAVING...' : 'CONFIRM ADD'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MilestoneTracker({ armType }: MilestoneTrackerProps) {
  const { milestones, loading, addMilestone, completeMilestone } = useMilestones(armType);

  const sortedMilestones = [...milestones].sort((a, b) => {
    // Completed items go to the end
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    // Sort by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const nextMilestone = sortedMilestones.find(m => !m.is_completed);
  const upcomingCount = milestones.filter(m => !m.is_completed).length;

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">CRITICAL PATH</span>
        </div>
        <div className="mt-4 flex items-center justify-center py-8">
          <span className="font-mono text-xs text-muted-foreground">LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium text-foreground">CRITICAL PATH</span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
            {upcomingCount} PENDING
          </span>
        </div>
        <AddMilestoneDialog armType={armType} onAdd={addMilestone} />
      </div>

      {/* Next Milestone Highlight */}
      {nextMilestone && (
        <div className="border-b border-border bg-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">NEXT MILESTONE</span>
              <h3 className="font-mono text-sm font-bold text-foreground">{nextMilestone.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                  {format(new Date(nextMilestone.due_date), 'EEE, MMM d')}
                </span>
                {differenceInDays(new Date(nextMilestone.due_date), new Date()) <= 3 && (
                  <span className="rounded bg-status-warm/10 px-1.5 py-0.5 font-mono text-[10px] text-status-warm">
                    DUE SOON
                  </span>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 font-mono text-xs"
              onClick={() => completeMilestone(nextMilestone.id)}
            >
              <Check className="mr-1 h-3 w-3" />
              COMPLETE
            </Button>
          </div>
        </div>
      )}

      {/* Milestone List */}
      <div className="max-h-[300px] overflow-auto p-2">
        {sortedMilestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
            <span className="mt-2 font-mono text-xs text-muted-foreground">NO MILESTONES SET</span>
            <span className="font-mono text-[10px] text-muted-foreground/70">Add milestones to track your critical path</span>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedMilestones.slice(0, 10).map((milestone) => {
              const Icon = categoryIcons[milestone.category];
              const status = getMilestoneStatus(milestone);
              const daysUntil = differenceInDays(new Date(milestone.due_date), new Date());

              return (
                <div
                  key={milestone.id}
                  className={cn(
                    'flex items-center justify-between rounded-md border p-2 transition-colors',
                    milestone.is_completed && 'opacity-50',
                    categoryColors[milestone.category]
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span className={cn(
                      'font-mono text-xs',
                      milestone.is_completed && 'line-through'
                    )}>
                      {milestone.title}
                    </span>
                    {milestone.amount && (
                      <span className="font-mono text-xs font-bold">
                        ${milestone.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-mono text-[10px]',
                      status === 'overdue' && 'text-status-blocked',
                      status === 'due-today' && 'text-status-warm',
                      status === 'due-soon' && 'text-status-warm',
                      status === 'completed' && 'text-status-active'
                    )}>
                      {milestone.is_completed ? 'DONE' : 
                       status === 'overdue' ? 'OVERDUE' :
                       status === 'due-today' ? 'TODAY' :
                       daysUntil === 1 ? 'TOMORROW' :
                       `${daysUntil}d`}
                    </span>
                    {!milestone.is_completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => completeMilestone(milestone.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
