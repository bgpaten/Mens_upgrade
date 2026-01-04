// Streak card component for gamification v1.1
import { Flame, Zap, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCardProps {
  type: 'workout' | 'deepwork' | 'noContact';
  count: number;
  label: string;
}

const STREAK_CONFIG = {
  workout: {
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20'
  },
  deepwork: {
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20'
  },
  noContact: {
    icon: Heart,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20'
  }
};

export default function StreakCard({ type, count, label }: StreakCardProps) {
  const config = STREAK_CONFIG[type];
  const Icon = config.icon;

  const isActive = count > 0;
  const isMilestone = count >= 7 || count >= 30 || count >= 100;

  return (
    <div
      className={cn(
        'glass-card p-6 border transition-all duration-300',
        config.borderColor,
        isActive && 'hover:scale-105',
        isMilestone && 'ring-2 ring-white/20'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-xl', config.bgColor)}>
          <Icon className={cn('w-6 h-6', config.color)} />
        </div>
        {isMilestone && (
          <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
            🏆 Milestone
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className={cn('text-4xl font-bold', config.color)}>
            {count}
          </span>
          <span className="text-white/40 text-sm">days</span>
        </div>
        <p className="text-sm text-white/60">{label}</p>
      </div>

      <div className="mt-4 flex gap-1">
        {[7, 30, 100].map(milestone => (
          <div
            key={milestone}
            className={cn(
              'flex-1 h-1 rounded-full transition-all',
              count >= milestone ? config.bgColor : 'bg-white/5'
            )}
          />
        ))}
      </div>
    </div>
  );
}
