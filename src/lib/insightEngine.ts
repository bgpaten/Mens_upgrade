/**
 * InsightEngine - Non-LLM Rule-Based Daily Review Insights
 * 
 * Analyzes daily entries and historical data to generate:
 * - Top Strengths (max 3)
 * - Top Gaps (max 3)
 * - Tomorrow Actions (max 3) with triggers and difficulty
 */

import type { GoalItem, DailyLogV2, DailyEntry } from './types';

// ===== TYPES =====

export interface InsightInput {
  todayLog: DailyLogV2;
  goals: GoalItem[];
  history: DailyLogV2[]; // Last 7 days (excluding today)
  rootCause?: string;
}

export interface TomorrowAction {
  action: string;
  reason: string;
  trigger: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InsightOutput {
  top_strengths: string[];
  top_gaps: string[];
  tomorrow_actions: TomorrowAction[];
}

// ===== HELPER FUNCTIONS =====

/**
 * Check if a specific goal was completed in an entry
 */
function isGoalCompleted(goalId: string, entries: Record<string, DailyEntry>): boolean {
  const entry = entries[goalId];
  return entry?.isComplete === true;
}

/**
 * Get numeric value of a goal entry
 */
function getNumericValue(goalId: string, entries: Record<string, DailyEntry>): number {
  const entry = entries[goalId];
  return typeof entry?.value === 'number' ? entry.value : 0;
}

/**
 * Calculate completion rate for a category over history
 */
function getCategoryCompletionRate(
  category: string,
  goals: GoalItem[],
  history: DailyLogV2[]
): number {
  const categoryGoals = goals.filter(g => g.category === category);
  if (categoryGoals.length === 0) return 100;

  let totalCompleted = 0;
  let totalPossible = 0;

  history.forEach(log => {
    categoryGoals.forEach(goal => {
      if (isGoalCompleted(goal.id, log.entries)) {
        totalCompleted++;
      }
      totalPossible++;
    });
  });

  return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 100;
}

/**
 * Check if category is weak for N consecutive days
 */
function isCategoryWeakConsecutive(
  category: string,
  goals: GoalItem[],
  history: DailyLogV2[],
  days: number
): boolean {
  if (history.length < days) return false;

  const recentHistory = history.slice(-days);
  
  return recentHistory.every(log => {
    const categoryGoals = goals.filter(g => g.category === category);
    const completed = categoryGoals.filter(g => isGoalCompleted(g.id, log.entries)).length;
    const total = categoryGoals.length;
    
    return total > 0 && (completed / total) < 0.5; // Less than 50% completion
  });
}

/**
 * Check if performance is poor for N consecutive days
 */
function isPoorPerformanceStreak(history: DailyLogV2[], days: number): boolean {
  if (history.length < days) return false;
  
  const recentHistory = history.slice(-days);
  return recentHistory.every(log => log.score < 60);
}

/**
 * Find goal by name pattern
 */
function findGoalByPattern(goals: GoalItem[], pattern: string): GoalItem | undefined {
  return goals.find(g => g.title.toLowerCase().includes(pattern.toLowerCase()));
}

// ===== MAIN ENGINE =====

export function generateInsights(input: InsightInput): InsightOutput {
  const { todayLog, goals, history, rootCause } = input;
  
  const strengths: string[] = [];
  const gaps: string[] = [];
  const actions: TomorrowAction[] = [];

  // ===== CRITICAL: HARD FAIL HANDLING =====
  
  if (todayLog.breachedHardFail) {
    gaps.push(`⚠️ CRITICAL: Hard Fail triggered - ${todayLog.failReason || 'Rule violation'}`);
    
    actions.push({
      action: 'Review guardrails and identify root cause of failure',
      reason: 'Hard fail indicates a critical boundary was crossed',
      trigger: 'First thing tomorrow morning',
      difficulty: 'hard'
    });

    if (rootCause) {
      actions.push({
        action: `Address root cause: ${rootCause}`,
        reason: 'Prevent repeat violations by fixing the underlying issue',
        trigger: 'Before bedtime tonight',
        difficulty: 'medium'
      });
    }
  }

  // ===== ANALYZE COMPLETIONS =====
  
  const completedGoals = goals.filter(g => isGoalCompleted(g.id, todayLog.entries));
  const missedGoals = goals.filter(g => !isGoalCompleted(g.id, todayLog.entries) && g.active);

  // Strengths: Completed goals (prioritize hard ones)
  completedGoals
    .sort((a, b) => (b.isHardFail ? 1 : 0) - (a.isHardFail ? 1 : 0))
    .slice(0, 3)
    .forEach(goal => {
      strengths.push(`✅ ${goal.title} completed`);
    });

  // ===== CATEGORY ANALYSIS =====
  
  const categories = ['Spiritual', 'Health', 'Finance', 'Discipline', 'Emotion', 'Work/Build'];
  const categoryScores = categories.map(cat => ({
    category: cat,
    rate: getCategoryCompletionRate(cat, goals, history)
  })).sort((a, b) => a.rate - b.rate);

  // Weakest category
  const weakestCategory = categoryScores[0];
  if (weakestCategory.rate < 60) {
    gaps.push(`📉 ${weakestCategory.category}: ${weakestCategory.rate}% completion (7-day avg)`);
  }

  // ===== SPECIFIC RULE CHECKS =====
  
  // Rule: Discipline & Finance weak 2 days consecutive
  const isDisciplineWeak = isCategoryWeakConsecutive('Discipline', goals, history, 2);
  const isFinanceWeak = isCategoryWeakConsecutive('Finance', goals, history, 2);
  
  if (isDisciplineWeak && isFinanceWeak) {
    gaps.push('🔴 Discipline & Finance both weak for 2+ days');
    
    const coreHabit = findGoalByPattern(goals, 'deep work') || findGoalByPattern(goals, 'workout');
    if (coreHabit) {
      actions.push({
        action: `Focus ONLY on "${coreHabit.title}" tomorrow - ignore everything else`,
        reason: 'Multiple weak categories indicate overload. Reset with one core habit.',
        trigger: 'Wake up -> immediately do this',
        difficulty: 'easy'
      });
    }
  }

  // Rule: Deep Work < 30 minutes
  const deepWorkGoal = findGoalByPattern(goals, 'deep work');
  if (deepWorkGoal) {
    const deepWorkValue = getNumericValue(deepWorkGoal.id, todayLog.entries);
    if (deepWorkValue < 30) {
      gaps.push(`⏱️ Deep Work: ${deepWorkValue} min (target: 60 min)`);
      
      actions.push({
        action: 'Block 45-minute deep work session (8:00–8:45 AM)',
        reason: 'Consistent deep work deficit impacts long-term goals',
        trigger: 'Right after morning coffee',
        difficulty: 'medium'
      });
    }
  }

  // Rule: 3 consecutive days poor performance
  if (isPoorPerformanceStreak(history, 3)) {
    gaps.push('📊 3-day performance slump detected');
    
    actions.push({
      action: 'Minimum Viable Day: 3 items max (Subuh, 1 meal, 30 min work)',
      reason: 'Burnout prevention - lower the bar to rebuild momentum',
      trigger: 'Set intention tonight',
      difficulty: 'easy'
    });
  }

  // Rule: Sleep late (if mood rating exists and is low)
  if (todayLog.moodRating && todayLog.moodRating <= 2) {
    gaps.push('😔 Low mood rating - possible sleep/energy issue');
    
    actions.push({
      action: 'In bed by 22:00, phone in another room',
      reason: 'Poor mood often correlates with inadequate rest',
      trigger: '21:30 alarm',
      difficulty: 'medium'
    });
  }

  // ===== FILL REMAINING GAPS =====
  
  if (gaps.length < 3) {
    missedGoals.slice(0, 3 - gaps.length).forEach(goal => {
      gaps.push(`❌ Missed: ${goal.title}`);
    });
  }

  // ===== FILL REMAINING ACTIONS =====
  
  if (actions.length < 3) {
    // General recovery action
    if (todayLog.score < 70) {
      actions.push({
        action: 'Complete top 3 priority goals before lunch',
        reason: 'Low score indicates scattered focus',
        trigger: 'Morning planning (5 min)',
        difficulty: 'easy'
      });
    }

    // If still need more
    if (actions.length < 3 && missedGoals.length > 0) {
      const topMissedGoal = missedGoals[0];
      actions.push({
        action: `Retry: ${topMissedGoal.title}`,
        reason: 'Unfinished from today',
        trigger: 'Schedule specific time block',
        difficulty: 'easy'
      });
    }
  }

  // ===== RETURN TOP 3 EACH =====
  
  return {
    top_strengths: strengths.slice(0, 3),
    top_gaps: gaps.slice(0, 3),
    tomorrow_actions: actions.slice(0, 3)
  };
}

// ===== EXAMPLE USAGE =====

/*
const insights = generateInsights({
  todayLog: myDailyLog,
  goals: myGoals,
  history: last7DaysLogs,
  rootCause: 'stress'
});

console.log(insights.top_strengths);    // ["✅ Subuh Jamaah completed", ...]
console.log(insights.top_gaps);         // ["⚠️ CRITICAL: Hard Fail...", ...]
console.log(insights.tomorrow_actions); // [{ action: "...", reason: "...", ... }]
*/
