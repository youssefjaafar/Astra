import type { Database } from "@/lib/types/database";
import type { AppearanceSettingsInput } from "@/lib/validations/settings";

export type AstraProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
export type AstraHabit = Database["public"]["Tables"]["habits"]["Row"];

export type SettingsTab = "profile" | "targets" | "ai" | "appearance" | "data";

export const defaultAppearanceSettings: AppearanceSettingsInput = {
  cockpitIntensity: "balanced",
  motionLevel: "normal",
  backgroundStyle: "static-stars",
};

export const appearanceStorageKey = "astra:appearance-preferences";

export function formatAccountDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Detroit";
}
