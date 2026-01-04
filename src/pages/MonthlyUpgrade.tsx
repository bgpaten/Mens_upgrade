// Monthly Upgrade page - for monthly habits
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useV11Initialization, useHabitsByPeriod, usePeriodEntries, usePeriodStatus, useCurrentPeriods } from '@/hooks/usePeriods';
import HabitInput from '@/components/HabitInput';
import PeriodStatus from '@/components/PeriodStatus';
import type { Domain } from '@/lib/types';

const DOMAINS: { id: Domain; title: string; color: string }[] = [
  { id: 'physical', title: 'Fisik', color: 'text-blue-400' },
  { id: 'appearance', title: 'Penampilan', color: 'text-indigo-400' },
  { id: 'finance', title: 'Finansial', color: 'text-emerald-400' },
  { id: 'discipline', title: 'Disiplin', color: 'text-amber-400' },
  { id: 'emotion', title: 'Emosi', color: 'text-rose-400' },
];

export default function MonthlyUpgrade() {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { loading: initLoading } = useV11Initialization();
  const { periods, triggerMonthly } = useCurrentPeriods();
  const monthPeriod = periods.monthly;

  const { data: habits = [], isLoading: habitsLoading } = useHabitsByPeriod('monthly');
  const { entries, saveEntry, completePeriod, isSaving, isCompleting } = usePeriodEntries(monthPeriod.key);
  const { data: isCompleted } = usePeriodStatus(monthPeriod.key);

  useEffect(() => {
    if (entries && Object.keys(entries).length > 0) {
      const data: Record<string, any> = {};
      Object.values(entries).forEach(entry => {
        data[entry.habitId] = entry.value;
      });
      setFormData(data);
    }
  }, [entries]);

  const habitsByDomain = habits.reduce((acc, habit) => {
    const domain = habit.domain || (habit.category?.toLowerCase() as Domain);
    if (!domain) return acc;
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(habit);
    return acc;
  }, {} as Record<Domain, typeof habits>);

  const handleSubmit = async () => {
    try {
      for (const [habitId, value] of Object.entries(formData)) {
        await saveEntry({ habitId, value });
      }

      await completePeriod();

      showToast('success', 'Monthly upgrade completed! 🚀');
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
      console.error('[MonthlyUpgrade] Submit error:', error);
      showToast('error', error.message || 'Failed to save monthly upgrade');
    }
  };

  if (initLoading || habitsLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  const monthLabel = format(new Date(), 'MMMM yyyy');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-bold tracking-tight">Monthly Upgrade</h1>
        </div>
        <p className="text-white/50">{monthLabel}</p>
      </header>

      <PeriodStatus
        periodKey={monthPeriod.key}
        completed={isCompleted || false}
        eligible={monthPeriod.eligible}
        onTrigger={triggerMonthly}
      />

      {(monthPeriod.eligible || isCompleted) && (
        <div className="space-y-8">
          {DOMAINS.map(domain => {
            const domainHabits = habitsByDomain[domain.id] || [];
            if (domainHabits.length === 0) return null;

            return (
              <div key={domain.id} className="glass-card p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={cn("p-3 rounded-xl bg-white/5", domain.color)}>
                    <div className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">{domain.title}</h2>
                </div>

                <div className="space-y-6">
                  {domainHabits.map(habit => (
                    <HabitInput
                      key={habit.id}
                      habit={habit}
                      value={formData[habit.id]}
                      onChange={(value) => setFormData(prev => ({ ...prev, [habit.id]: value }))}
                      disabled={isSaving || isCompleting || isCompleted}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {!isCompleted && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isCompleting}
              className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCompleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Complete Monthly Upgrade</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
