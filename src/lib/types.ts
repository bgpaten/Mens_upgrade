// TypeScript types for v1.1 data structures

export type Domain = 'physical' | 'appearance' | 'finance' | 'discipline' | 'emotion';
export type PeriodType = 'daily' | 'weekly' | 'monthly';
export type InputType = 'boolean' | 'number' | 'time' | 'rating' | 'text' | 'select' | 'photo';

// Habit Catalog
export interface HabitConfig {
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
  placeholder?: string;
}

export interface HabitV1 {
  id: string;
  domain: Domain;
  periodType: PeriodType;
  name: string;
  inputType: InputType;
  config?: HabitConfig;
  weight: number; // For scoring calculation
  active: boolean;
  createdAt: string;
}

// Period Logs
export interface PeriodEntry {
  id: string;
  habitId: string;
  value: any; // Can be boolean, number, string, object, etc.
  completed: boolean;
  createdAt: string;
}

export interface PeriodLog {
  periodKey: string;
  entries: Record<string, PeriodEntry>; // habitId -> entry
  completedAt?: string;
}

// Scoring
export interface DomainScores {
  physical: number;
  appearance: number;
  finance: number;
  discipline: number;
  emotion: number;
}

// ===== GOAL TRACKER TYPES =====

export type TaskCategory = 
  | 'Spiritual' 
  | 'Health' 
  | 'Appearance' 
  | 'Finance' 
  | 'Discipline' 
  | 'Emotion' 
  | 'Work/Build';

export type TaskPeriod = 'daily' | 'weekly' | 'monthly';

export type TargetType = 'boolean' | 'numeric' | 'scale' | 'time' | 'text';

export interface PeriodRule {
  daysOfWeek?: number[]; // 0-6 for Weekly (0=Sunday)
  daysOfMonth?: number[]; // 1-31 for Monthly
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  period: TaskPeriod;
  periodRule?: PeriodRule;
  targetType: TargetType;
  targetValue?: number; // Min value or target
  isHardFail: boolean; // If true, failing this kills daily score
  active: boolean;
  createdAt: string;

  // Refined scheduling
  frequency?: 'daily' | 'weekly' | 'monthly';
  scheduleConfig?: {
    weeklyReviewDay?: number; // 0-6 (Sunday=0)
    monthlyWindowStart?: number; // e.g. 25
    monthlyWindowEnd?: 'end_of_month';
  };
  
  // Legacy compatibility fields (deprecated)
  target?: number;
  unit?: string;
  domain?: Domain;
  name?: string;
  inputType?: InputType;
  config?: HabitConfig;
  weight?: number;
}

// Backward compatibility alias
export type Habit = GoalItem;

export interface DailyEntry {
  id: string; // usually goalId
  goalId: string;
  value: any; // boolean, number, string
  isComplete: boolean;
  note?: string;
}

export interface DailyLogV2 {
  id: string; // date string YYYY-MM-DD
  userId: string;
  date: string;
  entries: Record<string, DailyEntry>; // goalId -> Entry
  score: number;
  breachedHardFail: boolean;
  failReason?: string; // If hard fail
  moodRating?: number; // 1-5
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReport {
  id: string; // date string
  date: string;
  dateFormatted: string;
  score: number;
  status: 'PASS' | 'FAIL';
  hardFailTriggered?: string; // Name of item that caused fail
  completionStats: {
    total: number;
    completed: number;
    percentage: number;
  };
  highlights: string[]; // 3 best things
  missing: string[]; // 3 missing things
  actionPlan: string[]; // 3 items for tomorrow
  rootCause?: string;
}

export interface Streaks {
  workout: number;
  deepwork: number;
  noContact: number;
}

export interface RecommendationItem {
  title: string;
  reason: string;
  action: string;
}

export interface Recommendations {
  items: RecommendationItem[];
  hardTruth: string;
  tomorrowGoal: string;
}

export interface PeriodScore {
  periodKey: string;
  domainScores: DomainScores;
  totalScore: number;
  streaks: Streaks;
  badgesEarned: string[];
  recommendations: Recommendations;
  computedAt: string;
}

// Progress Photos
export interface ProgressPhoto {
  id: string;
  periodKey: string;
  type: 'front' | 'side' | 'back';
  storagePath: string;
  downloadUrl?: string;
  createdAt: string;
}

// User Profile Extensions
export interface UserTargets {
  wakeTarget?: string;
  incomeTargetMonth?: number;
  weightTarget?: number;
  deepworkTargetMin?: number;
}

export interface UserOnboarding {
  done: boolean;
  focusDomains: Domain[];
  completedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  onboarding: UserOnboarding;
  targets?: UserTargets;
  v1MigrationDone?: boolean; // Track if v1.0 data was migrated
}

// Legacy v1.0 types (for migration)
export interface DailyLog {
  user_id: string;
  log_date: string;
  physical: {
    workout_done: boolean;
    workout_min: number;
    steps: number;
    weight?: number;
  };
  appearance: {
    grooming_done: boolean;
    outfit_rating: number;
  };
  finance: {
    income: number;
    expense: number;
    note?: string;
  };
  discipline: {
    wake_time: string;
    deepwork_min: number;
    distraction_min: number;
  };
  emotion: {
    mood: number;
    trigger?: string;
    stalking_ex: boolean;
  };
  scores: {
    physical: number;
    appearance: number;
    finance: number;
    discipline: number;
    emotion: number;
    total: number;
  };
  recommendations?: Recommendations;
  created_at: string;
}
