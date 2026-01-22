import { cn } from '@/lib/utils';

interface EnhancedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  variant?: 'default' | 'ibm' | 'cs' | 'gradient';
  showGlow?: boolean;
}

export function EnhancedProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  variant = 'default',
  showGlow = true,
}: EnhancedProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  const gradientId = `progress-gradient-${variant}-${size}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow effect */}
      {showGlow && progress > 0 && (
        <div 
          className="absolute inset-0 blur-xl opacity-40 transition-opacity duration-500"
          style={{
            background: variant === 'ibm' 
              ? 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)'
              : variant === 'cs'
              ? 'radial-gradient(circle, hsl(var(--accent-foreground)) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            transform: 'scale(0.8)',
          }}
        />
      )}
      
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {variant === 'gradient' || variant === 'default' ? (
              <>
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent-foreground))" />
              </>
            ) : variant === 'ibm' ? (
              <>
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="hsl(var(--accent-foreground))" />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" />
              </>
            )}
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress circle */}
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn(
          'font-mono font-bold transition-all duration-300',
          size >= 100 ? 'text-3xl' : size >= 80 ? 'text-2xl' : 'text-xl',
          variant === 'ibm' && 'text-primary',
          variant === 'cs' && 'text-accent-foreground',
          (variant === 'default' || variant === 'gradient') && 'text-foreground'
        )}>
          {progress}%
        </span>
        {label && (
          <span className="font-mono text-xs uppercase text-muted-foreground">{label}</span>
        )}
        {sublabel && (
          <span className="font-mono text-[10px] text-muted-foreground/70">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
