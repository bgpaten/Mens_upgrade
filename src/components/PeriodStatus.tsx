// Period status component - shows completion status for periods
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPeriodLabel } from '@/lib/periods';

interface PeriodStatusProps {
  periodKey: string;
  completed: boolean;
  eligible: boolean;
  onTrigger?: () => void;
}

export default function PeriodStatus({ periodKey, completed, eligible, onTrigger }: PeriodStatusProps) {
  const label = getPeriodLabel(periodKey);

  if (completed) {
    return (
      <div className="glass-card p-6 border-green-500/20">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <div>
            <h3 className="font-bold text-green-400">Completed</h3>
            <p className="text-sm text-white/50">{label}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="glass-card p-6 border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-white/20" />
            <div>
              <h3 className="font-bold text-white/40">Not Yet Available</h3>
              <p className="text-sm text-white/30">{label}</p>
            </div>
          </div>
          {onTrigger && (
            <button
              onClick={onTrigger}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
            >
              Unlock Early
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-amber-500/20">
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
        <div>
          <h3 className="font-bold text-amber-400">Ready to Complete</h3>
          <p className="text-sm text-white/50">{label}</p>
        </div>
      </div>
    </div>
  );
}
