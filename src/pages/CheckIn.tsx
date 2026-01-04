// Refactored CheckIn page for v1.1 - Period-based with habits catalog
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useV11Initialization, useHabitsByPeriod, usePeriodEntries, usePeriodStatus } from '@/hooks/usePeriods';
import { useComputeScore } from '@/hooks/useScoring';
import { getTodayKey } from '@/lib/periods';
import HabitInput from '@/components/HabitInput';
import type { Domain } from '@/lib/types';

const DOMAINS: { id: Domain; title: string; color: string }[] = [
  { id: 'physical', title: 'Fisik', color: 'text-blue-400' },
  { id: 'appearance', title: 'Penampilan', color: 'text-indigo-400' },
  { id: 'finance', title: 'Finansial', color: 'text-emerald-400' },
  { id: 'discipline', title: 'Disiplin', color: 'text-amber-400' },
  { id: 'emotion', title: 'Emosi', color: 'text-rose-400' },
];

export default function CheckIn() {
  const [currentDomain, setCurrentDomain] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { showToast } = useToast();
  const today = getTodayKey();

  // Initialize v1.1 if needed
  const { initialized, loading: initLoading } = useV11Initialization();

  // Get daily habits
  const { data: habits = [], isLoading: habitsLoading } = useHabitsByPeriod('daily');

  // Get existing entries for today
  const { entries, saveEntry, completePeriod, isSaving, isCompleting } = usePeriodEntries(today);

  // Check if today is already completed
  const { data: isCompleted } = usePeriodStatus(today);

  // Scoring
  const { mutateAsync: computeScore } = useComputeScore();

  // Load existing entries into form
  useEffect(() => {
    if (entries && Object.keys(entries).length > 0) {
      const data: Record<string, any> = {};
      Object.values(entries).forEach(entry => {
        data[entry.habitId] = entry.value;
      });
      setFormData(data);
    }
  }, [entries]);

  // Group habits by domain
  const habitsByDomain = habits.reduce((acc, habit) => {
    const domain = habit.domain || (habit.category?.toLowerCase() as Domain);
    if (!domain) return acc;
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(habit);
    return acc;
  }, {} as Record<Domain, typeof habits>);

  const currentDomainId = DOMAINS[currentDomain].id;
  const currentHabits = habitsByDomain[currentDomainId] || [];

  const handleNext = () => {
    if (currentDomain < DOMAINS.length - 1) {
      setCurrentDomain(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentDomain > 0) {
      setCurrentDomain(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Save all entries
      for (const [habitId, value] of Object.entries(formData)) {
        await saveEntry({ habitId, value });
      }

      // Compute and save score
      await computeScore({ periodKey: today, entries });

      // Mark period as completed
      await completePeriod();

      showToast('success', 'Daily check-in completed! 🎉');
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
      console.error('[CheckIn] Submit error:', error);
      showToast('error', error.message || 'Failed to save check-in');
    }
  };

  if (initLoading || habitsLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-white/50">Setting up your habits...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        <div className="glass-card p-12 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
          <h2 className="text-2xl font-bold">Already Completed</h2>
          <p className="text-white/50">
            You've already completed your daily check-in for {format(new Date(), 'MMMM dd, yyyy')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Daily Check-in</h1>
        <p className="text-white/50">Log your progress for {format(new Date(), 'MMMM dd, yyyy')}</p>
      </header>

      {/* Progress indicator */}
      <div className="flex justify-between items-center px-2">
        {DOMAINS.map((domain, idx) => (
          <div
            key={domain.id}
            className={cn(
              "h-1.5 flex-1 mx-1 rounded-full transition-all duration-300",
              idx <= currentDomain ? "bg-white" : "bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Habit inputs */}
      <div className="glass-card p-8 min-h-[400px] flex flex-col">
        <div className="flex items-center space-x-4 mb-8">
          <div className={cn("p-3 rounded-xl bg-white/5", DOMAINS[currentDomain].color)}>
            <div className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">{DOMAINS[currentDomain].title}</h2>
        </div>

        <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {currentHabits.length === 0 ? (
            <p className="text-white/40 text-center py-12">No habits configured for this domain</p>
          ) : (
            currentHabits.map(habit => (
              <HabitInput
                key={habit.id}
                habit={habit}
                value={formData[habit.id]}
                onChange={(value) => setFormData(prev => ({ ...prev, [habit.id]: value }))}
                disabled={isSaving || isCompleting}
              />
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          {currentDomain > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSaving || isCompleting}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
          )}

          {currentDomain < DOMAINS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSaving || isCompleting}
              className="flex-[2] bg-white text-black font-semibold py-4 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Continue</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isCompleting}
              className="flex-[2] bg-white text-black font-semibold py-4 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCompleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Complete Check-in</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
