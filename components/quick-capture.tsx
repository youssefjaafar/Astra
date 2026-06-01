"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { parseQuickCaptureMock, type AiCaptureResult } from "@/lib/ai";
import { quickCaptureSchema, type QuickCaptureInput } from "@/lib/types";

export function QuickCapture() {
  const [result, setResult] = useState<AiCaptureResult | null>(null);
  const form = useForm<QuickCaptureInput>({
    resolver: zodResolver(quickCaptureSchema),
    defaultValues: { entry: "" },
  });

  function onSubmit(values: QuickCaptureInput) {
    setResult(parseQuickCaptureMock(values.entry));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Capture Parser</CardTitle>
        <CardDescription>
          Type a natural-language life signal. This uses a local mock parser until the AI API is connected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Textarea
            placeholder="I drank 500ml water, read 12 pages, or wasted 2 hours scrolling..."
            {...form.register("entry")}
          />
          {form.formState.errors.entry ? (
            <p className="text-sm text-amber-200">{form.formState.errors.entry.message}</p>
          ) : null}
          <Button className="w-full sm:w-auto" type="submit">
            <SendHorizonal className="h-4 w-4" />
            Parse Signal
          </Button>
        </form>

        {result ? (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="cyan">{result.intent.replace("_", " ")}</Badge>
              <Badge tone="violet">{Math.round(result.confidence * 100)}% confidence</Badge>
            </div>
            <p className="text-sm font-medium text-white">{result.summary}</p>
            <dl className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
              {Object.entries(result.fields).map(([key, value]) => (
                <div className="rounded-md bg-slate-950/60 p-3" key={key}>
                  <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</dt>
                  <dd className="mt-1 text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
