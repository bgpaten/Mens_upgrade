// Badge system logic for v1.1
import type { Streaks, DomainScores } from './types';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (data: { streaks: Streaks; scores: DomainScores; totalScore: number }) => boolean;
}

export const BADGES: Badge[] = [
  // Streak badges
  {
    id: 'workout_week',
    name: 'Week Warrior',
    description: '7-day workout streak',
    icon: '🔥',
    requirement: ({ streaks }) => streaks.workout >= 7
  },
  {
    id: 'workout_month',
    name: 'Monthly Machine',
    description: '30-day workout streak',
    icon: '💪',
    requirement: ({ streaks }) => streaks.workout >= 30
  },
  {
    id: 'workout_century',
    name: 'Century Club',
    description: '100-day workout streak',
    icon: '👑',
    requirement: ({ streaks }) => streaks.workout >= 100
  },
  {
    id: 'deepwork_week',
    name: 'Focus Master',
    description: '7-day deep work streak',
    icon: '⚡',
    requirement: ({ streaks }) => streaks.deepwork >= 7
  },
  {
    id: 'deepwork_month',
    name: 'Productivity King',
    description: '30-day deep work streak',
    icon: '🧠',
    requirement: ({ streaks }) => streaks.deepwork >= 30
  },
  {
    id: 'nocontact_week',
    name: 'Detachment Beginner',
    description: '7 days no contact',
    icon: '🛡️',
    requirement: ({ streaks }) => streaks.noContact >= 7
  },
  {
    id: 'nocontact_month',
    name: 'Emotionally Free',
    description: '30 days no contact',
    icon: '🦅',
    requirement: ({ streaks }) => streaks.noContact >= 30
  },
  {
    id: 'nocontact_century',
    name: 'Moved On',
    description: '100 days no contact',
    icon: '🏆',
    requirement: ({ streaks }) => streaks.noContact >= 100
  },

  // Score badges
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Total score 90+',
    icon: '⭐',
    requirement: ({ totalScore }) => totalScore >= 90
  },
  {
    id: 'physical_excellence',
    name: 'Physical Excellence',
    description: 'Physical score 90+',
    icon: '🏋️',
    requirement: ({ scores }) => scores.physical >= 90
  },
  {
    id: 'appearance_excellence',
    name: 'Style Icon',
    description: 'Appearance score 90+',
    icon: '👔',
    requirement: ({ scores }) => scores.appearance >= 90
  },
  {
    id: 'finance_excellence',
    name: 'Money Manager',
    description: 'Finance score 90+',
    icon: '💰',
    requirement: ({ scores }) => scores.finance >= 90
  },
  {
    id: 'discipline_excellence',
    name: 'Discipline Demon',
    description: 'Discipline score 90+',
    icon: '⏰',
    requirement: ({ scores }) => scores.discipline >= 90
  },
  {
    id: 'emotion_excellence',
    name: 'Emotionally Mature',
    description: 'Emotion score 90+',
    icon: '🧘',
    requirement: ({ scores }) => scores.emotion >= 90
  },

  // All-domain badges
  {
    id: 'all_domains_80',
    name: 'Well-Rounded',
    description: 'All domains 80+',
    icon: '🌟',
    requirement: ({ scores }) => 
      Object.values(scores).every(score => score >= 80)
  },
  {
    id: 'all_domains_90',
    name: 'Excellence Across Board',
    description: 'All domains 90+',
    icon: '💎',
    requirement: ({ scores }) => 
      Object.values(scores).every(score => score >= 90)
  }
];

/**
 * Check which badges a user has earned
 */
export function checkBadges(
  streaks: Streaks,
  scores: DomainScores,
  totalScore: number,
  previousBadges: string[] = []
): string[] {
  const earnedBadges: string[] = [];

  BADGES.forEach(badge => {
    const alreadyEarned = previousBadges.includes(badge.id);
    const meetsRequirement = badge.requirement({ streaks, scores, totalScore });

    if (meetsRequirement && !alreadyEarned) {
      earnedBadges.push(badge.id);
    }
  });

  return earnedBadges;
}

/**
 * Get badge details by ID
 */
export function getBadge(badgeId: string): Badge | undefined {
  return BADGES.find(b => b.id === badgeId);
}

/**
 * Get all earned badges with details
 */
export function getEarnedBadges(badgeIds: string[]): Badge[] {
  return badgeIds.map(id => getBadge(id)).filter(Boolean) as Badge[];
}
