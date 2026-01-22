import { ReactNode } from 'react';
import { 
  Cloud, 
  Terminal, 
  Award, 
  BookOpen, 
  GraduationCap,
  Briefcase,
  Code,
  Database,
  Cpu,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types/database';

interface CategoryCardProps {
  topic: Topic;
  completedCount: number;
  totalCount: number;
  onClick?: () => void;
}

// Icon mapping based on topic titles
const iconMap: Record<string, LucideIcon> = {
  'red hat': Terminal,
  'percipio': Cloud,
  'coursera': BookOpen,
  'ibm': Briefcase,
  'certification': Award,
  'algorithms': Code,
  'database': Database,
  'operating': Cpu,
  'default_ibm': Briefcase,
  'default_cs': GraduationCap,
};

// Color themes for categories
const colorThemes = {
  ibm: [
    { bg: 'from-primary/20 to-primary/5', border: 'border-primary/30', icon: 'text-primary', ring: 'ring-primary/20' },
    { bg: 'from-chart-1/20 to-chart-1/5', border: 'border-chart-1/30', icon: 'text-chart-1', ring: 'ring-chart-1/20' },
    { bg: 'from-chart-2/20 to-chart-2/5', border: 'border-chart-2/30', icon: 'text-chart-2', ring: 'ring-chart-2/20' },
    { bg: 'from-chart-4/20 to-chart-4/5', border: 'border-chart-4/30', icon: 'text-chart-4', ring: 'ring-chart-4/20' },
  ],
  cs: [
    { bg: 'from-accent-foreground/20 to-accent-foreground/5', border: 'border-accent-foreground/30', icon: 'text-accent-foreground', ring: 'ring-accent-foreground/20' },
    { bg: 'from-chart-3/20 to-chart-3/5', border: 'border-chart-3/30', icon: 'text-chart-3', ring: 'ring-chart-3/20' },
    { bg: 'from-chart-2/20 to-chart-2/5', border: 'border-chart-2/30', icon: 'text-chart-2', ring: 'ring-chart-2/20' },
    { bg: 'from-chart-1/20 to-chart-1/5', border: 'border-chart-1/30', icon: 'text-chart-1', ring: 'ring-chart-1/20' },
  ],
};

function getIconForTopic(topic: Topic): LucideIcon {
  const titleLower = topic.title.toLowerCase();
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (titleLower.includes(key)) {
      return icon;
    }
  }
  
  return topic.arm_type === 'ibm' ? iconMap.default_ibm : iconMap.default_cs;
}

export function CategoryCard({ topic, completedCount, totalCount, onClick }: CategoryCardProps) {
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const Icon = getIconForTopic(topic);
  
  // Get color theme based on arm type and hash of title for variety
  const themes = colorThemes[topic.arm_type];
  const themeIndex = topic.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % themes.length;
  const theme = themes[themeIndex];
  
  // Achievement badge
  const showBadge = progress >= 50;
  const badgeType = progress >= 100 ? 'gold' : progress >= 75 ? 'silver' : 'bronze';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-300',
        'bg-gradient-to-br shadow-sm hover:shadow-lg',
        'hover:scale-[1.02] hover:ring-2 active:scale-[0.98]',
        theme.bg,
        theme.border,
        theme.ring
      )}
    >
      {/* Achievement Badge */}
      {showBadge && (
        <div className={cn(
          'absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-lg',
          badgeType === 'gold' && 'bg-status-warm text-background',
          badgeType === 'silver' && 'bg-muted-foreground text-background',
          badgeType === 'bronze' && 'bg-status-warm/60 text-background'
        )}>
          <Award className="h-3.5 w-3.5" />
        </div>
      )}
      
      {/* Icon */}
      <div className={cn(
        'flex h-12 w-12 items-center justify-center rounded-xl',
        'bg-card/80 backdrop-blur-sm shadow-inner',
        'transition-transform duration-300 group-hover:scale-110'
      )}>
        <Icon className={cn('h-6 w-6', theme.icon)} />
      </div>
      
      {/* Title */}
      <h3 className="mt-4 font-mono text-sm font-bold text-foreground line-clamp-1">
        {topic.title}
      </h3>
      
      {/* Progress Ring */}
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-10 w-10">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="hsl(var(--muted) / 0.3)"
              strokeWidth="4"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 1.0053} 100.53`}
              className={cn('transition-all duration-500', theme.icon)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-foreground">
            {progress}%
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="font-mono text-xs text-muted-foreground">This week</span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className={cn(
        'pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        'bg-gradient-to-t from-transparent via-transparent to-card/50'
      )} />
    </button>
  );
}
