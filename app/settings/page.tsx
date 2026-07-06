import { redirect } from "next/navigation";

import { SectionHeader } from "@/components/astra";
import { SettingsModule } from "@/components/astra/settings";
import { Badge } from "@/components/ui/badge";
import { getDatabaseSetupMessage, isMissingTableError } from "@/lib/supabase/errors";
import { createServerDbClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileResult, preferencesResult, habitsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("habits").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  const initialError = [
    formatSetupError(profileResult.error, "public.profiles"),
    formatSetupError(preferencesResult.error, "public.user_preferences"),
    formatSetupError(habitsResult.error, "public.habits"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader title="Control Panel" subtitle="Tune Astra to match your life systems." />
        <Badge className="w-fit px-3 py-2" tone="cyan">
          Personal configuration active
        </Badge>
      </div>

      <SettingsModule
        accountCreatedAt={user.created_at ?? null}
        email={user.email ?? "Email unavailable"}
        initialError={initialError || null}
        initialHabits={habitsResult.data ?? []}
        initialPreferences={preferencesResult.data ?? null}
        initialProfile={profileResult.data ?? null}
        userId={user.id}
      />
    </div>
  );
}

function formatSetupError(error: { message: string; code?: string } | null, tableName: string) {
  if (!error) return null;
  return isMissingTableError(error) ? getDatabaseSetupMessage(tableName) : error.message;
}
