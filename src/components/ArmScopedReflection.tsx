import { useState } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Reflection, ArmType } from '@/types';
import { formatMilitaryTime } from '@/lib/state-machine';
import { cn } from '@/lib/utils';

interface ArmScopedReflectionProps {
  armType: ArmType;
  reflections: Reflection[];
  onAddReflection: (evidence: string, context: string) => void;
}

export function ArmScopedReflection({ armType, reflections, onAddReflection }: ArmScopedReflectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [context, setContext] = useState('');

  const armReflections = reflections.filter(r => r.armType === armType);

  const handleSubmit = () => {
    if (!evidence.trim()) return;
    onAddReflection(evidence.trim(), context.trim());
    setEvidence('');
    setContext('');
    setIsAdding(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs font-medium text-foreground">
              REFLECTIONS ({armReflections.length})
            </span>
            <span className="font-mono text-xs text-muted-foreground">(Evidence Only — No Scoring Impact)</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border p-3">
            {isAdding ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block font-mono text-xs text-muted-foreground">EVIDENCE</label>
                  <Textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Document objective evidence..."
                    className="h-16 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-muted-foreground">CONTEXT (optional)</label>
                  <Textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Additional context..."
                    className="h-12 font-mono text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit} 
                    size="sm" 
                    className="font-mono text-xs"
                    disabled={!evidence.trim()}
                  >
                    SAVE
                  </Button>
                  <Button 
                    onClick={() => setIsAdding(false)} 
                    variant="outline" 
                    size="sm" 
                    className="font-mono text-xs"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setIsAdding(true)} 
                variant="outline" 
                size="sm" 
                className="mb-3 w-full gap-1 font-mono text-xs"
              >
                <Plus className="h-3 w-3" />
                ADD REFLECTION
              </Button>
            )}

            {armReflections.length > 0 ? (
              <div className="space-y-2">
                {armReflections.slice(0, 5).map((reflection) => (
                  <div 
                    key={reflection.id} 
                    className="rounded-md border border-border bg-muted/20 p-2"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatMilitaryTime(reflection.timestamp)}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-foreground">{reflection.evidence}</p>
                    {reflection.context && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground italic">
                        {reflection.context}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !isAdding && (
                <div className="flex h-12 items-center justify-center text-center">
                  <span className="font-mono text-xs text-muted-foreground">NO REFLECTIONS RECORDED</span>
                </div>
              )
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
