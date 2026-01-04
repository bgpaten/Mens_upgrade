-- Fix RLS policies to allow proper access

-- Drop existing policies first
drop policy if exists "Users can insert own reports" on public.reports;
drop policy if exists "Users can insert own daily logs" on public.daily_logs;

-- Reports: Fix INSERT policy
create policy "Users can insert own reports"
  on public.reports for insert
  with check (auth.uid()::text = user_id::text);

-- Daily Logs: Fix INSERT policy  
create policy "Users can insert own daily logs"
  on public.daily_logs for insert
  with check (auth.uid()::text = user_id::text);

-- Also add UPDATE policies if missing
create policy "Users can update own reports"
  on public.reports for update
  using (auth.uid()::text = user_id::text);

create policy "Users can update own daily logs"
  on public.daily_logs for update
  using (auth.uid()::text = user_id::text);
