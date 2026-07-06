// SQLite translation of supabase/migrations/*.sql. Keep the CHECK constraints
// in sync with the Zod enums in lib/validations/* and lib/types/database.ts,
// exactly like the Postgres migrations (sync invariant #1 in CLAUDE.md).

export type ColumnKind = "text" | "integer" | "real" | "boolean" | "json";

export type TableMeta = {
  columns: Record<string, ColumnKind>;
  hasUpdatedAt: boolean;
};

const timestamps: Record<string, ColumnKind> = { created_at: "text" };
const auditedTimestamps: Record<string, ColumnKind> = { created_at: "text", updated_at: "text" };

export const TABLES: Record<string, TableMeta> = {
  profiles: {
    columns: {
      id: "text",
      user_id: "text",
      display_name: "text",
      timezone: "text",
      ...auditedTimestamps,
    },
    hasUpdatedAt: true,
  },
  tasks: {
    columns: {
      id: "text",
      user_id: "text",
      title: "text",
      description: "text",
      category: "text",
      priority: "text",
      status: "text",
      due_at: "text",
      completed_at: "text",
      ...auditedTimestamps,
    },
    hasUpdatedAt: true,
  },
  habits: {
    columns: {
      id: "text",
      user_id: "text",
      name: "text",
      category: "text",
      target_frequency: "text",
      target_value: "real",
      unit: "text",
      is_active: "boolean",
      ...auditedTimestamps,
    },
    hasUpdatedAt: true,
  },
  habit_logs: {
    columns: {
      id: "text",
      habit_id: "text",
      user_id: "text",
      value: "real",
      logged_at: "text",
      notes: "text",
    },
    hasUpdatedAt: false,
  },
  time_blocks: {
    columns: {
      id: "text",
      user_id: "text",
      category: "text",
      title: "text",
      start_time: "text",
      end_time: "text",
      duration_minutes: "integer",
      quality_score: "integer",
      notes: "text",
      ...timestamps,
    },
    hasUpdatedAt: false,
  },
  meals: {
    columns: {
      id: "text",
      user_id: "text",
      meal_type: "text",
      title: "text",
      calories: "integer",
      protein_g: "real",
      carbs_g: "real",
      fat_g: "real",
      logged_at: "text",
      notes: "text",
    },
    hasUpdatedAt: false,
  },
  water_logs: {
    columns: {
      id: "text",
      user_id: "text",
      amount_ml: "integer",
      logged_at: "text",
    },
    hasUpdatedAt: false,
  },
  workouts: {
    columns: {
      id: "text",
      user_id: "text",
      workout_type: "text",
      title: "text",
      duration_minutes: "integer",
      intensity: "text",
      logged_at: "text",
      notes: "text",
    },
    hasUpdatedAt: false,
  },
  prayer_logs: {
    columns: {
      id: "text",
      user_id: "text",
      prayer_name: "text",
      completed: "boolean",
      logged_at: "text",
      notes: "text",
    },
    hasUpdatedAt: false,
  },
  meditation_logs: {
    columns: {
      id: "text",
      user_id: "text",
      duration_minutes: "integer",
      technique: "text",
      logged_at: "text",
      notes: "text",
    },
    hasUpdatedAt: false,
  },
  reading_logs: {
    columns: {
      id: "text",
      user_id: "text",
      book_title: "text",
      pages_read: "integer",
      minutes_read: "integer",
      logged_at: "text",
      notes: "text",
    },
    hasUpdatedAt: false,
  },
  daily_reviews: {
    columns: {
      id: "text",
      user_id: "text",
      review_date: "text",
      what_went_well: "text",
      what_drained_energy: "text",
      what_to_improve: "text",
      mood_score: "integer",
      energy_score: "integer",
      focus_score: "integer",
      ai_summary: "text",
      ...auditedTimestamps,
    },
    hasUpdatedAt: true,
  },
  weekly_reviews: {
    columns: {
      id: "text",
      user_id: "text",
      week_start: "text",
      week_end: "text",
      summary: "text",
      wins: "text",
      struggles: "text",
      suggested_corrections: "text",
      ai_report: "text",
      ...timestamps,
    },
    hasUpdatedAt: false,
  },
  ai_insights: {
    columns: {
      id: "text",
      user_id: "text",
      insight_type: "text",
      title: "text",
      body: "text",
      confidence: "real",
      suggested_action: "text",
      related_period_start: "text",
      related_period_end: "text",
      ...timestamps,
    },
    hasUpdatedAt: false,
  },
  quick_captures: {
    columns: {
      id: "text",
      user_id: "text",
      raw_text: "text",
      parsed_type: "text",
      parsed_payload: "json",
      status: "text",
      ...timestamps,
    },
    hasUpdatedAt: false,
  },
  user_preferences: {
    columns: {
      id: "text",
      user_id: "text",
      main_goal: "text",
      wake_time: "text",
      sleep_time: "text",
      water_target_ml: "integer",
      reading_target_minutes: "integer",
      workout_target_weekly: "integer",
      meditation_target_minutes: "integer",
      prayer_tracking_enabled: "boolean",
      screen_time_limit_minutes: "integer",
      ai_tone: "text",
      ai_recommendation_style: "text",
      daily_planning_enabled: "boolean",
      weekly_report_enabled: "boolean",
      course_correction_enabled: "boolean",
      ...auditedTimestamps,
    },
    hasUpdatedAt: true,
  },
};

const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

export const SCHEMA_SQL = `
pragma journal_mode = WAL;

create table if not exists auth_users (
  id text primary key,
  email text not null unique collate nocase,
  password_hash text not null,
  display_name text,
  created_at text not null default (${NOW})
);

create table if not exists auth_sessions (
  token_hash text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  created_at text not null default (${NOW}),
  expires_at text not null
);

create index if not exists auth_sessions_user_id_idx on auth_sessions(user_id);

create table if not exists profiles (
  id text primary key,
  user_id text not null unique references auth_users(id) on delete cascade,
  display_name text,
  timezone text default 'America/Detroit',
  created_at text default (${NOW}),
  updated_at text default (${NOW})
);

create table if not exists tasks (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  title text not null,
  description text,
  category text default 'personal' check (category in ('work','personal','health','spiritual','learning','admin','other')),
  priority text default 'medium' check (priority in ('low','medium','high','critical')),
  status text default 'open' check (status in ('open','in_progress','completed','cancelled')),
  due_at text,
  completed_at text,
  created_at text default (${NOW}),
  updated_at text default (${NOW})
);

create table if not exists habits (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('hydration','nutrition','training','reading','prayer','meditation','sleep','focus','custom')),
  target_frequency text default 'daily',
  target_value real,
  unit text,
  is_active integer default 1,
  created_at text default (${NOW}),
  updated_at text default (${NOW})
);

create table if not exists habit_logs (
  id text primary key,
  habit_id text references habits(id) on delete cascade,
  user_id text not null references auth_users(id) on delete cascade,
  value real default 1,
  logged_at text default (${NOW}),
  notes text
);

create table if not exists time_blocks (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  category text not null check (category in ('work','deep_work','admin','meals','training','reading','prayer_meditation','social','scrolling','rest','sleep','commute','other')),
  title text not null,
  start_time text not null,
  end_time text,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  quality_score integer check (quality_score is null or (quality_score >= 1 and quality_score <= 10)),
  notes text,
  created_at text default (${NOW}),
  check (end_time is null or end_time >= start_time)
);

create table if not exists meals (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack','shake','other')),
  title text not null,
  calories integer check (calories is null or calories >= 0),
  protein_g real check (protein_g is null or protein_g >= 0),
  carbs_g real check (carbs_g is null or carbs_g >= 0),
  fat_g real check (fat_g is null or fat_g >= 0),
  logged_at text default (${NOW}),
  notes text
);

create table if not exists water_logs (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  logged_at text default (${NOW})
);

create table if not exists workouts (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  workout_type text check (workout_type is null or workout_type in ('strength','cardio','judo','mobility','walking','custom')),
  title text not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  intensity text check (intensity is null or intensity in ('low','medium','high')),
  logged_at text default (${NOW}),
  notes text
);

create table if not exists prayer_logs (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  prayer_name text not null,
  completed integer default 1,
  logged_at text default (${NOW}),
  notes text
);

create table if not exists meditation_logs (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes > 0),
  technique text,
  logged_at text default (${NOW}),
  notes text
);

create table if not exists reading_logs (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  book_title text,
  pages_read integer check (pages_read is null or pages_read >= 0),
  minutes_read integer check (minutes_read is null or minutes_read >= 0),
  logged_at text default (${NOW}),
  notes text
);

create table if not exists daily_reviews (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  review_date text not null,
  what_went_well text,
  what_drained_energy text,
  what_to_improve text,
  mood_score integer check (mood_score is null or (mood_score >= 1 and mood_score <= 10)),
  energy_score integer check (energy_score is null or (energy_score >= 1 and energy_score <= 10)),
  focus_score integer check (focus_score is null or (focus_score >= 1 and focus_score <= 10)),
  ai_summary text,
  created_at text default (${NOW}),
  updated_at text default (${NOW}),
  unique (user_id, review_date)
);

create table if not exists weekly_reviews (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  week_start text not null,
  week_end text not null,
  summary text,
  wins text,
  struggles text,
  suggested_corrections text,
  ai_report text,
  created_at text default (${NOW}),
  unique (user_id, week_start),
  check (week_end >= week_start)
);

create table if not exists ai_insights (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  insight_type text not null,
  title text not null,
  body text not null,
  confidence real check (confidence is null or (confidence >= 0 and confidence <= 1)),
  suggested_action text,
  related_period_start text,
  related_period_end text,
  created_at text default (${NOW}),
  check (related_period_end is null or related_period_start is null or related_period_end >= related_period_start)
);

create table if not exists quick_captures (
  id text primary key,
  user_id text not null references auth_users(id) on delete cascade,
  raw_text text not null,
  parsed_type text,
  parsed_payload text,
  status text default 'pending' check (status in ('pending','parsed','applied','failed','ignored','needs_confirmation','confirmed','cancelled')),
  created_at text default (${NOW})
);

create table if not exists user_preferences (
  id text primary key,
  user_id text not null unique references auth_users(id) on delete cascade,
  main_goal text,
  wake_time text,
  sleep_time text,
  water_target_ml integer default 2500 check (water_target_ml is null or water_target_ml > 0),
  reading_target_minutes integer default 20 check (reading_target_minutes is null or reading_target_minutes >= 0),
  workout_target_weekly integer default 3 check (workout_target_weekly is null or workout_target_weekly >= 0),
  meditation_target_minutes integer default 10 check (meditation_target_minutes is null or meditation_target_minutes >= 0),
  prayer_tracking_enabled integer default 1,
  screen_time_limit_minutes integer default 240 check (screen_time_limit_minutes is null or screen_time_limit_minutes >= 0),
  ai_tone text default 'calm' check (ai_tone is null or ai_tone in ('calm','direct','strict','encouraging')),
  ai_recommendation_style text default 'balanced' check (ai_recommendation_style is null or ai_recommendation_style in ('minimal','balanced','detailed')),
  daily_planning_enabled integer default 1,
  weekly_report_enabled integer default 1,
  course_correction_enabled integer default 1,
  created_at text default (${NOW}),
  updated_at text default (${NOW})
);

create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists habits_user_id_idx on habits(user_id);
create index if not exists habit_logs_user_id_idx on habit_logs(user_id);
create index if not exists habit_logs_logged_at_idx on habit_logs(logged_at);
create index if not exists time_blocks_user_id_idx on time_blocks(user_id);
create index if not exists time_blocks_start_time_idx on time_blocks(start_time);
create index if not exists meals_user_id_idx on meals(user_id);
create index if not exists meals_logged_at_idx on meals(logged_at);
create index if not exists water_logs_user_id_idx on water_logs(user_id);
create index if not exists workouts_user_id_idx on workouts(user_id);
create index if not exists prayer_logs_user_id_idx on prayer_logs(user_id);
create index if not exists meditation_logs_user_id_idx on meditation_logs(user_id);
create index if not exists reading_logs_user_id_idx on reading_logs(user_id);
create index if not exists daily_reviews_user_id_idx on daily_reviews(user_id);
create index if not exists weekly_reviews_user_id_idx on weekly_reviews(user_id);
create index if not exists ai_insights_user_id_idx on ai_insights(user_id);
create index if not exists quick_captures_user_id_idx on quick_captures(user_id);
`;
