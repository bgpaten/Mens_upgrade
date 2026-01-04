import { format, getDay, subDays } from 'date-fns';
import type { GoalItem, DailyReport, DailyLogV2 } from './types';
import { getUserGoals, getDailyLog, saveDailyReport } from './supabase-v11';
import { generateInsights } from './insightEngine';

// --- Helper: Check if goal is due today ---

export function isGoalDue(goal: GoalItem, date: Date | string): boolean {
  return isGoalActiveToday(goal, date);
}

export function isGoalActiveToday(goal: GoalItem, date: Date | string): boolean {
  if (!goal.active) return false;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const frequency = goal.frequency || goal.period; // Support both fields
  
  // A. DAILY: Always active
  if (frequency === 'daily') return true;
  
  // B. WEEKLY: Active on specific review day (default: Sunday = 0)
  if (frequency === 'weekly') {
    const dayOfWeek = getDay(d);
    const reviewDay = goal.scheduleConfig?.weeklyReviewDay ?? 0;
    return dayOfWeek === reviewDay;
  }
  
  // C. MONTHLY: Active in review window (default: 25th to end of month)
  if (frequency === 'monthly') {
    const dayOfMonth = d.getDate();
    const windowStart = goal.scheduleConfig?.monthlyWindowStart ?? 25;
    
    // Simple window check: if it's within [windowStart, 31]
    // Note: Monthly review usually spans till end of month
    return dayOfMonth >= windowStart;
  }
  
  return false;
}

// --- Logic: Generate Daily Report ---

export async function generateDailyReport(userId: string, date: string): Promise<DailyReport> {
  // 1. Fetch Goals & Today's Log
  const goals = await getUserGoals(userId);
  const todaysGoals = goals.filter(g => isGoalDue(g, date));
  const log = await getDailyLog(userId, date); // Might be null if first time
  
  // 2. Calculate Stats
  const total = todaysGoals.length;
  let completed = 0;
  let hardFailTriggered: string | undefined = undefined;
  
  const entries = log?.entries || {};
  
  todaysGoals.forEach(g => {
    const entry = entries[g.id];
    
    // Check Hard Fail first
    if (g.isHardFail && entry?.value === true) { // Assuming boolean TRUE means "I failed" (like "Did you steal savings?")
        // Wait, usually checkboxes are "Did you do good?". 
        // Let's standardize: Hard Fail items are "Did you mess up?". 
        // So checking it means FAILURE.
        // User request says: "Nyomot tabungan? (hard fail)" -> if True, fail.
         hardFailTriggered = g.title;
    }
    
    // Standard Completion
    if (entry?.isComplete) {
       completed++;
    }
  });
  
  // 3. Score Calculation
  let score = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  if (hardFailTriggered) {
      score = 0;
  }
  
  // 4. Generate Insights with InsightEngine
  const history: DailyLogV2[] = [];
  
  // Fetch last 7 days for historical context
  for (let i = 1; i <= 7; i++) {
    const pastDate = format(subDays(new Date(date), i), 'yyyy-MM-dd');
    const pastLog = await getDailyLog(userId, pastDate);
    if (pastLog) {
      history.push(pastLog);
    }
  }
  
  let highlights: string[] = [];
  let missing: string[] = [];
  let actionPlan: string[] = [];
  
  if (log) {
    // Use InsightEngine for sophisticated analysis
    const insights = generateInsights({
      todayLog: log,
      goals: todaysGoals,
      history,
      rootCause: log.failReason
    });
    
    highlights = insights.top_strengths;
    missing = insights.top_gaps;
    actionPlan = insights.tomorrow_actions.map(a => 
      `${a.action} (${a.trigger})`
    );
  } else {
    // Fallback if no log yet
    highlights = [];
    missing = todaysGoals.map(g => g.title).slice(0, 3);
    actionPlan = ["Complete today's check-in first"];
  }
  
  const report: DailyReport = {
      id: date,
      date,
      dateFormatted: format(new Date(date), 'EEEE, d MMMM yyyy'),
      score,
      status: (score >= 80 && !hardFailTriggered) ? 'PASS' : 'FAIL',
      hardFailTriggered,
      completionStats: {
          total,
          completed,
          percentage: total > 0 ? (completed/total) * 100 : 0
      },
      highlights,
      missing,
      actionPlan: actionPlan.slice(0, 3),
      rootCause: log?.failReason
  };
  
  // 5. Save Report
  await saveDailyReport(userId, report);
  
  return report;
}
