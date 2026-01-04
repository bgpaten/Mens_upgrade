// Deprecated hook - use Supabase queries directly
import { useQuery } from '@tanstack/react-query';

export function useScores() {
  return useQuery({
    queryKey: ['scores'],
    queryFn: async () => {
      // Deprecated - return empty for now
      return [];
    }
  });
}

export function useLatestScore() {
  return useQuery({
    queryKey: ['latest-score'],
    queryFn: async () => {
      return { totalScore: 0 };
    }
  });
}

export function useScoreTrends() {
  return useQuery({
    queryKey: ['score-trends'],
    queryFn: async () => {
      return [];
    }
  });
}
