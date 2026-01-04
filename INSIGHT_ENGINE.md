# InsightEngine Module

## Overview

Non-LLM (rule-based) insight generation system for the Daily Review application. Analyzes daily entries and 7-day historical data to produce actionable recommendations.

## Features

### 📊 **Inputs**
- `todayLog`: Today's daily entry (values for each goal)
- `goals`: Goal metadata (category, weight, period, hard fail rules)
- `history`: Last 7 days of logs (for trend analysis)
- `rootCause`: Optional user-selected root cause if hard fail triggered

### 🎯 **Outputs**
- **`top_strengths`** (max 3): Specific achievements based on actual data
- **`top_gaps`** (max 3): Specific weaknesses or missed goals
- **`tomorrow_actions`** (max 3): Concrete 10-30 minute actions with:
  - `action`: What to do
  - `reason`: Why it's a priority
  - `trigger`: When/how to execute
  - `difficulty`: easy/medium/hard

## Rules Engine

### 🚨 **Priority 1: Hard Fail Recovery**
If `breachedHardFail === true`:
- Immediately flag as top gap
- Action #1: Review guardrails and root cause
- Action #2: Address specific root cause (if provided)

Example:
```typescript
gaps: ["⚠️ CRITICAL: Hard Fail triggered - Nyomot Tabungan"]
actions: [
  {
    action: "Review guardrails and identify root cause of failure",
    reason: "Hard fail indicates a critical boundary was crossed",
    trigger: "First thing tomorrow morning",
    difficulty: "hard"
  }
]
```

### 📉 **Rule 2: Discipline & Finance Weak (2+ days)**
If both categories < 50% completion for 2 consecutive days:
- Flag as gap
- Recommend focusing on **ONE** core habit only
- Difficulty: `easy` (reduce overwhelm)

Example:
```typescript
action: "Focus ONLY on 'Deep Work' tomorrow - ignore everything else"
reason: "Multiple weak categories indicate overload. Reset with one core habit."
trigger: "Wake up -> immediately do this"
```

### ⏱️ **Rule 3: Deep Work Deficit**
If Deep Work < 30 minutes:
- Flag gap with specific value
- Recommend 45-minute focused block
- Difficulty: `medium`

Example:
```typescript
action: "Block 45-minute deep work session (8:00–8:45 AM)"
trigger: "Right after morning coffee"
```

### 😴 **Rule 4: Mood/Sleep Issue**
If mood rating ≤ 2:
- Infer possible sleep/energy problem
- Recommend early bedtime (22:00)
- Difficulty: `medium`

Example:
```typescript
action: "In bed by 22:00, phone in another room"
reason: "Poor mood often correlates with inadequate rest"
trigger: "21:30 alarm"
```

### 📊 **Rule 5: 3-Day Performance Slump**
If score < 60 for 3 consecutive days:
- Flag burnout risk
- Recommend "Minimum Viable Day" (3 items max)
- Difficulty: `easy` (lower the bar to rebuild)

Example:
```typescript
action: "Minimum Viable Day: 3 items max (Subuh, 1 meal, 30 min work)"
reason: "Burnout prevention - lower the bar to rebuild momentum"
trigger: "Set intention tonight"
```

## Usage

### Basic Integration

```typescript
import { generateInsights } from '@/lib/insightEngine';
import { getDailyLog, getUserGoals } from '@/lib/supabase-v11';

// Fetch data
const todayLog = await getDailyLog(userId, '2026-01-04');
const goals = await getUserGoals(userId);
const history = []; // last 7 days

// Generate insights
const insights = generateInsights({
  todayLog,
  goals,
  history,
  rootCause: 'stress' // optional
});

// Use in report
console.log(insights.top_strengths);    // ["✅ Subuh Jamaah completed", ...]
console.log(insights.top_gaps);         // ["📉 Finance: 30% completion", ...]
console.log(insights.tomorrow_actions); 
// [
//   { 
//     action: "Complete top 3 priority goals before lunch",
//     reason: "Low score indicates scattered focus",
//     trigger: "Morning planning (5 min)",
//     difficulty: "easy"
//   }
// ]
```

### Integrated with Reporting

The InsightEngine is automatically integrated into `generateDailyReport()`:

```typescript
import { generateDailyReport } from '@/lib/reporting';

const report = await generateDailyReport(userId, '2026-01-04');

// Report now includes InsightEngine-generated content:
console.log(report.highlights);   // Strengths from engine
console.log(report.missing);      // Gaps from engine
console.log(report.actionPlan);   // Tomorrow actions (formatted)
```

## Helper Functions

### `isGoalCompleted(goalId, entries)`
Checks if a goal was marked complete in given entries.

### `getNumericValue(goalId, entries)`
Extracts numeric value from goal entry (e.g., Deep Work minutes).

### `getCategoryCompletionRate(category, goals, history)`
Calculates 7-day average completion % for a category.

### `isCategoryWeakConsecutive(category, goals, history, days)`
Checks if category has been weak (< 50%) for N consecutive days.

### `isPoorPerformanceStreak(history, days)`
Checks if score < 60 for N consecutive days.

### `findGoalByPattern(goals, pattern)`
Finds goal by name pattern (e.g., "deep work" matches "Deep Work Session").

## Extensibility

### Adding New Rules

```typescript
// Add to generateInsights() function
if (customCondition) {
  gaps.push('Custom gap message');
  
  actions.push({
    action: 'Your custom action',
    reason: 'Why this matters',
    trigger: 'When to do it',
    difficulty: 'easy' | 'medium' | 'hard'
  });
}
```

### Example: Workout Streak Rule

```typescript
const workoutGoal = findGoalByPattern(goals, 'workout');
if (workoutGoal) {
  const workoutStreak = history.filter(log => 
    isGoalCompleted(workoutGoal.id, log.entries)
  ).length;
  
  if (workoutStreak >= 7) {
    strengths.push(`🔥 ${workoutStreak}-day workout streak!`);
  } else if (workoutStreak === 0) {
    actions.push({
      action: '20-minute bodyweight workout (no equipment)',
      reason: 'Restart workout habit with low barrier',
      trigger: 'Wake up + 5 min',
      difficulty: 'easy'
    });
  }
}
```

## Testing

Run insights locally:

```typescript
const mockLog = {
  id: '2026-01-04',
  userId: 'test',
  date: '2026-01-04',
  entries: { 
    'goal1': { id: 'goal1', goalId: 'goal1', value: true, isComplete: true }
  },
  score: 75,
  breachedHardFail: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const insights = generateInsights({
  todayLog: mockLog,
  goals: mockGoals,
  history: [],
  rootCause: undefined
});
```

## Performance

- **No API calls**: All logic is local (rule-based)
- **Lightweight**: < 300 lines of code
- **Fast**: Generates insights in < 10ms
- **Deterministic**: Same input → same output (no randomness)

---

**Last Updated**: 4 Januari 2026  
**Author**: Antigravity AI
