import { Activity, Zap, AlertTriangle, Clock } from 'lucide-react';
import type { GlobalMetrics, TheaterState } from '@/types';
import { formatMilitaryTime } from '@/lib/state-machine';
import { cn } from '@/lib/utils';

interface StrategicAwarenessHeaderProps {
  globalMetrics: GlobalMetrics;
  ibm: TheaterState;
  cs: TheaterState;
}

function MetricCard({ 
  label, 
  value, 
  unit = '', 
  icon: Icon, 
  variant = 'default' 
}: { 
  label: string; 
  value: number | string; 
  unit?: string; 
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantClasses = {
    default: 'text-foreground',
    success: 'text-status-active',
    warning: 'text-status-warm',
    danger: 'text-status-blocked',
  };

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn('font-mono text-xl font-bold', variantClasses[variant])}>
        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
      </span>
    </div>
  );
}

function OverloadMeter({ risk }: { risk: number }) {
  const getOverloadColor = (risk: number) => {
    if (risk < 30) return 'bg-status-active';
    if (risk < 60) return 'bg-status-warm';
    return 'bg-status-blocked';
  };

  const getOverloadVariant = (risk: number): 'success' | 'warning' | 'danger' => {
    if (risk < 30) return 'success';
    if (risk < 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Overload Risk</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-muted/30">
        <div 
          className={cn('h-full transition-all duration-500', getOverloadColor(risk))}
          style={{ width: `${risk}%` }}
        />
      </div>
      <span className={cn(
        'font-mono text-lg font-bold text-center',
        getOverloadVariant(risk) === 'success' && 'text-status-active',
        getOverloadVariant(risk) === 'warning' && 'text-status-warm',
        getOverloadVariant(risk) === 'danger' && 'text-status-blocked'
      )}>
        {risk.toFixed(1)}%
      </span>
    </div>
  );
}

function EnergyAllocationBar({ ibm, cs }: { ibm: number; cs: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase text-muted-foreground">IBM: {ibm}%</span>
        <Zap className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-xs uppercase text-muted-foreground">CS: {cs}%</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
        <div 
          className="bg-primary transition-all duration-300"
          style={{ width: `${ibm}%` }}
        />
        <div 
          className="bg-accent-foreground transition-all duration-300"
          style={{ width: `${cs}%` }}
        />
      </div>
    </div>
  );
}

export function StrategicAwarenessHeader({ globalMetrics, ibm, cs }: StrategicAwarenessHeaderProps) {
  const combinedProgress = (ibm.totalProgress + cs.totalProgress) / 2;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
              AELPHER 2.0
            </h1>
            <p className="font-mono text-xs text-muted-foreground">STRATEGIC AWARENESS PANEL</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>LAST SYNC: {formatMilitaryTime(globalMetrics.lastSyncTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <MetricCard 
          label="Combined Progress" 
          value={combinedProgress} 
          unit="%" 
          icon={Activity}
          variant={combinedProgress > 70 ? 'success' : combinedProgress > 40 ? 'warning' : 'danger'}
        />
        <MetricCard 
          label="IBM Progress" 
          value={ibm.totalProgress} 
          unit="%" 
          icon={Activity}
        />
        <MetricCard 
          label="CS Progress" 
          value={cs.totalProgress} 
          unit="%" 
          icon={Activity}
        />
        <div className="rounded-lg border border-border bg-card p-3">
          <EnergyAllocationBar 
            ibm={globalMetrics.energyAllocationIBM} 
            cs={globalMetrics.energyAllocationCS} 
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <OverloadMeter risk={globalMetrics.overloadRisk} />
        </div>
      </div>
    </div>
  );
}
