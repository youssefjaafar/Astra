import { NextResponse } from "next/server";
import { z } from "zod";

import { generateJsonCompletion } from "@/lib/ai/provider";
import {
  buildQuickCaptureMessages,
  quickCaptureResultSchema,
} from "@/lib/ai/prompts/quick-capture";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const quickCaptureRequestSchema = z.object({
  rawText: z.string().min(1).max(2000),
  currentDateTime: z.string().datetime().optional(),
  timezone: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = quickCaptureRequestSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const timezone = body.timezone ?? (await getUserTimezone(supabase, user.id)) ?? "America/Detroit";
    const currentDateTime = body.currentDateTime ?? new Date().toISOString();
    const aiResponse = await generateJsonCompletion({
      messages: buildQuickCaptureMessages({
        rawText: body.rawText,
        currentDateTime,
        timezone,
      }),
    });
    const parsed = quickCaptureResultSchema.parse(aiResponse);

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid quick capture request or AI response.",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Quick capture parsing failed.",
      },
      { status: 500 },
    );
  }
}

async function getUserTimezone(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.timezone ?? null;
}
