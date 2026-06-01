"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [magicLinkMessage, setMagicLinkMessage] = useState<string | null>(null);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword(values);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function sendMagicLink() {
    const email = form.getValues("email");
    const parsedEmail = loginSchema.pick({ email: true }).safeParse({ email });

    if (!parsedEmail.success) {
      setError("Enter your email first, then request the magic link.");
      return;
    }

    setError(null);
    setMagicLinkMessage(null);
    setMagicLinkLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setMagicLinkLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMagicLinkMessage("Magic link sent. Check your inbox to enter Command Center.");
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-amber-200">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-amber-200">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="rounded-md border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">{error}</p> : null}
      {magicLinkMessage ? (
        <p className="rounded-md border border-cyan-200/20 bg-cyan-200/10 p-3 text-sm text-cyan-100">{magicLinkMessage}</p>
      ) : null}

      <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Enter Command Center
      </Button>

      <Button className="w-full" disabled={magicLinkLoading} onClick={sendMagicLink} type="button" variant="secondary">
        {magicLinkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Send Magic Link
      </Button>

      <p className="text-center text-sm text-slate-500">
        New to Astra?{" "}
        <Link className="text-cyan-200 transition hover:text-cyan-100" href="/signup">
          Create your cockpit
        </Link>
      </p>
    </form>
  );
}
