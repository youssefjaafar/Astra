"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AIBehaviorSettings } from "@/components/astra/settings/AIBehaviorSettings";
import { AppearanceSettings } from "@/components/astra/settings/AppearanceSettings";
import { DailyTargetsForm } from "@/components/astra/settings/DailyTargetsForm";
import { DangerZone } from "@/components/astra/settings/DangerZone";
import { ProfileSettingsForm } from "@/components/astra/settings/ProfileSettingsForm";
import { SettingsTabs } from "@/components/astra/settings/SettingsTabs";
import { TrackingDefaultsSettings } from "@/components/astra/settings/TrackingDefaultsSettings";
import type { AstraHabit, AstraProfile, SettingsTab, UserPreferences } from "@/components/astra/settings/settings-utils";
import { GlassCard } from "@/components/astra";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AIBehaviorSettingsInput, DailyTargetsInput, ProfileSettingsInput } from "@/lib/validations/settings";

type SettingsModuleProps = {
  initialProfile: AstraProfile | null;
  initialPreferences: UserPreferences | null;
  initialHabits: AstraHabit[];
  initialError: string | null;
  userId: string;
  email: string;
  accountCreatedAt: string | null;
};

export function SettingsModule({
  initialProfile,
  initialPreferences,
  initialHabits,
  initialError,
  userId,
  email,
  accountCreatedAt,
}: SettingsModuleProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [error, setError] = useState<string | null>(initialError);
  const [success, setSuccess] = useState<string | null>(null);

  async function saveProfile(values: ProfileSettingsInput) {
    setError(null);
    setSuccess(null);

    const { data, error: saveError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          display_name: values.displayName?.trim() || null,
          timezone: values.timezone,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setProfile(data);
    setSuccess("Profile settings saved.");
  }

  async function saveTargets(values: DailyTargetsInput) {
    await savePreferences(
      {
        wake_time: values.wakeTime || null,
        sleep_time: values.sleepTime || null,
        water_target_ml: values.waterTargetMl ?? null,
        reading_target_minutes: values.readingTargetMinutes ?? null,
        workout_target_weekly: values.workoutTargetWeekly ?? null,
        meditation_target_minutes: values.meditationTargetMinutes ?? null,
        prayer_tracking_enabled: values.prayerTrackingEnabled,
        screen_time_limit_minutes: values.screenTimeLimitMinutes ?? null,
      },
      "Daily targets saved.",
    );
  }

  async function saveAIBehavior(values: AIBehaviorSettingsInput) {
    await savePreferences(
      {
        ai_tone: values.aiTone,
        ai_recommendation_style: values.aiRecommendationStyle,
        daily_planning_enabled: values.dailyPlanningEnabled,
        weekly_report_enabled: values.weeklyReportEnabled,
        course_correction_enabled: values.courseCorrectionEnabled,
      },
      "AI Copilot settings saved.",
    );
  }

  async function savePreferences(payload: Partial<UserPreferences>, successMessage: string) {
    setError(null);
    setSuccess(null);

    const { data, error: saveError } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: userId,
          ...payload,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setPreferences(data);
    setSuccess(successMessage);
  }

  return (
    <div className="space-y-6">
      {(error || success) ? (
        <GlassCard
          className={
            error
              ? "flex items-start gap-3 border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100"
              : "flex items-start gap-3 border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100"
          }
        >
          {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <p>{error ?? success}</p>
        </GlassCard>
      ) : null}

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" ? (
        <ProfileSettingsForm accountCreatedAt={accountCreatedAt} email={email} onSubmit={saveProfile} profile={profile} />
      ) : null}

      {activeTab === "targets" ? (
        <div className="space-y-4">
          <DailyTargetsForm onSubmit={saveTargets} preferences={preferences} />
          <TrackingDefaultsSettings habits={initialHabits} preferences={preferences} />
        </div>
      ) : null}

      {activeTab === "ai" ? <AIBehaviorSettings onSubmit={saveAIBehavior} preferences={preferences} /> : null}

      {activeTab === "appearance" ? (
        <AppearanceSettings onError={setError} onSuccess={setSuccess} />
      ) : null}

      {activeTab === "data" ? (
        <DangerZone onError={setError} onSuccess={setSuccess} />
      ) : null}
    </div>
  );
}
