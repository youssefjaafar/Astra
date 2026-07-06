import { NextResponse } from "next/server";
import { z } from "zod";

import { fetchCopilotContext } from "@/lib/ai/copilot-context";
import { buildCopilotMessages } from "@/lib/ai/prompts/copilot";
import { AiProviderError, generateJsonCompletion } from "@/lib/ai/provider";
import { createServerDbClient } from "@/lib/db/server";
import { copilotAnswerSchema, copilotRequestSchema } from "@/lib/validations/copilot";

export async function POST(request: Request) {
  try {
    const body = copilotRequestSchema.parse(await request.json());
    const supabase = await createServerDbClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { context, summary, error: contextError } = await fetchCopilotContext(supabase, user.id);

    if (contextError) {
      return NextResponse.json({ error: contextError }, { status: 500 });
    }

    const aiResponse = await generateJsonCompletion({
      messages: buildCopilotMessages(context, body.message),
      temperature: 0.2,
    });
    const answer = copilotAnswerSchema.parse(aiResponse);

    return NextResponse.json({
      answer,
      contextSummary: summary,
      relatedPeriodStart: summary.relatedPeriodStart,
      relatedPeriodEnd: summary.relatedPeriodEnd,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid Copilot request or AI response.",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (error instanceof AiProviderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Copilot request failed.",
      },
      { status: 500 },
    );
  }
}
