// Supabase data access functions for Goal Tracker
import { supabase } from './supabase';
import type { GoalItem, DailyLogV2, DailyReport, UserProfile } from './types';

// ===== GOALS / ITEMS =====

/**
 * Get all active goals for a user
 */
export async function getUserGoals(userId: string): Promise<GoalItem[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getUserGoals error:', error);
    throw error;
  }
  
  // Convert snake_case to camelCase
  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    period: row.period,
    periodRule: row.period_rule,
    targetType: row.target_type,
    targetValue: row.target_value,
    isHardFail: row.is_hard_fail,
    active: row.active,
    createdAt: row.created_at,
    frequency: row.frequency || row.period,
    scheduleConfig: row.period_rule
  }));
}

/**
 * Get user habits (legacy - maps to getUserGoals)
 */
export async function getUserHabits(userId: string): Promise<GoalItem[]> {
  return getUserGoals(userId);
}

/**
 * Save or Update a Goal
 */
export async function saveGoal(userId: string, goal: GoalItem): Promise<void> {
  const row = {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    period: goal.period, // mapping period to legacy
    period_rule: goal.scheduleConfig || goal.periodRule, // mapping scheduleConfig to period_rule
    target_type: goal.targetType,
    target_value: goal.targetValue,
    is_hard_fail: goal.isHardFail,
    active: goal.active,
    created_at: goal.createdAt
  };

  const { error } = await supabase
    .from('goals')
    .upsert(row, { onConflict: 'id' });

  if (error) throw error;
}

/**
 * Delete a Goal
 */
export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId);

  if (error) throw error;
}

// ===== DAILY LOGS =====

/**
 * Save Daily Log
 */
export async function saveDailyLog(userId: string, log: DailyLogV2): Promise<void> {
  const row = {
    id: log.id,
    user_id: userId,
    date: log.date,
    entries: log.entries,
    score: log.score,
    breached_hard_fail: log.breachedHardFail,
    fail_reason: log.failReason,
    mood_rating: log.moodRating,
    notes: log.notes,
    created_at: log.createdAt,
    updated_at: log.updatedAt
  };

  const { error } = await supabase
    .from('daily_logs')
    .upsert(row, { onConflict: 'id' });

  if (error) throw error;
}

/**
 * Get Daily Log for a specific date
 */
export async function getDailyLog(userId: string, date: string): Promise<DailyLogV2 | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('id', date)
    .maybeSingle(); 

  if (error && error.code !== 'PGRST116') {
    console.error('getDailyLog error:', error);
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    entries: data.entries || {},
    score: data.score,
    breachedHardFail: data.breached_hard_fail,
    failReason: data.fail_reason,
    moodRating: data.mood_rating,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

// ===== REPORTS =====

/**
 * Save Daily Report
 */
export async function saveDailyReport(userId: string, report: DailyReport): Promise<void> {
  const row = {
    id: report.id,
    user_id: userId,
    date: report.date,
    date_formatted: report.dateFormatted,
    score: report.score,
    status: report.status,
    hard_fail_triggered: report.hardFailTriggered,
    completion_stats: report.completionStats,
    highlights: report.highlights,
    missing: report.missing,
    action_plan: report.actionPlan,
    root_cause: report.rootCause
  };

  const { error } = await supabase
    .from('reports')
    .upsert(row, { onConflict: 'id' });

  if (error) throw error;
}

/**
 * Get Report
 */
export async function getDailyReport(userId: string, date: string): Promise<DailyReport | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .eq('id', date)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('getDailyReport error:', error);
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id,
    date: data.date,
    dateFormatted: data.date_formatted,
    score: data.score,
    status: data.status,
    hardFailTriggered: data.hard_fail_triggered,
    completionStats: data.completion_stats,
    highlights: data.highlights,
    missing: data.missing,
    actionPlan: data.action_plan,
    rootCause: data.root_cause
  };
}

/**
 * Get Daily Logs for a range
 */
export async function getDailyLogs(userId: string, startDate: string, endDate: string): Promise<DailyLogV2[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('getDailyLogs error:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    entries: row.entries || {},
    score: row.score,
    breachedHardFail: row.breached_hard_fail,
    failReason: row.fail_reason,
    moodRating: row.mood_rating,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

/**
 * Get Reports for a range
 */
export async function getReports(userId: string, startDate: string, endDate: string): Promise<DailyReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('getReports error:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    date: row.date,
    dateFormatted: row.date_formatted,
    score: row.score,
    status: row.status,
    hardFailTriggered: row.hard_fail_triggered,
    completionStats: row.completion_stats,
    highlights: row.highlights,
    missing: row.missing,
    actionPlan: row.action_plan,
    rootCause: row.root_cause
  }));
}

// ===== USER PROFILE =====

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return {
    uid: data.id,
    displayName: data.full_name || '',
    email: '',
    createdAt: data.created_at,
    onboarding: { done: true, focusDomains: [] }
  };
}

export async function updateUserProfile(userId: string, updates: { full_name?: string }): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' });

  if (error) throw error;
}

// ===== LEGACY PERIOD TRACKING (for backward compatibility) =====

export interface PeriodEntry {
  id: string;
  habitId: string;
  value: number;
  completed: boolean;
  createdAt: string;
}

export interface PeriodScore {
  periodKey: string;
  userId: string;
  scores: Record<string, number>;
  totalScore: number;
  computedAt: string;
}

/**
 * Legacy functions - currently no-op or minimal implementation
 * These exist for backward compatibility with old hooks
 */
export async function getPeriodEntries(_userId: string, _periodKey: string): Promise<Record<string, PeriodEntry>> {
  console.warn('getPeriodEntries is deprecated - returning empty object');
  return {};
}

export async function savePeriodEntry(
  _userId: string,
  _periodKey: string,
  _habitId: string,
  _value: any
): Promise<void> {
  console.warn('savePeriodEntry is deprecated - no-op');
}

export async function isPeriodCompleted(_userId: string, _periodKey: string): Promise<boolean> {
  return false;
}

export async function markPeriodCompleted(_userId: string, _periodKey: string): Promise<void> {
  console.warn('markPeriodCompleted is deprecated - no-op');
}

export async function hasCompletedV11Setup(userId: string): Promise<boolean> {
  // Check if user has any goals
  const goals = await getUserGoals(userId);
  return goals.length > 0;
}

export async function initializeV11ForUser(userId: string): Promise<void> {
  console.log(`[Supabase] initializeV11ForUser called for ${userId} (Deprecated)`);
}
