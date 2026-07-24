"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import {
  appearanceStorageKey,
  defaultAppearanceSettings,
} from "@/components/astra/settings/settings-utils";
import { cn } from "@/lib/utils";
import { appearanceSettingsSchema, type AppearanceSettingsInput } from "@/lib/validations/settings";

type AppearanceSettingsProps = {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export function AppearanceSettings({ onSuccess, onError }: AppearanceSettingsProps) {
  const [loaded, setLoaded] = useState(false);
  const form = useForm<AppearanceSettingsInput>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: defaultAppearanceSettings,
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(appearanceStorageKey);
      if (raw) {
        const parsed = appearanceSettingsSchema.safeParse(JSON.parse(raw));
        if (parsed.success) form.reset(parsed.data);
      }
    } catch {
      onError("Astra could not read local appearance preferences.");
    } finally {
      setLoaded(true);
    }
  }, [form, onError]);

  function save(values: AppearanceSettingsInput) {
    window.localStorage.setItem(appearanceStorageKey, JSON.stringify(values));
    onSuccess("Appearance preferences saved locally.");
  }

  function clearPreferences() {
    window.localStorage.removeItem(appearanceStorageKey);
    form.reset(defaultAppearanceSettings);
    onSuccess("Local appearance preferences cleared.");
  }

  return (
    <GlassCard className="p-5">
      <SectionHeader
        action={
          <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-200/20 bg-cyan-200/10">
            <Sparkles className="h-5 w-5 text-cyan-200" />
          </div>
        }
        title="Design Preferences"
        subtitle="Local cockpit experience settings. Built to move into Supabase later."
      />
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(save)}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Cockpit intensity" error={form.formState.errors.cockpitIntensity?.message}>
            <Select disabled={!loaded} {...form.register("cockpitIntensity")}>
              <option value="calm">Calm</option>
              <option value="balanced">Balanced</option>
              <option value="immersive">Immersive</option>
            </Select>
          </Field>
          <Field label="Motion level" error={form.formState.errors.motionLevel?.message}>
            <Select disabled={!loaded} {...form.register("motionLevel")}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </Select>
          </Field>
          <Field label="Background style" error={form.formState.errors.backgroundStyle?.message}>
            <Select disabled={!loaded} {...form.register("backgroundStyle")}>
              <option value="static-stars">Static stars</option>
              <option value="minimal-dark">Minimal dark</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button onClick={clearPreferences} type="button" variant="secondary">
            <Trash2 className="h-4 w-4" />
            Delete Local UI Preferences
          </Button>
          <Button disabled={!loaded || form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Appearance
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {error ? <p className="text-sm text-amber-200">{error}</p> : null}
    </label>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20 disabled:opacity-60",
      )}
      {...props}
    />
  );
}
