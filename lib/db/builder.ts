import type {
  DbExecuteResult,
  DbExecutor,
  DbOperation,
  DbTableBuilder,
  TableName,
} from "@/lib/db/types";

/**
 * Chainable, thenable query builder mirroring the supabase-js subset Astra
 * uses. It only accumulates a serializable DbOperation; the injected executor
 * decides how to run it (direct SQLite on the server, HTTP from the browser).
 */
class QueryBuilder {
  private execution?: Promise<DbExecuteResult>;

  constructor(
    private readonly executor: DbExecutor,
    private readonly op: DbOperation,
  ) {}

  select(columns?: string) {
    this.op.returning = true;
    if (columns) this.op.columns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    return this.filter("eq", column, value);
  }

  neq(column: string, value: unknown) {
    return this.filter("neq", column, value);
  }

  gt(column: string, value: unknown) {
    return this.filter("gt", column, value);
  }

  gte(column: string, value: unknown) {
    return this.filter("gte", column, value);
  }

  lt(column: string, value: unknown) {
    return this.filter("lt", column, value);
  }

  lte(column: string, value: unknown) {
    return this.filter("lte", column, value);
  }

  is(column: string, value: unknown) {
    return this.filter("is", column, value);
  }

  or(filters: string) {
    this.op.orFilter = filters;
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.op.order.push({
      column,
      ascending: options?.ascending !== false,
      nullsFirst: options?.nullsFirst,
    });
    return this;
  }

  limit(count: number) {
    this.op.limit = count;
    return this;
  }

  single() {
    this.op.single = "strict";
    this.op.returning = true;
    return this;
  }

  maybeSingle() {
    this.op.single = "maybe";
    this.op.returning = true;
    return this;
  }

  then<TResult1 = DbExecuteResult, TResult2 = never>(
    onfulfilled?: ((value: DbExecuteResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    // Memoized so awaiting the same builder twice never re-runs the operation.
    this.execution ??= this.executor(this.op);
    return this.execution.then(onfulfilled, onrejected);
  }

  private filter(op: DbOperation["filters"][number]["op"], column: string, value: unknown) {
    this.op.filters.push({ op, column, value });
    return this;
  }
}

export function createTableBuilder<T extends TableName>(
  executor: DbExecutor,
  table: T,
): DbTableBuilder<T> {
  const base = (): Pick<DbOperation, "table" | "filters" | "order" | "returning"> => ({
    table,
    filters: [],
    order: [],
    returning: false,
  });

  const builder = {
    select: (columns?: string) =>
      new QueryBuilder(executor, { ...base(), action: "select", columns, returning: true }),
    insert: (values: unknown) =>
      new QueryBuilder(executor, {
        ...base(),
        action: "insert",
        values: values as DbOperation["values"],
      }),
    upsert: (values: unknown, options?: { onConflict?: string; ignoreDuplicates?: boolean }) =>
      new QueryBuilder(executor, {
        ...base(),
        action: "upsert",
        values: values as DbOperation["values"],
        onConflict: options?.onConflict,
        ignoreDuplicates: options?.ignoreDuplicates,
      }),
    update: (values: unknown) =>
      new QueryBuilder(executor, {
        ...base(),
        action: "update",
        values: values as DbOperation["values"],
      }),
    delete: () => new QueryBuilder(executor, { ...base(), action: "delete" }),
  };

  return builder as unknown as DbTableBuilder<T>;
}
