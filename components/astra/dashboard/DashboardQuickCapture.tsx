"use client";

import { Loader2, SendHorizonal, Sparkles, WandSparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/types/database";
import { quickCaptureResultSchema, type QuickCaptureResult } from "@/lib/ai/prompts/quick-capture";

const examples = [
  "I drank 500ml water",
  "I worked out chest for 45 minutes",
  "I read 12 pages",
  "Remind me to call Alex tomorrow at 3",
  "I wasted 2 hours scrolling",
  "I prayed Fajr",
  "I meditated for 10 minutes",
];

type SignalEntry = {
  id: string;
  text: string;
  status: "needs_confirmation" | "confirmed" | "cancelled" | "failed";
  summary?: string;
};

type PendingSignal = {
  quickCaptureId: string;
  rawText: string;
  result: QuickCaptureResult;
};

const taskCategories = ["work", "personal", "health", "spiritual", "learning", "admin", "other"] as const;
const taskPriorities = ["low", "medium", "high", "critical"] as const;
const mealTypes = ["breakfast", "lunch", "dinner", "snack", "shake", "other"] as const;
const workoutTypes = ["strength", "cardio", "judo", "mobility", "walking", "custom"] as const;
const intensities = ["low", "medium", "high"] as const;
const timeCategories = [
  "work",
  "deep_work",
  "admin",
  "meals",
  "training",
  "reading",
  "prayer_meditation",
  "social",
  "scrolling",
  "rest",
  "sleep",
  "commute",
  "other",
] as const;

export function DashboardQuickCapture() {
  const router = useRouter();
  const [entry, setEntry] = useState("");
  const [signals, setSignals] = useState<SignalEntry[]>([]);
  const [pendingSignal, setPendingSignal] = useState<PendingSignal | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawText = entry.trim();

    if (!rawText) {
      return;
    }

    setError(null);
    setPendingSignal(null);
    setIsParsing(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message ?? "Sign in before capturing a signal.");
      }

      const { data: capture, error: captureError } = await supabase
        .from("quick_captures")
        .insert({
          user_id: user.id,
          raw_text: rawText,
          status: "pending",
        })
        .select("id")
        .single();

      if (captureError) {
        throw new Error(captureError.message);
      }

      const response = await fetch("/api/ai/quick-capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawText,
          currentDateTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const responseBody = (await response.json()) as unknown;

      if (!response.ok) {
        await supabase.from("quick_captures").update({ status: "failed" }).eq("id", capture.id);
        throw new Error(getApiErrorMessage(responseBody));
      }

      const parsedBody = quickCaptureResultSchema.parse(responseBody);

      await supabase
        .from("quick_captures")
        .update({
          parsed_type: parsedBody.type,
          parsed_payload: parsedBody.payload as Json,
          status: "needs_confirmation",
        })
        .eq("id", capture.id);

      setPendingSignal({
        quickCaptureId: capture.id,
        rawText,
        result: parsedBody,
      });
      setSignals((current) =>
        [
          {
            id: capture.id,
            text: rawText,
            status: "needs_confirmation" as const,
            summary: parsedBody.summary,
          },
          ...current,
        ].slice(0, 6),
      );
      setEntry("");
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Quick Capture failed.");
    } finally {
      setIsParsing(false);
    }
  }

  async function confirmSignal() {
    if (!pendingSignal) {
      return;
    }

    setError(null);
    setIsConfirming(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message ?? "Sign in before confirming a signal.");
      }

      await insertStructuredRecord(user.id, pendingSignal.result);

      const supabaseAfterInsert = createSupabaseBrowserClient();
      const { error: updateError } = await supabaseAfterInsert
        .from("quick_captures")
        .update({
          parsed_type: pendingSignal.result.type,
          parsed_payload: pendingSignal.result.payload as Json,
          status: "confirmed",
        })
        .eq("id", pendingSignal.quickCaptureId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSignals((current) =>
        current.map((signal) =>
          signal.id === pendingSignal.quickCaptureId ? { ...signal, status: "confirmed" } : signal,
        ),
      );
      setPendingSignal(null);
      router.refresh();
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not confirm signal.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function cancelSignal() {
    if (!pendingSignal) {
      return;
    }

    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("quick_captures")
      .update({ status: "cancelled" })
      .eq("id", pendingSignal.quickCaptureId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSignals((current) =>
      current.map((signal) =>
        signal.id === pendingSignal.quickCaptureId ? { ...signal, status: "cancelled" } : signal,
      ),
    );
    setPendingSignal(null);
  }

  async function insertStructuredRecord(userId: string, result: QuickCaptureResult) {
    const payload = result.payload;
    const supabase = createSupabaseBrowserClient();

    if (result.type === "water") {
      const amountMl = getNumber(payload, "amount_ml");
      if (!amountMl) throw new Error("Water amount is missing.");
      await insertOrThrow(
        supabase.from("water_logs").insert({
          user_id: userId,
          amount_ml: amountMl,
          logged_at: getString(payload, "logged_at") ?? new Date().toISOString(),
        }),
      );
      return;
    }

    if (result.type === "meal") {
      await insertOrThrow(
        supabase.from("meals").insert({
          user_id: userId,
          meal_type: getOneOf(payload, "meal_type", mealTypes, "other"),
          title: getString(payload, "title") ?? result.summary,
          calories: getNumberOrNull(payload, "calories"),
          protein_g: getNumberOrNull(payload, "protein_g"),
          carbs_g: getNumberOrNull(payload, "carbs_g"),
          fat_g: getNumberOrNull(payload, "fat_g"),
          logged_at: getString(payload, "logged_at") ?? new Date().toISOString(),
          notes: getStringOrNull(payload, "notes"),
        }),
      );
      return;
    }

    if (result.type === "workout") {
      await insertOrThrow(
        supabase.from("workouts").insert({
          user_id: userId,
          workout_type: getOptionalOneOf(payload, "workout_type", workoutTypes),
          title: getString(payload, "title") ?? result.summary,
          duration_minutes: getNumberOrNull(payload, "duration_minutes"),
          intensity: getOptionalOneOf(payload, "intensity", intensities),
          logged_at: getString(payload, "logged_at") ?? new Date().toISOString(),
          notes: getStringOrNull(payload, "notes"),
        }),
      );
      return;
    }

    if (result.type === "reading") {
      await insertOrThrow(
        supabase.from("reading_logs").insert({
          user_id: userId,
          book_title: getStringOrNull(payload, "book_title"),
          pages_read: getNumberOrNull(payload, "pages_read"),
          minutes_read: getNumberOrNull(payload, "minutes_read"),
          logged_at: getString(payload, "logged_at") ?? new Date().toISOString(),
          notes: getStringOrNull(payload, "notes"),
        }),
      );
      return;
    }

    if (result.type === "prayer") {
      const prayerName = getString(payload, "prayer_name");
      if (!prayerName) throw new Error("Prayer name is missing.");
      await insertOrThrow(
        supabase.from("prayer_logs").insert({
          user_id: userId,
          prayer_name: prayerName,
          completed: getBoolean(payload, "completed", true),
          logged_at: getString(payload, "logged_at") ?? new Date().toISOString(),
          notes: getStringOrNull(payload, "notes"),
        }),
      );
      return;
    }

    if (result.type === "meditation") {
      const durationMinutes = getNumber(payload, "duration_minutes");
      if (!durationMinutes) throw new Error("Meditation duration is missing.");
      await insertOrThrow(
        supabase.from("meditation_logs").insert({
          user_id: userId,
          duration_minutes: durationMinutes,
          technique: getStringOrNull(payload, "technique"),
          logged_at: getString(payload, "logged_at") ?? new Date().toISOString(),
          notes: getStringOrNull(payload, "notes"),
        }),
      );
      return;
    }

    if (result.type === "time_block") {
      await insertOrThrow(
        supabase.from("time_blocks").insert({
          user_id: userId,
          category: getOneOf(payload, "category", timeCategories, "other"),
          title: getString(payload, "title") ?? result.summary,
          duration_minutes: getNumberOrNull(payload, "duration_minutes"),
          start_time: getString(payload, "start_time") ?? new Date().toISOString(),
          end_time: getStringOrNull(payload, "end_time"),
          quality_score: getNumberOrNull(payload, "quality_score"),
          notes: getStringOrNull(payload, "notes"),
        }),
      );
      return;
    }

    if (result.type === "task" || result.type === "reminder") {
      await insertOrThrow(
        supabase.from("tasks").insert({
          user_id: userId,
          title: getString(payload, "title") ?? result.summary,
          description: getStringOrNull(payload, "description"),
          category: getOneOf(payload, "category", taskCategories, "personal"),
          priority: getOneOf(payload, "priority", taskPriorities, "medium"),
          status: "open",
          due_at: getStringOrNull(payload, "due_at"),
        }),
      );
      return;
    }

    if (result.type === "daily_note" || result.type === "unknown") {
      return;
    }
  }

  return (
    <GlassCard glow className="p-5">
      <SectionHeader
        title="Quick Capture"
        subtitle="Drop natural-language life signals here. Astra will interpret the signal, then wait for your confirmation."
        action={<Badge tone="cyan">AI parser online</Badge>}
      />
      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <Textarea
          disabled={isParsing}
          onChange={(event) => setEntry(event.target.value)}
          placeholder={examples[0]}
          value={entry}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap gap-2">
            {examples.slice(0, 3).map((example) => (
              <button
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400 transition hover:border-cyan-200/30 hover:text-cyan-100"
                disabled={isParsing}
                key={example}
                onClick={() => setEntry(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
          <Button className="shrink-0" disabled={isParsing || !entry.trim()} type="submit">
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
            Capture Signal
          </Button>
        </div>
      </form>

      {error ? <p className="mt-4 rounded-md border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">{error}</p> : null}

      {pendingSignal ? (
        <div className="mt-5 rounded-xl border border-cyan-200/20 bg-cyan-200/10 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cyan">Signal detected</Badge>
            <Badge tone="violet">{Math.round(pendingSignal.result.confidence * 100)}% confidence</Badge>
            {pendingSignal.result.requiresConfirmation ? <Badge tone="amber">Needs confirmation</Badge> : null}
          </div>
          <div className="mt-4 flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-200/10">
              <WandSparkles className="h-5 w-5 text-cyan-100" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Astra interpreted this as...</p>
              <p className="mt-1 text-lg font-semibold capitalize text-white">{pendingSignal.result.type.replace("_", " ")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{pendingSignal.result.summary}</p>
              {pendingSignal.result.followUpQuestion ? (
                <p className="mt-3 rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-sm text-amber-100">
                  {pendingSignal.result.followUpQuestion}
                </p>
              ) : null}
              <PayloadPreview payload={pendingSignal.result.payload} />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button disabled={isConfirming} onClick={confirmSignal} type="button">
              {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Confirm log
            </Button>
            <Button disabled={isConfirming} onClick={cancelSignal} type="button" variant="secondary">
              <X className="h-4 w-4" />
              Adjust later
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-200" />
          <p className="text-sm font-medium text-white">Recent Signals</p>
        </div>
        <div className="space-y-2">
          {signals.length > 0 ? (
            signals.map((signal) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300" key={signal.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{signal.text}</span>
                  <Badge tone={signal.status === "confirmed" ? "emerald" : signal.status === "cancelled" ? "neutral" : "violet"}>
                    {signal.status.replace("_", " ")}
                  </Badge>
                </div>
                {signal.summary ? <p className="mt-2 text-xs leading-5 text-slate-500">{signal.summary}</p> : null}
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-500">
              No signals captured in this session yet. Try &quot;I prayed Fajr&quot; or &quot;I wasted 2 hours scrolling&quot;.
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function PayloadPreview({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload).filter(([, value]) => value !== null && value !== undefined);

  if (entries.length === 0) {
    return null;
  }

  return (
    <dl className="mt-3 grid gap-2 sm:grid-cols-2">
      {entries.slice(0, 6).map(([key, value]) => (
        <div className="rounded-md border border-white/10 bg-slate-950/40 p-3" key={key}>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{key}</dt>
          <dd className="mt-1 break-words text-sm text-slate-200">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

async function insertOrThrow<T>(query: PromiseLike<{ error: { message: string } | null; data: T }>) {
  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

function getString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getStringOrNull(payload: Record<string, unknown>, key: string) {
  return getString(payload, key);
}

function getNumber(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getNumberOrNull(payload: Record<string, unknown>, key: string) {
  return getNumber(payload, key);
}

function getBoolean(payload: Record<string, unknown>, key: string, fallback: boolean) {
  const value = payload[key];
  return typeof value === "boolean" ? value : fallback;
}

function getOneOf<const T extends readonly string[]>(
  payload: Record<string, unknown>,
  key: string,
  options: T,
  fallback: T[number],
) {
  const value = payload[key];
  return typeof value === "string" && options.includes(value) ? (value as T[number]) : fallback;
}

function getOptionalOneOf<const T extends readonly string[]>(
  payload: Record<string, unknown>,
  key: string,
  options: T,
) {
  const value = payload[key];
  return typeof value === "string" && options.includes(value) ? (value as T[number]) : null;
}

function getApiErrorMessage(body: unknown) {
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return "AI parsing failed.";
}
