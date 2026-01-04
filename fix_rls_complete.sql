-- ============================================
-- COMPLETE RLS FIX FOR GOAL TRACKER
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop ALL existing policies first
drop policy if exists "Users can view own goals" on public.goals;
drop policy if exists "Users can insert own goals" on public.goals;
drop policy if exists "Users can update own goals" on public.goals;
drop policy if exists "Users can delete own goals" on public.goals;

drop policy if exists "Users can view own daily logs" on public.daily_logs;
drop policy if exists "Users can insert own daily logs" on public.daily_logs;
drop policy if exists "Users can update own daily logs" on public.daily_logs;

drop policy if exists "Users can view own reports" on public.reports;
drop policy if exists "Users can insert own reports" on public.reports;
drop policy if exists "Users can update own reports" on public.reports;

-- ============================================
-- GOALS POLICIES
-- ============================================

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- ============================================
-- DAILY LOGS POLICIES
-- ============================================

create policy "Users can view own daily logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily logs"
  on public.daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- REPORTS POLICIES
-- ============================================

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on public.reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
