import { useState } from 'react';
import { Lock, Unlock, Target, Calculator, Hand, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { NBAItem, ArmType } from '@/types';
import { rankNBAQueue } from '@/lib/nba-scoring';
import { cn } from '@/lib/utils';

interface NBAControlProps {
  armType: ArmType;
  currentNBA: NBAItem | null;
  nbaQueue: NBAItem[];
  onSelectNBA: (nbaId: string | null, isManual: boolean) => void;
  onAddNBA: (nba: Omit<NBAItem, 'id' | 'armType' | 'createdAt' | 'lastUpdated' | 'score'>) => void;
}

function AddNBADialog({ onAdd, armType }: { onAdd: NBAControlProps['onAddNBA']; armType: ArmType }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gap, setGap] = useState([2]);
  const [hasEarlyBonus, setHasEarlyBonus] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      staleDays: 0,
      gap: gap[0],
      hasEarlyProgressBonus: hasEarlyBonus,
      isManuallySelected: false,
      isLocked: false,
    });
    setTitle('');
    setDescription('');
    setGap([2]);
    setHasEarlyBonus(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 font-mono text-xs">
          <Plus className="h-3 w-3" />
          ADD NBA
        </Button>
      </DialogTrigger>
      <DialogContent className="font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono">ADD NEW NBA — {armType.toUpperCase()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs">TITLE</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter NBA title..."
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">DESCRIPTION</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter description..."
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs">PRIORITY GAP (0-5): {gap[0]}</Label>
            <Slider value={gap} onValueChange={setGap} min={0} max={5} step={1} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={hasEarlyBonus} onCheckedChange={setHasEarlyBonus} />
            <Label className="font-mono text-xs">EARLY PROGRESS BONUS (+15pts)</Label>
          </div>
          <Button onClick={handleSubmit} className="w-full font-mono" disabled={!title.trim()}>
            CONFIRM ADD
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NBAControl({ armType, currentNBA, nbaQueue, onSelectNBA, onAddNBA }: NBAControlProps) {
  const [isManualMode, setIsManualMode] = useState(currentNBA?.isManuallySelected || false);
  const rankedQueue = rankNBAQueue(nbaQueue);
  const topCalculated = rankedQueue[0];

  const handleModeToggle = (manual: boolean) => {
    setIsManualMode(manual);
    if (!manual && topCalculated) {
      // Switch to auto mode - select the top calculated NBA
      onSelectNBA(topCalculated.id, false);
    }
  };

  const handleManualSelect = (nbaId: string) => {
    onSelectNBA(nbaId, true);
    setIsManualMode(true);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium text-foreground">NBA CONTROL</span>
        </div>
        <div className="flex items-center gap-3">
          <AddNBADialog onAdd={onAddNBA} armType={armType} />
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1">
            <Calculator className={cn('h-3 w-3', !isManualMode && 'text-primary')} />
            <Switch 
              checked={isManualMode} 
              onCheckedChange={handleModeToggle}
              className="data-[state=checked]:bg-status-warm"
            />
            <Hand className={cn('h-3 w-3', isManualMode && 'text-status-warm')} />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isManualMode ? 'MANUAL' : 'AUTO'}
          </span>
        </div>
      </div>

      {currentNBA ? (
        <div className="rounded-md border border-primary/50 bg-primary/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentNBA.isLocked ? (
                <Lock className="h-4 w-4 text-status-warm" />
              ) : (
                <Unlock className="h-4 w-4 text-status-active" />
              )}
              <span className="font-mono text-sm font-bold text-foreground">{currentNBA.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">SCORE:</span>
              <span className="font-mono text-sm font-bold text-primary">{currentNBA.score}</span>
            </div>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{currentNBA.description}</p>
          <div className="mt-2">
            <Progress value={(currentNBA.score / 100) * 100} className="h-2" />
          </div>
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-border">
          <span className="font-mono text-xs text-muted-foreground">NO ACTIVE NBA</span>
        </div>
      )}

      {rankedQueue.length > 0 && (
        <div className="space-y-1">
          <span className="font-mono text-xs text-muted-foreground">QUEUE ({rankedQueue.length})</span>
          <div className="space-y-1">
            {rankedQueue.slice(0, 3).map((nba, index) => (
              <button
                key={nba.id}
                onClick={() => handleManualSelect(nba.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors',
                  currentNBA?.id === nba.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
                  <span className="font-mono text-xs text-foreground">{nba.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{nba.staleDays.toFixed(1)}d</span>
                  <span className="font-mono text-xs font-bold text-primary">{nba.score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
