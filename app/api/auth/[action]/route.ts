import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE,
  createLocalSession,
  createLocalUser,
  deleteLocalSession,
  ensureLocalProfile,
  getUserBySessionToken,
  sessionCookieOptions,
  userHasLocalPreferences,
  verifyLocalCredentials,
} from "@/lib/db/sqlite/auth";
import { loginSchema } from "@/lib/validations/auth";

type RouteContext = { params: Promise<{ action: string }> };

// Best-effort brute-force guard. In-memory is fine here: SQLite mode always
// runs as a single long-lived Node process.
const AUTH_ATTEMPT_LIMIT = 10;
const AUTH_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const authAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = authAttempts.get(key);

  if (!entry || entry.resetAt < now) {
    authAttempts.set(key, { count: 1, resetAt: now + AUTH_ATTEMPT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > AUTH_ATTEMPT_LIMIT;
}

function databaseErrorResponse(error: unknown) {
  console.error("[astra] local auth failure:", error);
  return NextResponse.json(
    { user: null, error: { message: "Local database error. Check the server logs and retry." } },
    { status: 500 },
  );
}

// Session probe used by the browser client and the middleware. Also reports
// onboarding state and guarantees a profile row, mirroring what the Supabase
// middleware/auth-trigger did.
export async function GET(request: NextRequest, context: RouteContext) {
  const { action } = await context.params;

  if (action !== "session") {
    return NextResponse.json({ error: { message: "Unknown auth action." } }, { status: 404 });
  }

  try {
    const user = getUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

    if (!user) {
      return NextResponse.json({ user: null, onboarded: false });
    }

    ensureLocalProfile(user.id, user.email?.split("@")[0] ?? null);

    return NextResponse.json({ user, onboarded: userHasLocalPreferences(user.id) });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { action } = await context.params;

  try {
    if (action === "signout") {
      deleteLocalSession(request.cookies.get(SESSION_COOKIE)?.value);
      const response = NextResponse.json({ user: null, error: null });
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    if (action !== "signin" && action !== "signup") {
      return NextResponse.json({ error: { message: "Unknown auth action." } }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
      displayName?: string | null;
    } | null;

    const parsed = loginSchema.safeParse({ email: body?.email, password: body?.password });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Enter a valid email and password.";
      return NextResponse.json({ user: null, error: { message } }, { status: 400 });
    }

    const rateKey = `${action}:${parsed.data.email}`;

    if (isRateLimited(rateKey)) {
      return NextResponse.json(
        { user: null, error: { message: "Too many attempts. Wait a few minutes and try again." } },
        { status: 429 },
      );
    }

    const result =
      action === "signin"
        ? verifyLocalCredentials(parsed.data.email, parsed.data.password)
        : createLocalUser(parsed.data.email, parsed.data.password, body?.displayName ?? null);

    if ("error" in result) {
      return NextResponse.json(
        { user: null, error: { message: result.error } },
        { status: action === "signin" ? 401 : 409 },
      );
    }

    authAttempts.delete(rateKey);

    const token = createLocalSession(result.user.id);
    const response = NextResponse.json({ user: result.user, error: null });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
