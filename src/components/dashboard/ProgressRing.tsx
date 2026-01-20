import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  variant?: 'default' | 'ibm' | 'cs';
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  variant = 'default',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClass = {
    default: 'text-primary',
    ibm: 'text-primary',
    cs: 'text-accent-foreground',
  }[variant];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          className="text-muted/30"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn('transition-all duration-500 ease-out', colorClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn('font-mono text-2xl font-bold', colorClass)}>
          {progress}%
        </span>
        {label && (
          <span className="font-mono text-xs text-muted-foreground">{label}</span>
        )}
        {sublabel && (
          <span className="font-mono text-[10px] text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
