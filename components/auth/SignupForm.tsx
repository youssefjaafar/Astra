"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
    const supabase = createSupabaseBrowserClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.session && data.user) {
      await supabase.from("profiles").upsert(
        {
          user_id: data.user.id,
          display_name: values.email.split("@")[0],
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: true,
        },
      );
    }

    router.push("/onboarding");
    router.refresh();
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

      <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Create Command Center
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
