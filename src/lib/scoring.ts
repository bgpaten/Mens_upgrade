// Scoring engine for v1.1 - Deterministic rule-based scoring
import type { Habit, PeriodEntry, DomainScores, Domain, Streaks, Recommendations, RecommendationItem, PeriodScore } from './types';
import { getPeriodEntries } from "./supabase-v11";
import { getTodayKey } from './periods';
import { subDays } from 'date-fns';
import { checkBadges } from './badges';

/**
 * Compute score for a single habit based on its value and weight
 */
function computeHabitScore(habit: Habit, value: any): number {
  const { inputType, config, weight } = habit;

  let rawScore = 0;

  switch (inputType) {
    case 'boolean':
      rawScore = value ? 100 : 0;
      break;

    case 'number':
      if (config?.min !== undefined && config?.max !== undefined) {
        const normalized = Math.min(Math.max(value, config.min), config.max);
        rawScore = ((normalized - config.min) / (config.max - config.min)) * 100;
      } else {
        rawScore = Math.min(value, 100);
      }
      break;

    case 'rating':
      const min = config?.min || 1;
      const max = config?.max || 5;
      rawScore = ((value - min) / (max - min)) * 100;
      break;

    case 'time':
      rawScore = 50; // Neutral for now
      break;

    case 'text':
    case 'select':
      rawScore = value ? 50 : 0;
      break;

    case 'photo':
      rawScore = value ? 100 : 0;
      break;

    default:
      rawScore = 0;
  }

  return (rawScore * weight) / 100;
}

/**
 * Compute domain score from habits and entries
 */
export function computeDomainScore(
  domain: Domain,
  entries: Record<string, PeriodEntry>,
  habits: Habit[]
): number {
  const domainHabits = habits.filter(h => h.domain === domain && h.active);
  
  if (domainHabits.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  domainHabits.forEach(habit => {
    const entry = entries[habit.id];
    if (entry && entry.completed) {
      totalWeightedScore += computeHabitScore(habit, entry.value);
      totalWeight += habit.weight;
    }
  });

  if (totalWeight === 0) return 0;

  return Math.round((totalWeightedScore / totalWeight) * 100);
}

/**
 * Apply hard penalties based on specific conditions
 */
function applyPenalties(
  domainScores: DomainScores,
  entries: Record<string, PeriodEntry>,
  habits: Habit[]
): DomainScores {
  const penalizedScores = { ...domainScores };

  const stalkingHabit = habits.find(h => h.name === 'Stalking Ex');
  if (stalkingHabit) {
    const stalkingEntry = entries[stalkingHabit.id];
    if (stalkingEntry?.value === true) {
      penalizedScores.emotion = Math.max(0, penalizedScores.emotion - 40);
    }
  }

  return penalizedScores;
}

/**
 * Compute total score from domain scores
 */
export function computeTotalScore(domainScores: DomainScores): number {
  const scores = Object.values(domainScores);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average);
}

/**
 * Calculate streaks for a user
 */
export async function calculateStreaks(userId: string): Promise<Streaks> {
  const streaks: Streaks = {
    workout: 0,
    deepwork: 0,
    noContact: 0
  };

  try {
    const days = 30;
    const periodKeys: string[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      periodKeys.push(getTodayKey(date));
    }

    let workoutStreak = 0;
    for (const key of periodKeys) {
      const entries = await getPeriodEntries(userId, key);
      const workoutEntry = Object.values(entries).find(e => 
        e.habitId.includes('workout') || e.habitId.includes('Workout')
      );
      
      if (workoutEntry?.value === true) {
        workoutStreak++;
      } else {
        break;
      }
    }
    streaks.workout = workoutStreak;

    let deepworkStreak = 0;
    for (const key of periodKeys) {
      const entries = await getPeriodEntries(userId, key);
      const deepworkEntry = Object.values(entries).find(e => 
        e.habitId.includes('deepwork') || e.habitId.includes('Deep Work')
      );
      
      if (deepworkEntry && Number(deepworkEntry.value) >= 60) {
        deepworkStreak++;
      } else {
        break;
      }
    }
    streaks.deepwork = deepworkStreak;

    let noContactStreak = 0;
    for (const key of periodKeys) {
      const entries = await getPeriodEntries(userId, key);
      const stalkingEntry = Object.values(entries).find(e => 
        e.habitId.includes('stalking') || e.habitId.includes('Stalking')
      );
      
      if (!stalkingEntry || stalkingEntry.value === false) {
        noContactStreak++;
      } else {
        break;
      }
    }
    streaks.noContact = noContactStreak;

  } catch (error) {
    console.error('[Scoring] Error calculating streaks:', error);
  }

  return streaks;
}

/**
 * Generate recommendations based on scores and entries
 */
export function generateRecommendations(
  domainScores: DomainScores,
  entries: Record<string, PeriodEntry>
): Recommendations {
  const items: RecommendationItem[] = [];
  let hardTruth = '';
  let tomorrowGoal = '';

  const sortedDomains = (Object.entries(domainScores) as [Domain, number][])
    .sort((a, b) => a[1] - b[1]);
  
  const [lowestDomain, lowestScore] = sortedDomains[0];

  if (lowestScore < 50) {
    switch (lowestDomain) {
      case 'physical':
        items.push({
          title: 'Physical Neglect',
          reason: `Your physical score is ${lowestScore}/100. Negligence, not busyness.`,
          action: 'Commit to 30min workout tomorrow. No excuses.'
        });
        hardTruth = 'Your body is your temple. Stop letting it decay.';
        tomorrowGoal = 'Complete a full workout session';
        break;

      case 'appearance':
        items.push({
          title: 'Appearance Slipping',
          reason: `Score: ${lowestScore}/100. First impressions matter.`,
          action: 'Full grooming routine + outfit planning tonight.'
        });
        hardTruth = 'People judge you in 7 seconds. Stop failing that test.';
        tomorrowGoal = 'Dress like you respect yourself';
        break;

      case 'finance':
        items.push({
          title: 'Financial Chaos',
          reason: `Finance score: ${lowestScore}/100. Money problems = life problems.`,
          action: 'Track every expense tomorrow. No blind spending.'
        });
        hardTruth = 'Broke is a mindset. Stop choosing it.';
        tomorrowGoal = 'Zero unplanned expenses';
        break;

      case 'discipline':
        items.push({
          title: 'Discipline Breakdown',
          reason: `Score: ${lowestScore}/100. Discipline equals freedom.`,
          action: 'Wake at 5 AM. 2 hours deep work before distractions.'
        });
        hardTruth = 'You are not busy. You are just undisciplined.';
        tomorrowGoal = 'Complete main task before noon';
        break;

      case 'emotion':
        items.push({
          title: 'Emotional Weakness',
          reason: `Emotion score: ${lowestScore}/100. Still attached.`,
          action: 'Delete her number. Block all socials. Move on.'
        });
        hardTruth = 'She is not coming back. Stop waiting.';
        tomorrowGoal = 'Zero stalking. Zero thinking about her.';
        break;
    }
  }

  const stalkingEntry = Object.values(entries).find(e => 
    e.habitId.includes('stalking') || e.habitId.includes('Stalking')
  );
  
  if (stalkingEntry?.value === true) {
    items.unshift({
      title: 'CRITICAL: Stalking Detected',
      reason: 'You stalked your ex. Immediate failure.',
      action: 'Block all contact. Delete photos. See a therapist.'
    });
    hardTruth = 'You are obsessed. This is pathetic. Get help.';
  }

  const [highestDomain, highestScore] = sortedDomains[sortedDomains.length - 1];
  if (highestScore >= 80) {
    items.push({
      title: `${highestDomain.charAt(0).toUpperCase() + highestDomain.slice(1)} Excellence`,
      reason: `Strong performance: ${highestScore}/100`,
      action: 'Maintain this standard. Raise the bar higher.'
    });
  }

  return {
    items: items.slice(0, 3),
    hardTruth: hardTruth || 'Mediocrity is a choice. Choose excellence.',
    tomorrowGoal: tomorrowGoal || 'Beat today score'
  };
}

/**
 * Compute full period score
 */
export async function computePeriodScore(
  userId: string,
  periodKey: string,
  entries: Record<string, PeriodEntry>,
  habits: Habit[],
  previousBadges: string[] = []
): Promise<PeriodScore> {
  let domainScores: DomainScores = {
    physical: computeDomainScore('physical', entries, habits),
    appearance: computeDomainScore('appearance', entries, habits),
    finance: computeDomainScore('finance', entries, habits),
    discipline: computeDomainScore('discipline', entries, habits),
    emotion: computeDomainScore('emotion', entries, habits)
  };

  domainScores = applyPenalties(domainScores, entries, habits);

  const totalScore = computeTotalScore(domainScores);

  const streaks = await calculateStreaks(userId);

  const recommendations = generateRecommendations(domainScores, entries);

  // Check for new badges
  const newBadges = checkBadges(streaks, domainScores, totalScore, previousBadges);

  return {
    periodKey,
    domainScores,
    totalScore,
    streaks,
    badgesEarned: newBadges,
    recommendations,
    computedAt: new Date().toISOString()
  };
}
