import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase/errors";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"), "/dashboard");

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "Authentication link is missing a code. Please try signing in again.");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "Authentication link expired or could not be verified. Please try again.");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: user.email?.split("@")[0] ?? "Commander",
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    );

    if (profileError && !isMissingTableError(profileError)) {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("error", profileError.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
