import { Monitor } from 'lucide-react';

export function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-8 lg:hidden">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
          <Monitor className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-4 font-mono text-2xl font-bold tracking-tight text-foreground">
          DESKTOP REQUIRED
        </h1>
        <p className="mb-6 font-mono text-sm text-muted-foreground">
          AELPHER 2.0 is a precision instrument panel designed exclusively for desktop operation.
        </p>
        <div className="rounded-lg border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
          <p>MINIMUM VIEWPORT: 1024px</p>
          <p className="mt-1">CURRENT STATUS: BLOCKED</p>
        </div>
      </div>
    </div>
  );
}
