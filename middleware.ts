import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isMissingTableError } from "@/lib/supabase/errors";
import type { Database } from "@/lib/types/database";

const protectedRoutes = [
  "/dashboard",
  "/tasks",
  "/habits",
  "/time",
  "/meals",
  "/workouts",
  "/reviews",
  "/ai",
  "/settings",
];

const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (isProtectedRoute || isOnboardingRoute)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const hasPreferences = await userHasPreferences(supabase, user.id);
    return NextResponse.redirect(new URL(hasPreferences ? "/dashboard" : "/onboarding", request.url));
  }

  if (user && isProtectedRoute) {
    const hasPreferences = await userHasPreferences(supabase, user.id);

    if (!hasPreferences) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (user && isOnboardingRoute) {
    await ensureProfileExists(supabase, user.id, user.email ?? null);
  }

  return response;
}

async function userHasPreferences(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isMissingTableError(error)) return false;

  return Boolean(data);
}

async function ensureProfileExists(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
  email: string | null,
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      display_name: email?.split("@")[0] ?? "Commander",
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: true,
    },
  );

  if (error && !isMissingTableError(error)) return;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/habits/:path*",
    "/time/:path*",
    "/meals/:path*",
    "/workouts/:path*",
    "/reviews/:path*",
    "/ai/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
