import { useState } from 'react';
import { format } from 'date-fns';
import { Activity, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLogs } from '@/hooks/useSupabaseData';
import type { ArmType, ActivityLogInsert } from '@/types/database';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  armType?: ArmType;
  maxItems?: number;
}

function AddActivityDialog({ armType, onAdd }: { armType?: ArmType; onAdd: (log: ActivityLogInsert) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [details, setDetails] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedArm, setSelectedArm] = useState<ArmType>(armType || 'ibm');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action.trim()) return;
    setSubmitting(true);

    const success = await onAdd({
      action: action.trim(),
      details: details.trim() || null,
      duration_minutes: duration ? parseInt(duration) : null,
      arm_type: selectedArm,
      task_id: null,
    });

    if (success) {
      setAction('');
      setDetails('');
      setDuration('');
      setOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 font-mono text-xs">
          <Plus className="h-3 w-3" />
          LOG ACTIVITY
        </Button>
      </DialogTrigger>
      <DialogContent className="font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">LOG ACTIVITY</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            <Label className="font-mono text-xs">ACTION</Label>
            <Input 
              value={action} 
              onChange={(e) => setAction(e.target.value)} 
              placeholder="e.g., Completed module, Reviewed notes..."
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-mono text-xs">DETAILS (optional)</Label>
            <Textarea 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              placeholder="Additional details..."
              className="font-mono"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-mono text-xs">DURATION (minutes, optional)</Label>
            <Input 
              type="number"
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              placeholder="30"
              className="font-mono"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full font-mono" 
            disabled={!action.trim() || submitting}
          >
            {submitting ? 'LOGGING...' : 'CONFIRM LOG'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ActivityFeed({ armType, maxItems = 10 }: ActivityFeedProps) {
  const { logs, loading, addLog } = useActivityLogs(armType, maxItems);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium text-foreground">ACTIVITY LOG</span>
          <span className="font-mono text-xs text-muted-foreground">
            {logs.length} entries
          </span>
        </div>
        <AddActivityDialog armType={armType} onAdd={addLog} />
      </div>

      {/* Activity List */}
      <ScrollArea className="h-[250px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="font-mono text-xs text-muted-foreground">LOADING...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground/50" />
            <span className="mt-2 font-mono text-xs text-muted-foreground">NO ACTIVITY YET</span>
            <span className="font-mono text-[10px] text-muted-foreground/70">Log your first activity to get started</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-muted/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'rounded px-1.5 py-0.5 font-mono text-[10px] uppercase',
                        log.arm_type === 'ibm' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-accent text-accent-foreground'
                      )}>
                        {log.arm_type}
                      </span>
                      <span className="font-mono text-xs font-medium text-foreground">
                        {log.action}
                      </span>
                    </div>
                    {log.details && (
                      <p className="mt-1 line-clamp-2 font-mono text-[11px] text-muted-foreground">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {format(new Date(log.created_at), 'HH:mm')}
                    </span>
                    {log.duration_minutes && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        <span className="font-mono text-[10px]">{log.duration_minutes}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
