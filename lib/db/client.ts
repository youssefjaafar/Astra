import { createTableBuilder } from "@/lib/db/builder";
import { getDbProvider } from "@/lib/db/config";
import type {
  DbAuth,
  DbClient,
  DbError,
  DbExecuteResult,
  DbOperation,
  DbUser,
  TableName,
} from "@/lib/db/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const LOCAL_MODE_UNSUPPORTED: DbError = {
  message: "Email-based auth flows are not available in local SQLite mode. Use your password.",
};

// The sqlite HTTP client is stateless (per-query builders are created by
// from()), so components calling createBrowserDbClient() in every action
// handler share one instance instead of allocating a new one each call.
// (Supabase's createBrowserClient already memoizes internally.)
let sqliteBrowserClient: DbClient | null = null;

/**
 * Browser-side database client. In SQLite mode all reads/writes go through
 * /api/db and /api/auth/* route handlers (SQLite only exists on the server);
 * in Supabase mode it returns the preserved Supabase browser client.
 */
export function createBrowserDbClient(): DbClient {
  if (getDbProvider() === "supabase") {
    return createSupabaseBrowserClient() as unknown as DbClient;
  }

  sqliteBrowserClient ??= {
    from: <T extends TableName>(table: T) => createTableBuilder(httpExecutor, table),
    auth: httpAuth,
  };

  return sqliteBrowserClient;
}

async function httpExecutor(op: DbOperation): Promise<DbExecuteResult> {
  return postJson("/api/db", op);
}

async function postJson(url: string, body: unknown): Promise<DbExecuteResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as DbExecuteResult | null;

    if (!payload) {
      return { data: null, error: { message: `Request to ${url} failed (${response.status}).` } };
    }

    return payload;
  } catch {
    return { data: null, error: { message: "Could not reach the local Astra database API." } };
  }
}

type AuthPayload = { user: DbUser | null; error: DbError | null };

async function callAuth(action: string, body?: unknown): Promise<AuthPayload> {
  try {
    const response = await fetch(`/api/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });

    const payload = (await response.json().catch(() => null)) as AuthPayload | null;
    if (!payload) {
      return { user: null, error: { message: `Auth request failed (${response.status}).` } };
    }
    return payload;
  } catch {
    return { user: null, error: { message: "Could not reach the local Astra auth API." } };
  }
}

const httpAuth: DbAuth = {
  async getUser() {
    try {
      const response = await fetch("/api/auth/session", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as { user: DbUser | null } | null;
      return { data: { user: payload?.user ?? null }, error: null };
    } catch {
      return { data: { user: null }, error: { message: "Could not load the current session." } };
    }
  },

  async signInWithPassword(credentials) {
    const { user, error } = await callAuth("signin", credentials);
    return { data: { user, session: user ? { user } : null }, error };
  },

  async signUp({ email, password, options }) {
    const { user, error } = await callAuth("signup", {
      email,
      password,
      displayName: typeof options?.data?.display_name === "string" ? options.data.display_name : null,
    });
    return { data: { user, session: user ? { user } : null }, error };
  },

  async signOut() {
    const { error } = await callAuth("signout");
    return { error };
  },

  async signInWithOtp() {
    return { error: LOCAL_MODE_UNSUPPORTED };
  },

  async resend() {
    return { error: LOCAL_MODE_UNSUPPORTED };
  },

  async exchangeCodeForSession() {
    return { error: LOCAL_MODE_UNSUPPORTED };
  },
};
