import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getDbProvider } from "@/lib/db/config";
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

const SESSION_COOKIE = "astra_session";

export async function middleware(request: NextRequest) {
  if (getDbProvider() === "sqlite") {
    return sqliteMiddleware(request);
  }

  return supabaseMiddleware(request);
}

function classifyPath(pathname: string) {
  return {
    isProtectedRoute: protectedRoutes.some((route) => pathname.startsWith(route)),
    isAuthRoute: authRoutes.some((route) => pathname.startsWith(route)),
    isOnboardingRoute: pathname.startsWith("/onboarding"),
  };
}

// SQLite runs only in the Node.js runtime, so the edge middleware verifies the
// session through the /api/auth/session route handler instead of reading the
// database directly. That endpoint also ensures a profile row exists.
async function sqliteMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isProtectedRoute, isAuthRoute, isOnboardingRoute } = classifyPath(pathname);
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    if (isProtectedRoute || isOnboardingRoute) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  let user: unknown = null;
  let onboarded = false;

  try {
    const sessionResponse = await fetch(new URL("/api/auth/session", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    const session = (await sessionResponse.json()) as { user: unknown; onboarded: boolean };
    user = session.user;
    onboarded = session.onboarded;
  } catch {
    // If the app itself is unreachable something bigger is wrong; let the
    // request through so the page-level auth check handles it.
    return NextResponse.next();
  }

  if (!user && (isProtectedRoute || isOnboardingRoute)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(onboarded ? "/dashboard" : "/onboarding", request.url));
  }

  if (user && isProtectedRoute && !onboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

async function supabaseMiddleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  const { isProtectedRoute, isAuthRoute, isOnboardingRoute } = classifyPath(pathname);
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
