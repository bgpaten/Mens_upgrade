// Default habits catalog templates for seeding new users
import type { Habit, Domain, PeriodType, InputType } from './types';

interface HabitTemplate {
  domain: Domain;
  periodType: PeriodType;
  name: string;
  inputType: InputType;
  config?: any;
  weight: number;
}

export const DEFAULT_HABITS: HabitTemplate[] = [
  // ===== PHYSICAL =====
  // Daily
  {
    domain: 'physical',
    periodType: 'daily',
    name: 'Workout Done',
    inputType: 'boolean',
    weight: 30
  },
  {
    domain: 'physical',
    periodType: 'daily',
    name: 'Workout Duration (min)',
    inputType: 'number',
    config: { min: 0, max: 300, unit: 'minutes' },
    weight: 20
  },
  {
    domain: 'physical',
    periodType: 'daily',
    name: 'Steps',
    inputType: 'number',
    config: { min: 0, max: 50000, unit: 'steps' },
    weight: 15
  },
  {
    domain: 'physical',
    periodType: 'daily',
    name: 'Sleep Hours',
    inputType: 'number',
    config: { min: 0, max: 12, unit: 'hours' },
    weight: 10
  },
  
  // Weekly
  {
    domain: 'physical',
    periodType: 'weekly',
    name: 'Weight (kg)',
    inputType: 'number',
    config: { min: 30, max: 200, unit: 'kg' },
    weight: 15
  },
  {
    domain: 'physical',
    periodType: 'weekly',
    name: 'Strength Sessions',
    inputType: 'number',
    config: { min: 0, max: 7, unit: 'sessions' },
    weight: 10
  },
  {
    domain: 'physical',
    periodType: 'weekly',
    name: 'Cardio Sessions',
    inputType: 'number',
    config: { min: 0, max: 7, unit: 'sessions' },
    weight: 10
  },
  
  // Monthly
  {
    domain: 'physical',
    periodType: 'monthly',
    name: 'Progress Photos',
    inputType: 'photo',
    weight: 20
  },
  {
    domain: 'physical',
    periodType: 'monthly',
    name: 'PR Improved',
    inputType: 'boolean',
    weight: 15
  },
  {
    domain: 'physical',
    periodType: 'monthly',
    name: 'Physical Rating (1-10)',
    inputType: 'rating',
    config: { min: 1, max: 10 },
    weight: 10
  },

  // ===== APPEARANCE =====
  // Daily
  {
    domain: 'appearance',
    periodType: 'daily',
    name: 'Grooming Done',
    inputType: 'boolean',
    weight: 40
  },
  {
    domain: 'appearance',
    periodType: 'daily',
    name: 'Outfit Rating (1-5)',
    inputType: 'rating',
    config: { min: 1, max: 5 },
    weight: 30
  },
  
  // Weekly
  {
    domain: 'appearance',
    periodType: 'weekly',
    name: 'Hair Maintained',
    inputType: 'boolean',
    weight: 20
  },
  {
    domain: 'appearance',
    periodType: 'weekly',
    name: 'Clothes Prepared',
    inputType: 'boolean',
    weight: 15
  },
  {
    domain: 'appearance',
    periodType: 'weekly',
    name: 'Shoes Clean',
    inputType: 'boolean',
    weight: 10
  },
  {
    domain: 'appearance',
    periodType: 'weekly',
    name: 'Beard Trim',
    inputType: 'boolean',
    weight: 10
  },
  
  // Monthly
  {
    domain: 'appearance',
    periodType: 'monthly',
    name: 'Nails Trimmed',
    inputType: 'boolean',
    weight: 15
  },
  {
    domain: 'appearance',
    periodType: 'monthly',
    name: 'Wardrobe Review',
    inputType: 'boolean',
    weight: 20
  },
  {
    domain: 'appearance',
    periodType: 'monthly',
    name: 'Style Upgrade Note',
    inputType: 'text',
    config: { placeholder: 'What did you improve?' },
    weight: 10
  },

  // ===== FINANCE =====
  // Daily
  {
    domain: 'finance',
    periodType: 'daily',
    name: 'Income',
    inputType: 'number',
    config: { min: 0, unit: 'IDR' },
    weight: 30
  },
  {
    domain: 'finance',
    periodType: 'daily',
    name: 'Expense',
    inputType: 'number',
    config: { min: 0, unit: 'IDR' },
    weight: 20
  },
  {
    domain: 'finance',
    periodType: 'daily',
    name: 'Category',
    inputType: 'select',
    config: { options: ['Food', 'Transport', 'Entertainment', 'Investment', 'Other'] },
    weight: 5
  },
  {
    domain: 'finance',
    periodType: 'daily',
    name: 'Note',
    inputType: 'text',
    config: { placeholder: 'Brief description...' },
    weight: 5
  },
  
  // Weekly
  {
    domain: 'finance',
    periodType: 'weekly',
    name: 'Net Cashflow',
    inputType: 'number',
    config: { unit: 'IDR' },
    weight: 20
  },
  {
    domain: 'finance',
    periodType: 'weekly',
    name: 'Budget Adherence (1-5)',
    inputType: 'rating',
    config: { min: 1, max: 5 },
    weight: 15
  },
  {
    domain: 'finance',
    periodType: 'weekly',
    name: 'Unplanned Expenses Count',
    inputType: 'number',
    config: { min: 0, max: 50 },
    weight: 10
  },
  
  // Monthly
  {
    domain: 'finance',
    periodType: 'monthly',
    name: 'Income Summary',
    inputType: 'number',
    config: { min: 0, unit: 'IDR' },
    weight: 25
  },
  {
    domain: 'finance',
    periodType: 'monthly',
    name: 'Savings Amount',
    inputType: 'number',
    config: { min: 0, unit: 'IDR' },
    weight: 20
  },
  {
    domain: 'finance',
    periodType: 'monthly',
    name: 'Investment Amount',
    inputType: 'number',
    config: { min: 0, unit: 'IDR' },
    weight: 15
  },
  {
    domain: 'finance',
    periodType: 'monthly',
    name: 'Monetization Progress',
    inputType: 'text',
    config: { placeholder: 'New income streams, projects...' },
    weight: 10
  },

  // ===== DISCIPLINE =====
  // Daily
  {
    domain: 'discipline',
    periodType: 'daily',
    name: 'Wake Time',
    inputType: 'time',
    weight: 20
  },
  {
    domain: 'discipline',
    periodType: 'daily',
    name: 'Deep Work (min)',
    inputType: 'number',
    config: { min: 0, max: 720, unit: 'minutes' },
    weight: 30
  },
  {
    domain: 'discipline',
    periodType: 'daily',
    name: 'Distraction (min)',
    inputType: 'number',
    config: { min: 0, max: 720, unit: 'minutes' },
    weight: 15
  },
  {
    domain: 'discipline',
    periodType: 'daily',
    name: 'Main Task Done',
    inputType: 'boolean',
    weight: 25
  },
  
  // Weekly
  {
    domain: 'discipline',
    periodType: 'weekly',
    name: 'Avg Wake Time',
    inputType: 'time',
    weight: 15
  },
  {
    domain: 'discipline',
    periodType: 'weekly',
    name: 'Deep Work Consistency (1-5)',
    inputType: 'rating',
    config: { min: 1, max: 5 },
    weight: 20
  },
  {
    domain: 'discipline',
    periodType: 'weekly',
    name: 'Missed Days',
    inputType: 'number',
    config: { min: 0, max: 7 },
    weight: 10
  },
  
  // Monthly
  {
    domain: 'discipline',
    periodType: 'monthly',
    name: 'Consistency Percent',
    inputType: 'number',
    config: { min: 0, max: 100, unit: '%' },
    weight: 25
  },
  {
    domain: 'discipline',
    periodType: 'monthly',
    name: 'Biggest Time Waster',
    inputType: 'text',
    config: { placeholder: 'What killed your productivity?' },
    weight: 10
  },
  {
    domain: 'discipline',
    periodType: 'monthly',
    name: '1 Rule to Fix',
    inputType: 'text',
    config: { placeholder: 'One rule for next month...' },
    weight: 15
  },

  // ===== EMOTION =====
  // Daily
  {
    domain: 'emotion',
    periodType: 'daily',
    name: 'Mood (1-5)',
    inputType: 'rating',
    config: { min: 1, max: 5 },
    weight: 25
  },
  {
    domain: 'emotion',
    periodType: 'daily',
    name: 'Stalking Ex',
    inputType: 'boolean',
    weight: 50 // High weight for penalty
  },
  {
    domain: 'emotion',
    periodType: 'daily',
    name: 'Trigger',
    inputType: 'text',
    config: { placeholder: 'What triggered you?' },
    weight: 5
  },
  
  // Weekly
  {
    domain: 'emotion',
    periodType: 'weekly',
    name: 'Trigger Count',
    inputType: 'number',
    config: { min: 0, max: 50 },
    weight: 15
  },
  {
    domain: 'emotion',
    periodType: 'weekly',
    name: 'Strongest Trigger',
    inputType: 'text',
    config: { placeholder: 'What triggered you most?' },
    weight: 10
  },
  {
    domain: 'emotion',
    periodType: 'weekly',
    name: 'Relapse Days',
    inputType: 'number',
    config: { min: 0, max: 7 },
    weight: 20
  },
  
  // Monthly
  {
    domain: 'emotion',
    periodType: 'monthly',
    name: 'Emotional Maturity (1-10)',
    inputType: 'rating',
    config: { min: 1, max: 10 },
    weight: 25
  },
  {
    domain: 'emotion',
    periodType: 'monthly',
    name: 'Attachment Level',
    inputType: 'select',
    config: { options: ['Detached', 'Low', 'Medium', 'High', 'Obsessed'] },
    weight: 20
  },
  {
    domain: 'emotion',
    periodType: 'monthly',
    name: 'Still Waiting?',
    inputType: 'boolean',
    weight: 15
  }
];

/**
 * Generate habit catalog for a new user
 */
export function generateDefaultHabits(): Habit[] {
  return DEFAULT_HABITS.map((template, index) => ({
    id: `habit_${index + 1}`,
    ...template,
    active: true,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Get habits filtered by period type
 */
export function getHabitsByPeriod(habits: Habit[], periodType: PeriodType): Habit[] {
  return habits.filter(h => h.active && h.periodType === periodType);
}

/**
 * Get habits filtered by domain
 */
export function getHabitsByDomain(habits: Habit[], domain: Domain): Habit[] {
  return habits.filter(h => h.active && h.domain === domain);
}
