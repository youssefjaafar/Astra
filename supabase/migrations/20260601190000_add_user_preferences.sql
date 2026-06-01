create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  main_goal text,
  wake_time time,
  sleep_time time,
  water_target_ml integer default 2500,
  reading_target_minutes integer default 20,
  workout_target_weekly integer default 3,
  meditation_target_minutes integer default 10,
  prayer_tracking_enabled boolean default true,
  screen_time_limit_minutes integer default 240,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_preferences_user_id_key unique (user_id),
  constraint user_preferences_water_target_check check (water_target_ml is null or water_target_ml > 0),
  constraint user_preferences_reading_target_check check (reading_target_minutes is null or reading_target_minutes >= 0),
  constraint user_preferences_workout_target_check check (workout_target_weekly is null or workout_target_weekly >= 0),
  constraint user_preferences_meditation_target_check check (meditation_target_minutes is null or meditation_target_minutes >= 0),
  constraint user_preferences_screen_time_limit_check check (screen_time_limit_minutes is null or screen_time_limit_minutes >= 0)
);

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create index user_preferences_user_id_idx on public.user_preferences(user_id);
create index user_preferences_created_at_idx on public.user_preferences(created_at);

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own" on public.user_preferences
for select to authenticated
using (auth.uid() = user_id);

create policy "user_preferences_insert_own" on public.user_preferences
for insert to authenticated
with check (auth.uid() = user_id);

create policy "user_preferences_update_own" on public.user_preferences
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_preferences_delete_own" on public.user_preferences
for delete to authenticated
using (auth.uid() = user_id);
