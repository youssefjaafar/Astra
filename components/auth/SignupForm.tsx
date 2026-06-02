"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isMissingTableError } from "@/lib/supabase/errors";
import { authEmailSchema, signupSchema, type SignupInput } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupInput) {
    setError(null);
    setConfirmationMessage(null);
    const supabase = createSupabaseBrowserClient();
    const displayName = values.email.split("@")[0];
    const { data, error: signupError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (signupError) {
      setError(getAuthErrorMessage(signupError));
      return;
    }

    if (!data.session || !data.user) {
      setConfirmationMessage("Check your email to confirm your account. After confirmation, Astra will route you into onboarding.");
      form.reset({ email: values.email, password: "", confirmPassword: "" });
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: data.user.id,
        display_name: displayName,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    );

    if (profileError && !isMissingTableError(profileError)) {
      setError(profileError.message);
      return;
    }

    router.replace("/onboarding");
    router.refresh();
  }

  async function resendConfirmation() {
    const parsed = authEmailSchema.safeParse({ email: form.getValues("email") });

    if (!parsed.success) {
      setError("Enter your email first, then request a new confirmation link.");
      return;
    }

    setError(null);
    setConfirmationMessage(null);
    setResendLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    setResendLoading(false);

    if (resendError) {
      setError(getAuthErrorMessage(resendError));
      return;
    }

    setConfirmationMessage("Confirmation link sent. Check your inbox to continue onboarding.");
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="signup-email">
          Email
        </label>
        <Input id="signup-email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-amber-200">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="signup-password">
          Password
        </label>
        <Input id="signup-password" type="password" autoComplete="new-password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-amber-200">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="confirm-password">
          Confirm Password
        </label>
        <Input id="confirm-password" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-amber-200">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-md border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">{error}</p> : null}
      {confirmationMessage ? (
        <p className="rounded-md border border-cyan-200/20 bg-cyan-200/10 p-3 text-sm text-cyan-100">{confirmationMessage}</p>
      ) : null}

      <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Create Command Center
      </Button>

      <Button className="w-full" disabled={resendLoading} onClick={resendConfirmation} type="button" variant="secondary">
        {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Resend Confirmation Link
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="text-cyan-200 transition hover:text-cyan-100" href="/login">
          Enter Command Center
        </Link>
      </p>
    </form>
  );
}
