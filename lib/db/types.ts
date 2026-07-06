import type { Database } from "@/lib/types/database";

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export type DbError = {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
};

// Discriminated unions matching PostgREST response shapes so `if (error) return;`
// narrows `data` the same way it does with supabase-js.
export type DbListResult<T> = { data: T[]; error: null } | { data: null; error: DbError };
export type DbSingleResult<T> = { data: T; error: null } | { data: null; error: DbError };
export type DbMaybeSingleResult<T> = { data: T | null; error: null } | { data: null; error: DbError };
export type DbMutateResult = { data: null; error: DbError | null };

// --- Serializable query description (sent over HTTP by the browser client) ---

export type DbFilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "is";

export type DbFilter = { op: DbFilterOp; column: string; value: unknown };

export type DbOrder = { column: string; ascending: boolean; nullsFirst?: boolean };

export type DbAction = "select" | "insert" | "update" | "delete" | "upsert";

export type DbOperation = {
  table: string;
  action: DbAction;
  columns?: string;
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
  ignoreDuplicates?: boolean;
  filters: DbFilter[];
  orFilter?: string;
  order: DbOrder[];
  limit?: number;
  returning: boolean;
  single?: "strict" | "maybe";
};

export type DbExecuteResult = { data: unknown; error: DbError | null };

export type DbExecutor = (op: DbOperation) => Promise<DbExecuteResult>;

// --- Auth surface (subset of supabase-js used by Astra) ---

export type DbUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
  created_at?: string;
};

export type DbSession = { user: DbUser };

export type DbAuthResponse = {
  data: { user: DbUser | null; session: DbSession | null };
  error: DbError | null;
};

export interface DbAuth {
  getUser(): Promise<{ data: { user: DbUser | null }; error: DbError | null }>;
  signInWithPassword(credentials: { email: string; password: string }): Promise<DbAuthResponse>;
  signUp(options: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown>; emailRedirectTo?: string };
  }): Promise<DbAuthResponse>;
  signOut(): Promise<{ error: DbError | null }>;
  signInWithOtp(options: {
    email: string;
    options?: { emailRedirectTo?: string };
  }): Promise<{ error: DbError | null }>;
  resend(options: {
    type: string;
    email: string;
    options?: { emailRedirectTo?: string };
  }): Promise<{ error: DbError | null }>;
  exchangeCodeForSession(code: string): Promise<{ error: DbError | null }>;
}

// --- Query builder surface (subset of PostgrestFilterBuilder used by Astra) ---

export interface DbSelectBuilder<R> extends PromiseLike<DbListResult<R>> {
  eq(column: string, value: unknown): DbSelectBuilder<R>;
  neq(column: string, value: unknown): DbSelectBuilder<R>;
  gt(column: string, value: unknown): DbSelectBuilder<R>;
  gte(column: string, value: unknown): DbSelectBuilder<R>;
  lt(column: string, value: unknown): DbSelectBuilder<R>;
  lte(column: string, value: unknown): DbSelectBuilder<R>;
  is(column: string, value: unknown): DbSelectBuilder<R>;
  or(filters: string): DbSelectBuilder<R>;
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): DbSelectBuilder<R>;
  limit(count: number): DbSelectBuilder<R>;
  single(): PromiseLike<DbSingleResult<R>>;
  maybeSingle(): PromiseLike<DbMaybeSingleResult<R>>;
}

export interface DbMutationBuilder<R> extends PromiseLike<DbMutateResult> {
  eq(column: string, value: unknown): DbMutationBuilder<R>;
  select(columns?: string): DbSelectBuilder<R>;
}

export interface DbTableBuilder<T extends TableName> {
  select(columns?: string): DbSelectBuilder<TableRow<T>>;
  insert(values: TableInsert<T> | TableInsert<T>[]): DbMutationBuilder<TableRow<T>>;
  upsert(
    values: TableInsert<T> | TableInsert<T>[],
    options?: { onConflict?: string; ignoreDuplicates?: boolean },
  ): DbMutationBuilder<TableRow<T>>;
  update(values: TableUpdate<T>): DbMutationBuilder<TableRow<T>>;
  delete(): DbMutationBuilder<TableRow<T>>;
}

/**
 * Provider-agnostic client. The SQLite provider implements it directly; the
 * Supabase client satisfies it structurally at runtime and is cast to it.
 */
export interface DbClient {
  from<T extends TableName>(table: T): DbTableBuilder<T>;
  auth: DbAuth;
}
