"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { GlassCard, SectionHeader } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copilotRequestSchema, type CopilotRequestInput } from "@/lib/validations/copilot";

type AICopilotInputProps = {
  loading: boolean;
  onSubmit: (message: string) => Promise<void>;
};

export function AICopilotInput({ loading, onSubmit }: AICopilotInputProps) {
  const form = useForm<CopilotRequestInput>({
    resolver: zodResolver(copilotRequestSchema),
    defaultValues: {
      message: "",
    },
  });

  async function submit(values: CopilotRequestInput) {
    await onSubmit(values.message);
  }

  return (
    <GlassCard className="p-5" glow>
      <SectionHeader title="Command Input" subtitle="Ask Astra to plan, review, diagnose, or suggest a Course Correction." />
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(submit)}>
        <Textarea
          className="min-h-40 resize-none text-base"
          placeholder="Ask: What should I focus on today?"
          {...form.register("message")}
        />
        {form.formState.errors.message?.message ? (
          <p className="text-sm text-amber-200">{form.formState.errors.message.message}</p>
        ) : null}
        <div className="flex justify-end">
          <Button disabled={loading || form.formState.isSubmitting} type="submit">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Command
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
