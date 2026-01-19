import { useState } from 'react';
import { Briefcase, GraduationCap, Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { TheaterState, ArmType, LogEntry, NBAItem, Reflection } from '@/types';
import { deriveStatusFromLogs, getStatusColor, getStatusBgColor, formatMilitaryTime } from '@/lib/state-machine';
import { ExecutionLog } from './ExecutionLog';
import { NBAControl } from './NBAControl';
import { ArmScopedReflection } from './ArmScopedReflection';
import { cn } from '@/lib/utils';

interface TheaterBlockProps {
  theater: TheaterState;
  onAddLog: (log: Omit<LogEntry, 'id' | 'armType' | 'timestamp'>) => void;
  onAddNBA: (nba: Omit<NBAItem, 'id' | 'armType' | 'createdAt' | 'lastUpdated' | 'score'>) => void;
  onSelectNBA: (nbaId: string | null, isManual: boolean) => void;
  onAddReflection: (evidence: string, context: string) => void;
  reflections: Reflection[];
}

function AddLogDialog({ onAdd, armType }: { onAdd: TheaterBlockProps['onAddLog']; armType: ArmType }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [details, setDetails] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = () => {
    if (!action.trim()) return;
    onAdd({
      action: action.trim(),
      details: details.trim(),
      duration: duration ? parseInt(duration) : undefined,
    });
    setAction('');
    setDetails('');
    setDuration('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 font-mono text-xs">
          <Plus className="h-3 w-3" />
          LOG
        </Button>
      </DialogTrigger>
      <DialogContent className="font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">ADD LOG — {armType.toUpperCase()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs">ACTION</Label>
            <Input 
              value={action} 
              onChange={(e) => setAction(e.target.value)} 
              placeholder="e.g., Completed module, Reviewed code..."
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">DETAILS</Label>
            <Textarea 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              placeholder="Additional details..."
              className="font-mono"
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
          <Button onClick={handleSubmit} className="w-full font-mono" disabled={!action.trim()}>
            CONFIRM LOG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TheaterBlock({ 
  theater, 
  onAddLog, 
  onAddNBA, 
  onSelectNBA, 
  onAddReflection,
  reflections 
}: TheaterBlockProps) {
  const status = deriveStatusFromLogs(theater.logs);
  const Icon = theater.armType === 'ibm' ? Briefcase : GraduationCap;
  const title = theater.armType === 'ibm' ? 'IBM INTERNSHIP' : 'COMPUTER SCIENCE DEGREE';
  const subtitle = theater.armType === 'ibm' ? 'Professional Track' : 'Academic Track';

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md',
            theater.armType === 'ibm' ? 'bg-primary' : 'bg-accent-foreground'
          )}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-bold tracking-tight text-foreground">{title}</h2>
            <p className="font-mono text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-mono text-xs text-muted-foreground">STATUS</span>
            <div className={cn(
              'mt-1 rounded-md px-3 py-1 font-mono text-sm font-bold uppercase',
              getStatusBgColor(status),
              getStatusColor(status)
            )}>
              {status}
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-muted-foreground">PROGRESS</span>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={theater.totalProgress} className="h-2 w-24" />
              <span className="font-mono text-sm font-bold text-foreground">{theater.totalProgress}%</span>
            </div>
          </div>
          <AddLogDialog onAdd={onAddLog} armType={theater.armType} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Left: NBA Control */}
        <NBAControl 
          armType={theater.armType}
          currentNBA={theater.currentNBA}
          nbaQueue={theater.nbaQueue}
          onSelectNBA={onSelectNBA}
          onAddNBA={onAddNBA}
        />

        {/* Right: Execution Log */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs font-medium text-foreground">EXECUTION LOG</span>
            <span className="font-mono text-xs text-muted-foreground">
              {theater.logs.length > 0 && `Last: ${formatMilitaryTime(theater.logs[0]?.timestamp)}`}
            </span>
          </div>
          <ExecutionLog logs={theater.logs} maxHeight="180px" />
        </div>
      </div>

      {/* Reflection */}
      <div className="border-t border-border p-4">
        <ArmScopedReflection 
          armType={theater.armType}
          reflections={reflections}
          onAddReflection={onAddReflection}
        />
      </div>
    </div>
  );
}
