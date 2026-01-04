// Period helper utilities for v1.1
import { format, startOfWeek, startOfMonth, endOfMonth, isLastDayOfMonth, getDay } from 'date-fns';

export type PeriodType = 'daily' | 'weekly' | 'monthly';

/**
 * Get today's period key in format: D_YYYY-MM-DD
 */
export function getTodayKey(date: Date = new Date()): string {
  return `D_${format(date, 'yyyy-MM-dd')}`;
}

/**
 * Get current week's period key in format: W_YYYY-MM-DD
 * Week starts on Monday
 */
export function getWeekKey(date: Date = new Date()): string {
  const weekStart = getWeekStart(date);
  return `W_${format(weekStart, 'yyyy-MM-dd')}`;
}

/**
 * Get current month's period key in format: M_YYYY-MM
 */
export function getMonthKey(date: Date = new Date()): string {
  return `M_${format(date, 'yyyy-MM')}`;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Check if a period type is currently eligible for input
 * 
 * Rules:
 * - Daily: Always eligible
 * - Weekly: Eligible on Sundays (day 0) or when manually triggered
 * - Monthly: Eligible on last day of month or when manually triggered
 */
export function isPeriodEligible(
  periodType: PeriodType, 
  date: Date = new Date(),
  manualTrigger: boolean = false
): boolean {
  if (manualTrigger) return true;
  
  switch (periodType) {
    case 'daily':
      return true;
    case 'weekly':
      return getDay(date) === 0; // Sunday
    case 'monthly':
      return isLastDayOfMonth(date);
    default:
      return false;
  }
}

/**
 * Get period key based on period type
 */
export function getPeriodKey(periodType: PeriodType, date: Date = new Date()): string {
  switch (periodType) {
    case 'daily':
      return getTodayKey(date);
    case 'weekly':
      return getWeekKey(date);
    case 'monthly':
      return getMonthKey(date);
    default:
      throw new Error(`Invalid period type: ${periodType}`);
  }
}

/**
 * Parse period key to extract date and type
 */
export function parsePeriodKey(periodKey: string): { type: PeriodType; date: string } {
  const [type, date] = periodKey.split('_');
  
  const typeMap: Record<string, PeriodType> = {
    'D': 'daily',
    'W': 'weekly',
    'M': 'monthly'
  };
  
  return {
    type: typeMap[type] || 'daily',
    date
  };
}

/**
 * Get human-readable period label
 */
export function getPeriodLabel(periodKey: string): string {
  const { type, date } = parsePeriodKey(periodKey);
  
  switch (type) {
    case 'daily':
      return format(new Date(date), 'MMMM dd, yyyy');
    case 'weekly':
      return `Week of ${format(new Date(date), 'MMM dd, yyyy')}`;
    case 'monthly':
      return format(new Date(date + '-01'), 'MMMM yyyy');
    default:
      return date;
  }
}
