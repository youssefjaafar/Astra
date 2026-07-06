import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, getUserBySessionToken } from "@/lib/db/sqlite/auth";
import { executeSqliteOperation } from "@/lib/db/sqlite/executor";
import type { DbOperation } from "@/lib/db/types";

const ACTIONS = new Set(["select", "insert", "update", "delete", "upsert"]);

// Executes serialized query operations for the browser SQLite client. The
// session user is enforced on every read and write (the RLS equivalent), so a
// tampered payload can never touch another user's rows.
export async function POST(request: NextRequest) {
  const user = getUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (!user) {
    return NextResponse.json(
      { data: null, error: { code: "401", message: "Not authenticated" } },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as Partial<DbOperation> | null;

  if (
    !body ||
    typeof body.table !== "string" ||
    typeof body.action !== "string" ||
    !ACTIONS.has(body.action) ||
    !Array.isArray(body.filters ?? []) ||
    !Array.isArray(body.order ?? [])
  ) {
    return NextResponse.json(
      { data: null, error: { message: "Malformed database operation." } },
      { status: 400 },
    );
  }

  const op: DbOperation = {
    table: body.table,
    action: body.action as DbOperation["action"],
    columns: typeof body.columns === "string" ? body.columns : undefined,
    values: body.values,
    onConflict: typeof body.onConflict === "string" ? body.onConflict : undefined,
    ignoreDuplicates: body.ignoreDuplicates === true,
    filters: body.filters ?? [],
    orFilter: typeof body.orFilter === "string" ? body.orFilter : undefined,
    order: body.order ?? [],
    limit: typeof body.limit === "number" ? body.limit : undefined,
    returning: body.returning === true,
    single: body.single === "strict" || body.single === "maybe" ? body.single : undefined,
  };

  const result = executeSqliteOperation(op, { enforceUserId: user.id });
  return NextResponse.json(result);
}
