import { z } from "zod";

// ai_insights.insight_type is unconstrained text in both schemas, so this
// enum only governs what the insight engine itself emits.
export const insightEngineTypes = ["correlation", "energy_driver", "goal_drift", "win", "data_gap"] as const;

export const insightEngineRequestSchema = z.object({
  windowDays: z.coerce.number().int().min(14).max(90).optional(),
});

export const aiInsightEngineSchema = z.object({
  insights: z
    .array(
      z.object({
        insight_type: z.enum(insightEngineTypes),
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(1200),
        suggested_action: z.string().min(1).max(300),
        supporting_comparison_ids: z.array(z.string()).max(6).default([]),
      }),
    )
    .min(1)
    .max(5),
  data_notes: z.string().max(500).optional(),
});

export type AiInsightEngineResponse = z.infer<typeof aiInsightEngineSchema>;
