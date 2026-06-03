alter table public.user_preferences
  add column if not exists ai_tone text default 'calm',
  add column if not exists ai_recommendation_style text default 'balanced',
  add column if not exists daily_planning_enabled boolean default true,
  add column if not exists weekly_report_enabled boolean default true,
  add column if not exists course_correction_enabled boolean default true;

alter table public.user_preferences
  drop constraint if exists user_preferences_ai_tone_check,
  add constraint user_preferences_ai_tone_check
    check (ai_tone is null or ai_tone in ('calm', 'direct', 'strict', 'encouraging'));

alter table public.user_preferences
  drop constraint if exists user_preferences_ai_recommendation_style_check,
  add constraint user_preferences_ai_recommendation_style_check
    check (ai_recommendation_style is null or ai_recommendation_style in ('minimal', 'balanced', 'detailed'));
