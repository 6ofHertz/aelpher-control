import { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Send, History, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const FEYNMAN_PROMPTS = [
  "Explain how a CPU processes instructions to a 10-year-old.",
  "Describe what happens when you type a URL and press Enter.",
  "What is recursion? Explain without using the word 'recursion'.",
  "How does encryption keep your data safe?",
  "Explain the difference between a process and a thread.",
  "What is a database index and why does it make things faster?",
  "How does a neural network learn?",
  "Explain memory management in simple terms.",
  "What happens during a handshake in HTTPS?",
  "How do computers represent negative numbers?",
  "Explain what a REST API is to a chef.",
  "What is the difference between TCP and UDP?",
  "How does garbage collection work?",
  "Explain containerization using a shipping analogy.",
  "What is Big O notation really measuring?",
];

interface SavedExplanation {
  id: string;
  prompt: string;
  explanation: string;
  createdAt: string;
}

export function FeynmanCard() {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [history, setHistory] = useState<SavedExplanation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('feynman-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    // Set initial random prompt
    const todaySeed = new Date().toDateString();
    const index = todaySeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % FEYNMAN_PROMPTS.length;
    setCurrentPrompt(FEYNMAN_PROMPTS[index]);
  }, []);
  
  const handleNewPrompt = () => {
    const currentIndex = FEYNMAN_PROMPTS.indexOf(currentPrompt);
    const nextIndex = (currentIndex + 1) % FEYNMAN_PROMPTS.length;
    setCurrentPrompt(FEYNMAN_PROMPTS[nextIndex]);
    setExplanation('');
    setShowInput(false);
  };
  
  const handleSave = () => {
    if (!explanation.trim()) return;
    
    const newEntry: SavedExplanation = {
      id: crypto.randomUUID(),
      prompt: currentPrompt,
      explanation: explanation.trim(),
      createdAt: new Date().toISOString(),
    };
    
    const newHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('feynman-history', JSON.stringify(newHistory));
    
    // Reset and get new prompt
    handleNewPrompt();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-warm/20">
            <Lightbulb className="h-4 w-4 text-status-warm" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">FEYNMAN TECHNIQUE</h3>
            <p className="font-mono text-[10px] text-muted-foreground">Daily learning reinforcement</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <History className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="font-mono max-w-lg">
              <DialogHeader>
                <DialogTitle>Explanation History</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[400px]">
                {history.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No explanations saved yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div key={entry.id} className="rounded-lg border border-border p-3">
                        <p className="font-semibold text-sm text-foreground">{entry.prompt}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{entry.explanation}</p>
                        <p className="mt-2 text-[10px] text-muted-foreground/60">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleNewPrompt}
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Quote-style prompt */}
        <div className="relative pl-4 border-l-4 border-status-warm/50">
          <p className="font-serif text-lg italic text-foreground leading-relaxed">
            "{currentPrompt}"
          </p>
        </div>
        
        {/* Expandable input area */}
        {!showInput ? (
          <Button 
            variant="outline"
            className="mt-4 w-full gap-2 font-mono"
            onClick={() => setShowInput(true)}
          >
            <Send className="h-4 w-4" />
            EXPLAIN NOW
            <ChevronDown className="h-4 w-4 ml-auto" />
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain it in your own words..."
              className="min-h-[100px] font-mono text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 font-mono"
                onClick={() => setShowInput(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 gap-2 font-mono"
                onClick={handleSave}
                disabled={!explanation.trim()}
              >
                <Send className="h-4 w-4" />
                Save & Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
