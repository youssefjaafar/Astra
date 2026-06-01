import { z } from "zod";

export const aiCaptureResultSchema = z.object({
  intent: z.enum(["water", "workout", "reminder", "reading", "screen_time", "task", "unknown"]),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  fields: z.record(z.string(), z.string()),
});

export type AiCaptureResult = z.infer<typeof aiCaptureResultSchema>;

export function parseQuickCaptureMock(entry: string): AiCaptureResult {
  const normalized = entry.toLowerCase();

  if (normalized.includes("water") || normalized.includes("drank")) {
    const amount = entry.match(/\d+\s?(ml|l|oz)?/i)?.[0] ?? "amount not detected";
    return {
      intent: "water",
      summary: `Log hydration intake: ${amount}`,
      confidence: 0.82,
      fields: { amount },
    };
  }

  if (normalized.includes("worked out") || normalized.includes("workout") || normalized.includes("gym")) {
    const duration = entry.match(/\d+\s?(minutes|min|hours|hrs)?/i)?.[0] ?? "duration not detected";
    return {
      intent: "workout",
      summary: `Create training log from capture`,
      confidence: 0.76,
      fields: { duration },
    };
  }

  if (normalized.includes("remind")) {
    return {
      intent: "reminder",
      summary: "Draft reminder with natural-language due date",
      confidence: 0.72,
      fields: { text: entry },
    };
  }

  if (normalized.includes("read")) {
    const pages = entry.match(/\d+\s?(pages|page)?/i)?.[0] ?? "pages not detected";
    return {
      intent: "reading",
      summary: `Log reading progress: ${pages}`,
      confidence: 0.8,
      fields: { pages },
    };
  }

  if (normalized.includes("scroll") || normalized.includes("screen")) {
    const duration = entry.match(/\d+\s?(hours|hour|hrs|minutes|min)?/i)?.[0] ?? "duration not detected";
    return {
      intent: "screen_time",
      summary: `Log manual screen time: ${duration}`,
      confidence: 0.78,
      fields: { duration },
    };
  }

  return {
    intent: "unknown",
    summary: "Save as inbox note for later classification",
    confidence: 0.42,
    fields: { text: entry },
  };
}
