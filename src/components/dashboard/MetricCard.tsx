import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-status-active',
  warning: 'text-status-warm',
  danger: 'text-status-blocked',
};

export function MetricCard({ 
  label, 
  value, 
  unit, 
  icon, 
  variant = 'default',
  size = 'md' 
}: MetricCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn(
          'font-mono font-bold',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
          variantStyles[variant]
        )}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}
