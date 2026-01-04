import { getDay, parseISO } from 'date-fns';
import type { GoalItem, DailyLogV2, DailyReport } from '@/lib/types';

export interface AnalyticsSummary {
  avgScore: number;
  bestDay: { date: string; score: number } | null;
  worstDay: { date: string; score: number } | null;
  completionRate: number;
  hardFailCount: number;
  hardFailBreakdown: Record<string, number>;
  longestStreak: number;
  noHardFailStreak: number;
}

export interface DayPattern {
  dayName: string;
  avgScore: number;
  frequency: number;
}

export interface HabitImpact {
  goalId: string;
  title: string;
  impactScore: number; // Positive = help score, Negative = missing on bad days
  correlation: 'positive' | 'negative';
}

export interface FailureAnalysis {
  topFailedGoals: { goalId: string; title: string; count: number }[];
  topRootCauses: { cause: string; count: number }[];
}

export interface Recommendation {
  type: 'focus' | 'improve' | 'ignore';
  habitTitle: string;
  reason: string;
}

export type AnalyticsResult = {
  summary: AnalyticsSummary;
  patterns: DayPattern[];
  habitImpacts: {
    topPositive: HabitImpact[];
    topNegative: HabitImpact[];
  };
  failures: FailureAnalysis;
  recommendations: Recommendation[];
}

/**
 * analyzePatterns
 * Core logic to extract meaningful insights from logs and reports
 */
export function analyzePatterns(
  logs: DailyLogV2[],
  reports: DailyReport[],
  goals: GoalItem[]
): AnalyticsResult {
  const summary = calculateSummary(logs, reports);
  const patterns = calculateDayPatterns(logs);
  const habitImpacts = calculateHabitImpacts(logs, goals);
  const failures = calculateFailureAnalysis(logs, reports, goals);
  const recommendations = generateRecommendations(habitImpacts, failures);

  return {
    summary,
    patterns,
    habitImpacts,
    failures,
    recommendations,
  };
}

// --- HELPER FUNCTIONS ---

function calculateSummary(logs: DailyLogV2[], reports: DailyReport[]): AnalyticsSummary {
  if (logs.length === 0) {
    return {
      avgScore: 0,
      bestDay: null,
      worstDay: null,
      completionRate: 0,
      hardFailCount: 0,
      hardFailBreakdown: {},
      longestStreak: 0,
      noHardFailStreak: 0,
    };
  }

  const scores = logs.map(l => l.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / logs.length);

  const sortedLogs = [...logs].sort((a, b) => b.score - a.score);
  const bestDay = { date: sortedLogs[0].date, score: sortedLogs[0].score };
  const worstDay = { date: sortedLogs[sortedLogs.length - 1].date, score: sortedLogs[sortedLogs.length - 1].score };

  const hardFails = logs.filter(l => l.breachedHardFail);
  const hardFailBreakdown: Record<string, number> = {};
  hardFails.forEach(l => {
    const reason = l.failReason || 'Unknown';
    hardFailBreakdown[reason] = (hardFailBreakdown[reason] || 0) + 1;
  });

  // Calculate streaks (simplified for this range)
  let longestStreak = 0;
  let currentStreak = 0;
  let currentNoHardFail = 0;
  let longestNoHardFail = 0;

  // Assuming logs are sorted by date
  logs.forEach(l => {
    if (l.score >= 80 && !l.breachedHardFail) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    if (!l.breachedHardFail) {
      currentNoHardFail++;
    } else {
      currentNoHardFail = 0;
    }
    if (currentNoHardFail > longestNoHardFail) longestNoHardFail = currentNoHardFail;
  });

  const totalPossible = reports.reduce((acc, r) => acc + r.completionStats.total, 0);
  const totalCompleted = reports.reduce((acc, r) => acc + r.completionStats.completed, 0);
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return {
    avgScore,
    bestDay,
    worstDay,
    completionRate,
    hardFailCount: hardFails.length,
    hardFailBreakdown,
    longestStreak,
    noHardFailStreak: longestNoHardFail,
  };
}

function calculateDayPatterns(logs: DailyLogV2[]): DayPattern[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats: Record<number, { totalScore: number; count: number }> = {};

  logs.forEach(l => {
    const day = getDay(parseISO(l.date));
    if (!dayStats[day]) dayStats[day] = { totalScore: 0, count: 0 };
    dayStats[day].totalScore += l.score;
    dayStats[day].count += 1;
  });

  return dayNames.map((name, index) => ({
    dayName: name,
    avgScore: dayStats[index] ? Math.round(dayStats[index].totalScore / dayStats[index].count) : 0,
    frequency: dayStats[index]?.count || 0,
  }));
}

function calculateHabitImpacts(logs: DailyLogV2[], goals: GoalItem[]) {
  const positiveImpacts: HabitImpact[] = [];
  const negativeImpacts: HabitImpact[] = [];

  // Logic: For each goal, see if completing it correlates with high scores
  // High score days = top 25% percentile
  // Low score days = bottom 25% percentile
  
  if (logs.length < 4) return { topPositive: [], topNegative: [] };

  const sortedByScore = [...logs].sort((a, b) => a.score - b.score);
  const lowThreshold = sortedByScore[Math.floor(logs.length * 0.25)].score;
  const highThreshold = sortedByScore[Math.floor(logs.length * 0.75)].score;

  goals.forEach(goal => {
    let completedOnHigh = 0;
    let totalHigh = 0;
    let missedOnLow = 0;
    let totalLow = 0;

    logs.forEach(l => {
      const entry = l.entries[goal.id];
      const isComplete = entry?.isComplete;

      if (l.score >= highThreshold) {
        totalHigh++;
        if (isComplete) completedOnHigh++;
      }
      if (l.score <= lowThreshold) {
        totalLow++;
        if (!isComplete) missedOnLow++;
      }
    });

    const highRate = totalHigh > 0 ? completedOnHigh / totalHigh : 0;
    const lowMissRate = totalLow > 0 ? missedOnLow / totalLow : 0;

    if (highRate > 0.6) {
      positiveImpacts.push({
        goalId: goal.id,
        title: goal.title,
        impactScore: Math.round(highRate * 100),
        correlation: 'positive'
      });
    }

    if (lowMissRate > 0.6) {
      negativeImpacts.push({
        goalId: goal.id,
        title: goal.title,
        impactScore: Math.round(lowMissRate * 100),
        correlation: 'negative'
      });
    }
  });

  return {
    topPositive: positiveImpacts.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3),
    topNegative: negativeImpacts.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3)
  };
}

function calculateFailureAnalysis(logs: DailyLogV2[], reports: DailyReport[], goals: GoalItem[]): FailureAnalysis {
  const goalFailures: Record<string, { title: string; count: number }> = {};
  const rootCauses: Record<string, number> = {};

  logs.forEach(l => {
    // Check missing goals in each log
    goals.forEach(g => {
        const entry = l.entries[g.id];
        // Only count if the goal was active that day (based on presence of entry or we can be smart)
        // For simplicity, if it's MISSING and in the daily range, it's a failure
        if (entry && !entry.isComplete) {
            if (!goalFailures[g.id]) goalFailures[g.id] = { title: g.title, count: 0 };
            goalFailures[g.id].count++;
        }
    });
  });

  reports.forEach(r => {
    if (r.rootCause) {
      rootCauses[r.rootCause] = (rootCauses[r.rootCause] || 0) + 1;
    }
  });

  return {
    topFailedGoals: Object.values(goalFailures).sort((a, b) => b.count - a.count).slice(0, 5).map(f => ({ goalId: '', ...f })),
    topRootCauses: Object.entries(rootCauses).map(([cause, count]) => ({ cause, count })).sort((a, b) => b.count - a.count).slice(0, 3)
  };
}

function generateRecommendations(
  impacts: { topPositive: HabitImpact[]; topNegative: HabitImpact[] },
  failures: FailureAnalysis
): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. Focus: Top positive impact
  if (impacts.topPositive.length > 0) {
    recs.push({
      type: 'focus',
      habitTitle: impacts.topPositive[0].title,
      reason: `Setiap kamu melakukan ini, kemungkinan harimu sukses (skor tinggi) meningkat drastis.`
    });
  }

  // 2. Improve: Top negative impact or top failed
  if (impacts.topNegative.length > 0) {
    recs.push({
      type: 'improve',
      habitTitle: impacts.topNegative[0].title,
      reason: `Kebiasaan ini sering absen di hari-hari terburukmu. Pastikan ini jadi prioritas besok.`
    });
  } else if (failures.topFailedGoals.length > 0) {
      recs.push({
          type: 'improve',
          habitTitle: failures.topFailedGoals[0].title,
          reason: `Ini adalah goal yang paling sering gagal (${failures.topFailedGoals[0].count}x). Coba perkecil targetnya.`
      });
  }

  // 3. Ignore: If something fails too much and isn't critical
  if (failures.topFailedGoals.length > 2) {
      const thirdWorst = failures.topFailedGoals[2];
      recs.push({
          type: 'ignore',
          habitTitle: thirdWorst.title,
          reason: `Terlalu sering gagal. Pertimbangkan untuk menghapus atau mengabaikan sementara agar tidak membebani mental.`
      });
  }

  return recs;
}
