"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAccountDate, getLocalTimezone, type AstraProfile } from "@/components/astra/settings/settings-utils";
import { profileSettingsSchema, type ProfileSettingsInput } from "@/lib/validations/settings";

type ProfileSettingsFormProps = {
  profile: AstraProfile | null;
  email: string;
  accountCreatedAt: string | null;
  onSubmit: (values: ProfileSettingsInput) => Promise<void>;
};

export function ProfileSettingsForm({ profile, email, accountCreatedAt, onSubmit }: ProfileSettingsFormProps) {
  const form = useForm<ProfileSettingsInput>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: getDefaultValues(profile),
  });

  useEffect(() => {
    form.reset(getDefaultValues(profile));
  }, [form, profile]);

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Profile Settings" subtitle="Identify the commander and align Astra with your local clock." />
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Display name" error={form.formState.errors.displayName?.message}>
            <Input autoComplete="name" {...form.register("displayName")} />
          </Field>
          <Field label="Timezone" error={form.formState.errors.timezone?.message}>
            <Input placeholder="America/Toronto" {...form.register("timezone")} />
          </Field>
          <Field label="Email">
            <Input readOnly type="email" value={email} />
          </Field>
          <Field label="Account created">
            <Input readOnly value={formatAccountDate(accountCreatedAt)} />
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
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

function getDefaultValues(profile: AstraProfile | null): ProfileSettingsInput {
  return {
    displayName: profile?.display_name ?? "",
    timezone: profile?.timezone ?? getLocalTimezone(),
  };
}
