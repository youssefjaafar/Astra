"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { GlassCard } from "@/components/astra";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quickTaskSchema, type QuickTaskInput as QuickTaskInputType } from "@/lib/validations/tasks";

type QuickTaskInputProps = {
  onCreate: (title: string) => Promise<void>;
};

export function QuickTaskInput({ onCreate }: QuickTaskInputProps) {
  const form = useForm<QuickTaskInputType>({
    resolver: zodResolver(quickTaskSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: QuickTaskInputType) {
    await onCreate(values.title);
    form.reset();
  }

  return (
    <GlassCard className="p-4">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1">
          <Input
            placeholder="Finish report tomorrow, Call Alex at 3pm, Pay bill Friday..."
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="mt-2 text-sm text-amber-200">{form.formState.errors.title.message}</p>
          ) : null}
        </div>
        <Button className="shrink-0" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Quick Add
        </Button>
      </form>
    </GlassCard>
  );
}
