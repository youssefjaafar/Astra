import "server-only";

import { cookies } from "next/headers";

import { createTableBuilder } from "@/lib/db/builder";
import { getDbProvider } from "@/lib/db/config";
import {
  SESSION_COOKIE,
  createLocalSession,
  createLocalUser,
  deleteLocalSession,
  getUserBySessionToken,
  sessionCookieOptions,
  verifyLocalCredentials,
} from "@/lib/db/sqlite/auth";
import { executeSqliteOperation } from "@/lib/db/sqlite/executor";
import type { DbAuth, DbClient, DbError, DbOperation, TableName } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NOT_AUTHENTICATED: DbError = { code: "401", message: "Not authenticated" };
const LOCAL_MODE_UNSUPPORTED: DbError = {
  message: "Email-based auth flows are not available in local SQLite mode. Use your password.",
};

/**
 * Server-side database client. SQLite by default; delegates to the preserved
 * Supabase implementation when NEXT_PUBLIC_ASTRA_DB_PROVIDER=supabase.
 */
export async function createServerDbClient(): Promise<DbClient> {
  if (getDbProvider() === "supabase") {
    return (await createSupabaseServerClient()) as unknown as DbClient;
  }

  return createSqliteServerClient();
}

async function getSessionUser() {
  const cookieStore = await cookies();
  return getUserBySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

function createSqliteServerClient(): DbClient {
  const executor = async (op: DbOperation) => {
    const user = await getSessionUser();
    if (!user) return { data: null, error: NOT_AUTHENTICATED };
    return executeSqliteOperation(op, { enforceUserId: user.id });
  };

  const auth: DbAuth = {
    async getUser() {
      const user = await getSessionUser();
      return { data: { user }, error: null };
    },

    async signInWithPassword({ email, password }) {
      const result = verifyLocalCredentials(email, password);
      if ("error" in result) {
        return { data: { user: null, session: null }, error: { message: result.error } };
      }

      const token = createLocalSession(result.user.id);
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
      return { data: { user: result.user, session: { user: result.user } }, error: null };
    },

    async signUp({ email, password, options }) {
      const displayName =
        typeof options?.data?.display_name === "string" ? options.data.display_name : null;
      const result = createLocalUser(email, password, displayName);
      if ("error" in result) {
        return { data: { user: null, session: null }, error: { message: result.error } };
      }

      const token = createLocalSession(result.user.id);
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
      return { data: { user: result.user, session: { user: result.user } }, error: null };
    },

    async signOut() {
      const cookieStore = await cookies();
      deleteLocalSession(cookieStore.get(SESSION_COOKIE)?.value);
      cookieStore.delete(SESSION_COOKIE);
      return { error: null };
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

  return {
    from: <T extends TableName>(table: T) => createTableBuilder(executor, table),
    auth,
  };
}
