// Hook for managing period-based tracking
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { GoalItem as _GoalItem, PeriodType } from '@/lib/types';
import {
  getUserGoals,
  getPeriodEntries,
  savePeriodEntry,
  isPeriodCompleted,
  markPeriodCompleted,
  hasCompletedV11Setup,
  initializeV11ForUser
} from '@/lib/supabase-v11';
import { getTodayKey, getWeekKey, getMonthKey, isPeriodEligible } from '@/lib/periods';

/**
 * Hook to initialize v1.1 for user (one-time setup)
 */
export function useV11Initialization() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndInitialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const setupDone = await hasCompletedV11Setup(user.id);
        
        if (!setupDone) {
          console.log('[v1.1] First time user, initializing...');
          await initializeV11ForUser(user.id);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('[v1.1] Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAndInitialize();
  }, []);

  return { initialized, loading };
}

/**
 * Hook to get user's habits catalog
 */
export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      return getUserGoals(user.id);
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Hook to get habits filtered by period type
 */
export function useHabitsByPeriod(periodType: PeriodType) {
  const { data: allHabits = [], ...rest } = useHabits();
  
  const habits = allHabits.filter(h => h.period === periodType || h.frequency === periodType);
  
  return { data: habits, ...rest };
}

/**
 * Hook to manage period entries
 */
export function usePeriodEntries(periodKey: string) {
  const queryClient = useQueryClient();

  const { data: entries = {}, ...queryRest } = useQuery({
    queryKey: ['periodEntries', periodKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};
      return getPeriodEntries(user.id, periodKey);
    },
    enabled: !!periodKey,
    staleTime: 1 * 60 * 1000
  });

  const saveMutation = useMutation({
    mutationFn: async ({ habitId, value }: { habitId: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await savePeriodEntry(user.id, periodKey, habitId, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodEntries', periodKey] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      await markPeriodCompleted(user.id, periodKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodStatus', periodKey] });
      queryClient.invalidateQueries({ queryKey: ['periodEntries', periodKey] });
    }
  });

  return {
    entries,
    saveEntry: saveMutation.mutate,
    completePeriod: completeMutation.mutate,
    isSaving: saveMutation.isPending,
    isCompleting: completeMutation.isPending,
    ...queryRest
  };
}

/**
 * Hook to check period completion status
 */
export function usePeriodStatus(periodKey: string) {
  return useQuery({
    queryKey: ['periodStatus', periodKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      return isPeriodCompleted(user.id, periodKey);
    },
    enabled: !!periodKey,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Hook to get current period keys and eligibility
 */
export function useCurrentPeriods() {
  const [manualTriggers, setManualTriggers] = useState({
    weekly: false,
    monthly: false
  });

  const today = getTodayKey();
  const week = getWeekKey();
  const month = getMonthKey();

  const dailyEligible = isPeriodEligible('daily');
  const weeklyEligible = isPeriodEligible('weekly', new Date(), manualTriggers.weekly);
  const monthlyEligible = isPeriodEligible('monthly', new Date(), manualTriggers.monthly);

  const triggerWeekly = () => setManualTriggers(prev => ({ ...prev, weekly: true }));
  const triggerMonthly = () => setManualTriggers(prev => ({ ...prev, monthly: true }));

  return {
    periods: {
      daily: { key: today, eligible: dailyEligible },
      weekly: { key: week, eligible: weeklyEligible },
      monthly: { key: month, eligible: monthlyEligible }
    },
    triggerWeekly,
    triggerMonthly
  };
}
