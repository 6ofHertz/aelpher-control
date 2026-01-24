import { useState } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  FileText, 
  Target,
  Zap,
  Brain,
  Calendar,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types/database';

interface QuickActionsProps {
  topics: Topic[];
  onLogActivity: (data: {
    action: string;
    details?: string;
    armType: 'ibm' | 'cs';
    durationMinutes?: number;
  }) => Promise<void>;
  onQuickComplete: () => void;
}

export function QuickActions({ topics, onLogActivity, onQuickComplete }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState('');
  const [details, setDetails] = useState('');
  const [armType, setArmType] = useState<'ibm' | 'cs'>('ibm');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onLogActivity({
        action: action.trim(),
        details: details.trim() || undefined,
        armType,
        durationMinutes: duration ? parseInt(duration) : undefined,
      });
      setAction('');
      setDetails('');
      setDuration('');
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogOptions = [
    { label: 'Study Session', icon: Brain, duration: 30 },
    { label: 'Practice Problem', icon: Target, duration: 15 },
    { label: 'Video Lesson', icon: Timer, duration: 20 },
    { label: 'Reading', icon: FileText, duration: 25 },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Quick Log Presets */}
      <div className="hidden sm:flex items-center gap-2">
        {quickLogOptions.map((option) => (
          <Button
            key={option.label}
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 font-mono text-xs transition-all hover:scale-105',
              'border-dashed hover:border-solid hover:border-primary hover:bg-primary/5'
            )}
            onClick={() => {
              onLogActivity({
                action: option.label,
                armType: 'ibm',
                durationMinutes: option.duration,
              });
            }}
          >
            <option.icon className="h-3.5 w-3.5" />
            {option.label}
          </Button>
        ))}
      </div>

      {/* Custom Log Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className={cn(
              'gap-2 font-mono shadow-lg transition-all hover:scale-105',
              'bg-gradient-to-r from-primary to-accent-foreground hover:from-primary/90 hover:to-accent-foreground/90'
            )}
          >
            <Plus className="h-4 w-4" />
            Log Activity
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg">Log Activity</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Record what you've been working on
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="action" className="font-mono text-xs">Activity</Label>
              <Input
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What did you work on?"
                className="font-mono"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="arm" className="font-mono text-xs">Track</Label>
                <Select value={armType} onValueChange={(v) => setArmType(v as 'ibm' | 'cs')}>
                  <SelectTrigger className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ibm" className="font-mono">IBM</SelectItem>
                    <SelectItem value="cs" className="font-mono">CS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration" className="font-mono text-xs">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="details" className="font-mono text-xs">Details (optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Any notes or reflections..."
                className="font-mono min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="font-mono"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!action.trim() || isSubmitting}
              className="gap-2 font-mono"
            >
              <CheckCircle className="h-4 w-4" />
              {isSubmitting ? 'Logging...' : 'Log Activity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Current NBA */}
      <Button 
        variant="outline"
        size="sm"
        className="gap-2 font-mono text-xs border-status-active/50 text-status-active hover:bg-status-active/10 hover:border-status-active"
        onClick={onQuickComplete}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Complete NBA
      </Button>
    </div>
  );
}
