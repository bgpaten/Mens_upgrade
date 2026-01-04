// Hook for computing and managing period scores
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getUserHabits } from '@/lib/supabase-v11';
import { computePeriodScore } from '@/lib/scoring';
import type { PeriodEntry } from '@/lib/types';

/**
 * Hook to compute and save period score
 */
export function useComputeScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ periodKey, entries }: { periodKey: string; entries: Record<string, PeriodEntry> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's habits
      const habits = await getUserHabits(user.id);

      // Compute score
      const score = await computePeriodScore(user.id, periodKey, entries, habits);

      // Save to Firestore (deprecated - no-op for now)
      console.warn('savePeriodScore is deprecated with Supabase migration');

      return score;
    },
    onSuccess: (score) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['periodScore', score.periodKey] });
      queryClient.invalidateQueries({ queryKey: ['latestScore'] });
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    }
  });
}
