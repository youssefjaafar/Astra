"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserDbClient } from "@/lib/db/client";
import { readingLogSchema, type ReadingLogInput } from "@/lib/validations/habits";

type ReadingQuickLogProps = {
  userId: string;
  onError: (message: string) => void;
};

export function ReadingQuickLog({ userId, onError }: ReadingQuickLogProps) {
  const supabase = useMemo(() => createBrowserDbClient(), []);
  const [lastLog, setLastLog] = useState<string | null>(null);
  const form = useForm<ReadingLogInput>({
    resolver: zodResolver(readingLogSchema),
    defaultValues: { bookTitle: "", pagesRead: undefined, minutesRead: undefined, notes: "" },
  });

  async function onSubmit(values: ReadingLogInput) {
    onError("");

    const { error } = await supabase.from("reading_logs").insert({
      user_id: userId,
      book_title: values.bookTitle?.trim() || null,
      pages_read: values.pagesRead || null,
      minutes_read: values.minutesRead || null,
      notes: values.notes?.trim() || null,
      logged_at: new Date().toISOString(),
    });

    if (error) {
      onError(error.message);
      return;
    }

    const pages = values.pagesRead ? `${values.pagesRead} pages` : null;
    const minutes = values.minutesRead ? `${values.minutesRead} min` : null;
    setLastLog([pages, minutes].filter(Boolean).join(" / ") || "Reading logged");
    form.reset({ bookTitle: "", pagesRead: undefined, minutesRead: undefined, notes: "" });
  }

  return (
    <GlassCard className="p-5">
      <SectionHeader title="Reading Signal" subtitle="Capture pages or minutes while the signal is fresh." />
      <form className="mt-5 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Input placeholder="Book title" {...form.register("bookTitle")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input min={0} placeholder="Pages read" type="number" {...form.register("pagesRead")} />
          <Input min={0} placeholder="Minutes read" type="number" {...form.register("minutesRead")} />
        </div>
        {form.formState.errors.minutesRead ? <p className="text-sm text-amber-200">{form.formState.errors.minutesRead.message}</p> : null}
        <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
          Log Reading
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-400">{lastLog ?? "Protect one quiet block and keep the reading signal alive."}</p>
    </GlassCard>
  );
}
