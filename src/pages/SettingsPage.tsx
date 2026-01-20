import { Settings as SettingsIcon, Database, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleClearLocalStorage = () => {
    localStorage.removeItem('aelpher-2.0-state');
    toast({
      title: 'Cache Cleared',
      description: 'Local storage has been cleared. Refresh to see changes.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-mono text-2xl font-bold text-foreground">SETTINGS</h1>
          <p className="font-mono text-sm text-muted-foreground">
            System configuration & maintenance
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-sm">
              <Database className="h-4 w-4" />
              DATABASE CONNECTION
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Supabase project information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                <span className="font-mono text-xs text-muted-foreground">PROJECT ID</span>
                <code className="font-mono text-xs text-foreground">rdrdhpwhuisuhsjvwswt</code>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                <span className="font-mono text-xs text-muted-foreground">STATUS</span>
                <span className="rounded bg-status-active/10 px-2 py-0.5 font-mono text-xs text-status-active">
                  CONNECTED
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-sm">
              <RefreshCw className="h-4 w-4" />
              CACHE MANAGEMENT
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Clear local storage and cached data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 font-mono text-xs"
              onClick={handleClearLocalStorage}
            >
              <Trash2 className="h-3 w-3" />
              CLEAR LOCAL CACHE
            </Button>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">SYSTEM INFO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                <span className="font-mono text-xs text-muted-foreground">VERSION</span>
                <code className="font-mono text-xs text-foreground">AELPHER 2.0</code>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                <span className="font-mono text-xs text-muted-foreground">ARCHITECTURE</span>
                <code className="font-mono text-xs text-foreground">DUAL-THEATER</code>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-2">
                <span className="font-mono text-xs text-muted-foreground">PERSISTENCE</span>
                <code className="font-mono text-xs text-foreground">SUPABASE (CLOUD)</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
