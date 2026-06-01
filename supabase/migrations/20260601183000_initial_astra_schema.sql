create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'America/Detroit',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint profiles_user_id_key unique (user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text default 'personal',
  priority text default 'medium',
  status text default 'open',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint tasks_category_check check (category in ('work', 'personal', 'health', 'spiritual', 'learning', 'admin', 'other')),
  constraint tasks_priority_check check (priority in ('low', 'medium', 'high', 'critical')),
  constraint tasks_status_check check (status in ('open', 'in_progress', 'completed', 'cancelled'))
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  target_frequency text default 'daily',
  target_value numeric,
  unit text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint habits_id_user_id_key unique (id, user_id),
  constraint habits_category_check check (category in ('hydration', 'nutrition', 'training', 'reading', 'prayer', 'meditation', 'sleep', 'focus', 'custom'))
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric default 1,
  logged_at timestamptz default now(),
  notes text,
  constraint habit_logs_habit_user_fk foreign key (habit_id, user_id) references public.habits(id, user_id) on delete cascade
);

create table public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_minutes integer,
  quality_score integer,
  notes text,
  created_at timestamptz default now(),
  constraint time_blocks_category_check check (category in ('work', 'deep_work', 'admin', 'meals', 'training', 'reading', 'prayer_meditation', 'social', 'scrolling', 'rest', 'sleep', 'commute', 'other')),
  constraint time_blocks_quality_score_check check (quality_score is null or (quality_score >= 1 and quality_score <= 10)),
  constraint time_blocks_duration_minutes_check check (duration_minutes is null or duration_minutes >= 0),
  constraint time_blocks_time_order_check check (end_time is null or end_time >= start_time)
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null,
  title text not null,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  logged_at timestamptz default now(),
  notes text,
  constraint meals_meal_type_check check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'shake', 'other')),
  constraint meals_calories_check check (calories is null or calories >= 0),
  constraint meals_protein_g_check check (protein_g is null or protein_g >= 0),
  constraint meals_carbs_g_check check (carbs_g is null or carbs_g >= 0),
  constraint meals_fat_g_check check (fat_g is null or fat_g >= 0)
);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml integer not null,
  logged_at timestamptz default now(),
  constraint water_logs_amount_ml_check check (amount_ml > 0)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_type text,
  title text not null,
  duration_minutes integer,
  intensity text,
  logged_at timestamptz default now(),
  notes text,
  constraint workouts_workout_type_check check (workout_type is null or workout_type in ('strength', 'cardio', 'judo', 'mobility', 'walking', 'custom')),
  constraint workouts_intensity_check check (intensity is null or intensity in ('low', 'medium', 'high')),
  constraint workouts_duration_minutes_check check (duration_minutes is null or duration_minutes >= 0)
);

create table public.prayer_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prayer_name text not null,
  completed boolean default true,
  logged_at timestamptz default now(),
  notes text
);

create table public.meditation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null,
  technique text,
  logged_at timestamptz default now(),
  notes text,
  constraint meditation_logs_duration_minutes_check check (duration_minutes > 0)
);

create table public.reading_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_title text,
  pages_read integer,
  minutes_read integer,
  logged_at timestamptz default now(),
  notes text,
  constraint reading_logs_pages_read_check check (pages_read is null or pages_read >= 0),
  constraint reading_logs_minutes_read_check check (minutes_read is null or minutes_read >= 0)
);

create table public.daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_date date not null,
  what_went_well text,
  what_drained_energy text,
  what_to_improve text,
  mood_score integer,
  energy_score integer,
  focus_score integer,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint daily_reviews_user_date_key unique (user_id, review_date),
  constraint daily_reviews_mood_score_check check (mood_score is null or (mood_score >= 1 and mood_score <= 10)),
  constraint daily_reviews_energy_score_check check (energy_score is null or (energy_score >= 1 and energy_score <= 10)),
  constraint daily_reviews_focus_score_check check (focus_score is null or (focus_score >= 1 and focus_score <= 10))
);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  summary text,
  wins text,
  struggles text,
  suggested_corrections text,
  ai_report text,
  created_at timestamptz default now(),
  constraint weekly_reviews_user_week_key unique (user_id, week_start),
  constraint weekly_reviews_date_order_check check (week_end >= week_start)
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_type text not null,
  title text not null,
  body text not null,
  confidence numeric,
  suggested_action text,
  related_period_start timestamptz,
  related_period_end timestamptz,
  created_at timestamptz default now(),
  constraint ai_insights_confidence_check check (confidence is null or (confidence >= 0 and confidence <= 1)),
  constraint ai_insights_period_order_check check (related_period_end is null or related_period_start is null or related_period_end >= related_period_start)
);

create table public.quick_captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_text text not null,
  parsed_type text,
  parsed_payload jsonb,
  status text default 'pending',
  created_at timestamptz default now(),
  constraint quick_captures_status_check check (status in ('pending', 'parsed', 'applied', 'failed', 'ignored'))
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger habits_set_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

create trigger daily_reviews_set_updated_at
before update on public.daily_reviews
for each row execute function public.set_updated_at();

create index profiles_user_id_idx on public.profiles(user_id);

create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_due_at_idx on public.tasks(due_at);
create index tasks_created_at_idx on public.tasks(created_at);
create index tasks_status_idx on public.tasks(status);

create index habits_user_id_idx on public.habits(user_id);
create index habits_category_idx on public.habits(category);

create index habit_logs_user_id_idx on public.habit_logs(user_id);
create index habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index habit_logs_logged_at_idx on public.habit_logs(logged_at);

create index time_blocks_user_id_idx on public.time_blocks(user_id);
create index time_blocks_start_time_idx on public.time_blocks(start_time);
create index time_blocks_created_at_idx on public.time_blocks(created_at);
create index time_blocks_category_idx on public.time_blocks(category);

create index meals_user_id_idx on public.meals(user_id);
create index meals_logged_at_idx on public.meals(logged_at);

create index water_logs_user_id_idx on public.water_logs(user_id);
create index water_logs_logged_at_idx on public.water_logs(logged_at);

create index workouts_user_id_idx on public.workouts(user_id);
create index workouts_logged_at_idx on public.workouts(logged_at);

create index prayer_logs_user_id_idx on public.prayer_logs(user_id);
create index prayer_logs_logged_at_idx on public.prayer_logs(logged_at);

create index meditation_logs_user_id_idx on public.meditation_logs(user_id);
create index meditation_logs_logged_at_idx on public.meditation_logs(logged_at);

create index reading_logs_user_id_idx on public.reading_logs(user_id);
create index reading_logs_logged_at_idx on public.reading_logs(logged_at);

create index daily_reviews_user_id_idx on public.daily_reviews(user_id);
create index daily_reviews_review_date_idx on public.daily_reviews(review_date);
create index daily_reviews_created_at_idx on public.daily_reviews(created_at);

create index weekly_reviews_user_id_idx on public.weekly_reviews(user_id);
create index weekly_reviews_week_start_idx on public.weekly_reviews(week_start);
create index weekly_reviews_created_at_idx on public.weekly_reviews(created_at);

create index ai_insights_user_id_idx on public.ai_insights(user_id);
create index ai_insights_created_at_idx on public.ai_insights(created_at);
create index ai_insights_period_start_idx on public.ai_insights(related_period_start);

create index quick_captures_user_id_idx on public.quick_captures(user_id);
create index quick_captures_created_at_idx on public.quick_captures(created_at);
create index quick_captures_status_idx on public.quick_captures(status);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.time_blocks enable row level security;
alter table public.meals enable row level security;
alter table public.water_logs enable row level security;
alter table public.workouts enable row level security;
alter table public.prayer_logs enable row level security;
alter table public.meditation_logs enable row level security;
alter table public.reading_logs enable row level security;
alter table public.daily_reviews enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.ai_insights enable row level security;
alter table public.quick_captures enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using (auth.uid() = user_id);

create policy "tasks_select_own" on public.tasks for select to authenticated using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (auth.uid() = user_id);

create policy "habits_select_own" on public.habits for select to authenticated using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert to authenticated with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete to authenticated using (auth.uid() = user_id);

create policy "habit_logs_select_own" on public.habit_logs for select to authenticated using (auth.uid() = user_id);
create policy "habit_logs_insert_own" on public.habit_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "habit_logs_update_own" on public.habit_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_delete_own" on public.habit_logs for delete to authenticated using (auth.uid() = user_id);

create policy "time_blocks_select_own" on public.time_blocks for select to authenticated using (auth.uid() = user_id);
create policy "time_blocks_insert_own" on public.time_blocks for insert to authenticated with check (auth.uid() = user_id);
create policy "time_blocks_update_own" on public.time_blocks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "time_blocks_delete_own" on public.time_blocks for delete to authenticated using (auth.uid() = user_id);

create policy "meals_select_own" on public.meals for select to authenticated using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals for insert to authenticated with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals for delete to authenticated using (auth.uid() = user_id);

create policy "water_logs_select_own" on public.water_logs for select to authenticated using (auth.uid() = user_id);
create policy "water_logs_insert_own" on public.water_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "water_logs_update_own" on public.water_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "water_logs_delete_own" on public.water_logs for delete to authenticated using (auth.uid() = user_id);

create policy "workouts_select_own" on public.workouts for select to authenticated using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts for insert to authenticated with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts for delete to authenticated using (auth.uid() = user_id);

create policy "prayer_logs_select_own" on public.prayer_logs for select to authenticated using (auth.uid() = user_id);
create policy "prayer_logs_insert_own" on public.prayer_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "prayer_logs_update_own" on public.prayer_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "prayer_logs_delete_own" on public.prayer_logs for delete to authenticated using (auth.uid() = user_id);

create policy "meditation_logs_select_own" on public.meditation_logs for select to authenticated using (auth.uid() = user_id);
create policy "meditation_logs_insert_own" on public.meditation_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "meditation_logs_update_own" on public.meditation_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meditation_logs_delete_own" on public.meditation_logs for delete to authenticated using (auth.uid() = user_id);

create policy "reading_logs_select_own" on public.reading_logs for select to authenticated using (auth.uid() = user_id);
create policy "reading_logs_insert_own" on public.reading_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "reading_logs_update_own" on public.reading_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reading_logs_delete_own" on public.reading_logs for delete to authenticated using (auth.uid() = user_id);

create policy "daily_reviews_select_own" on public.daily_reviews for select to authenticated using (auth.uid() = user_id);
create policy "daily_reviews_insert_own" on public.daily_reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "daily_reviews_update_own" on public.daily_reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_reviews_delete_own" on public.daily_reviews for delete to authenticated using (auth.uid() = user_id);

create policy "weekly_reviews_select_own" on public.weekly_reviews for select to authenticated using (auth.uid() = user_id);
create policy "weekly_reviews_insert_own" on public.weekly_reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "weekly_reviews_update_own" on public.weekly_reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_reviews_delete_own" on public.weekly_reviews for delete to authenticated using (auth.uid() = user_id);

create policy "ai_insights_select_own" on public.ai_insights for select to authenticated using (auth.uid() = user_id);
create policy "ai_insights_insert_own" on public.ai_insights for insert to authenticated with check (auth.uid() = user_id);
create policy "ai_insights_update_own" on public.ai_insights for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_insights_delete_own" on public.ai_insights for delete to authenticated using (auth.uid() = user_id);

create policy "quick_captures_select_own" on public.quick_captures for select to authenticated using (auth.uid() = user_id);
create policy "quick_captures_insert_own" on public.quick_captures for insert to authenticated with check (auth.uid() = user_id);
create policy "quick_captures_update_own" on public.quick_captures for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quick_captures_delete_own" on public.quick_captures for delete to authenticated using (auth.uid() = user_id);
