import { z } from "zod";

export const copilotRequestSchema = z.object({
  message: z.string().min(1, "Ask Astra something first.").max(2000, "Keep the command under 2000 characters."),
});

export const copilotAnswerSchema = z.object({
  title: z.string().min(1).max(120),
  insight_type: z.string().min(1).max(80),
  answer: z.string().min(1).max(5000),
  confidence: z.coerce.number().min(0).max(1),
  suggested_action: z.string().min(1).max(500).nullable(),
});

export const saveInsightSchema = z.object({
  insight_type: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
  confidence: z.coerce.number().min(0).max(1).nullable().optional(),
  suggested_action: z.string().max(500).nullable().optional(),
  related_period_start: z.string().datetime().nullable().optional(),
  related_period_end: z.string().datetime().nullable().optional(),
});

export type CopilotRequestInput = z.infer<typeof copilotRequestSchema>;
export type CopilotAnswer = z.infer<typeof copilotAnswerSchema>;
export type SaveInsightInput = z.infer<typeof saveInsightSchema>;
