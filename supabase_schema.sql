-- ============================================
-- Goal Tracker & Daily Review - Supabase Schema
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users Profile Extension (Supabase Auth handles core auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Goals / Items
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text not null check (category in ('Spiritual', 'Health', 'Appearance', 'Finance', 'Discipline', 'Emotion', 'Work/Build')),
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  period_rule jsonb, -- {daysOfWeek: [0,1], daysOfMonth: [1,15]}
  target_type text not null check (target_type in ('boolean', 'numeric', 'scale', 'time', 'text')),
  target_value numeric,
  is_hard_fail boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- Daily Logs
create table if not exists public.daily_logs (
  id text primary key, -- YYYY-MM-DD format
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  entries jsonb not null default '{}', -- {goalId: {id, goalId, value, isComplete, note}}
  score integer default 0,
  breached_hard_fail boolean default false,
  fail_reason text,
  mood_rating integer check (mood_rating between 1 and 5),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Daily Reports
create table if not exists public.reports (
  id text primary key, -- YYYY-MM-DD format
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  date_formatted text not null,
  score integer not null,
  status text not null check (status in ('PASS', 'FAIL')),
  hard_fail_triggered text,
  completion_stats jsonb not null, -- {total, completed, percentage}
  highlights jsonb not null default '[]',
  missing jsonb not null default '[]',
  action_plan jsonb not null default '[]',
  root_cause text,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_goals_active on public.goals(active) where active = true;
create index if not exists idx_daily_logs_user_id on public.daily_logs(user_id);
create index if not exists idx_daily_logs_date on public.daily_logs(date);
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_date on public.reports(date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.daily_logs enable row level security;
alter table public.reports enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Goals policies
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Daily Logs policies
create policy "Users can view own daily logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

-- Reports policies
create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles
create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Trigger for daily_logs
create trigger on_daily_logs_updated
  before update on public.daily_logs
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- SEED DEFAULT GOALS (Optional - Run manually)
-- ============================================

-- Example: Insert default goals for a user
-- Replace 'USER_UUID_HERE' with actual user UUID after signup
/*
insert into public.goals (user_id, title, description, category, period, target_type, is_hard_fail, active)
values
  ('USER_UUID_HERE', 'Subuh Jamaah', null, 'Spiritual', 'daily', 'boolean', false, true),
  ('USER_UUID_HERE', 'Deep Work', 'Fokus kerja tanpa distraksi', 'Work/Build', 'daily', 'time', false, true),
  ('USER_UUID_HERE', 'Build Mode (Ba''da Isya)', 'Coding / Project sampingan', 'Work/Build', 'daily', 'time', false, true),
  ('USER_UUID_HERE', 'Workout', null, 'Health', 'daily', 'time', false, true),
  ('USER_UUID_HERE', 'Pantau Pengeluaran', 'Catat pengeluaran hari ini', 'Finance', 'daily', 'numeric', false, true),
  ('USER_UUID_HERE', 'Nyomot Tabungan / Investasi?', 'Apakah hari ini menarik dana tabungan?', 'Finance', 'daily', 'boolean', true, true),
  ('USER_UUID_HERE', 'Mood Rating', null, 'Emotion', 'daily', 'scale', false, true);
*/

-- ============================================
-- NOTES
-- ============================================
-- 1. Auth is handled by Supabase Auth (no need to create auth.users manually)
-- 2. After signup, create a profile manually or via trigger
-- 3. Goals are user-specific and fully customizable
-- 4. RLS ensures users can only access their own data
-- 5. To seed goals, replace USER_UUID_HERE with auth.uid() in the seed query
