import "server-only";

import { randomUUID } from "node:crypto";

import { getSqliteDb, prepareCached } from "@/lib/db/sqlite/connection";
import { TABLES, type TableMeta } from "@/lib/db/sqlite/schema";
import type { DbError, DbExecuteResult, DbFilter, DbOperation } from "@/lib/db/types";

const FILTER_SQL: Record<DbFilter["op"], string> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  is: "IS",
};

/**
 * Executes a serializable operation against SQLite with PostgREST-compatible
 * result semantics. `enforceUserId` is the RLS equivalent: every read is
 * scoped to and every write stamped with the given user id.
 */
export function executeSqliteOperation(
  op: DbOperation,
  options: { enforceUserId: string },
): DbExecuteResult {
  const meta = TABLES[op.table];

  if (!meta) {
    // Same code Postgres uses for a missing relation, so isMissingTableError works.
    return failure({ code: "42P01", message: `relation "public.${op.table}" does not exist` });
  }

  try {
    switch (op.action) {
      case "select":
        return runSelect(op, meta, options.enforceUserId);
      case "insert":
      case "upsert":
        return runInsert(op, meta, options.enforceUserId);
      case "update":
        return runUpdate(op, meta, options.enforceUserId);
      case "delete":
        return runDelete(op, meta, options.enforceUserId);
      default:
        return failure({ message: `Unsupported action: ${String(op.action)}` });
    }
  } catch (error) {
    return failure(toDbError(error));
  }
}

function runSelect(op: DbOperation, meta: TableMeta, userId: string): DbExecuteResult {
  const { whereSql, params } = buildWhere(op, meta, userId);
  const orderSql = op.order.length
    ? ` ORDER BY ${op.order
        .map((o) => {
          const nulls =
            o.nullsFirst === undefined ? "" : o.nullsFirst ? " NULLS FIRST" : " NULLS LAST";
          return `${quoteColumn(o.column, meta, op.table)} ${o.ascending ? "ASC" : "DESC"}${nulls}`;
        })
        .join(", ")}`
    : "";
  const limitSql = typeof op.limit === "number" ? ` LIMIT ${Math.max(0, Math.floor(op.limit))}` : "";

  const sql = `SELECT ${buildProjection(op, meta)} FROM "${op.table}"${whereSql}${orderSql}${limitSql}`;
  const rows = prepareCached(sql).all(...params) as Record<string, unknown>[];

  return shapeRows(rows.map((row) => fromDbRow(row, meta)), op);
}

function runInsert(op: DbOperation, meta: TableMeta, userId: string): DbExecuteResult {
  const rows: Record<string, unknown>[] = (
    Array.isArray(op.values) ? op.values : [op.values ?? {}]
  ).map((row) => ({
    ...row,
    id: typeof row.id === "string" && row.id ? row.id : randomUUID(),
    user_id: userId,
  }));

  const db = getSqliteDb();
  const inserted: Record<string, unknown>[] = [];

  // db.transaction keeps multi-row inserts atomic: any constraint failure
  // rolls back the earlier rows instead of leaving a partial batch.
  const insertRow = (row: Record<string, unknown>) => {
    const columns = Object.keys(row).filter((column) => {
      if (row[column] === undefined) return false;
      assertKnownColumn(column, meta, op.table);
      return true;
    });
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((column) => toDbValue(row[column], meta.columns[column]));

    let conflictSql = "";
    if (op.action === "upsert") {
      const conflictColumns = (op.onConflict ?? "id").split(",").map((c) => c.trim());
      conflictColumns.forEach((column) => quoteColumn(column, meta, op.table));

      if (op.ignoreDuplicates) {
        conflictSql = ` ON CONFLICT(${conflictColumns.map((c) => `"${c}"`).join(", ")}) DO NOTHING`;
      } else {
        const updatable = columns.filter(
          (column) => !conflictColumns.includes(column) && column !== "id" && column !== "created_at",
        );
        const assignments = updatable.map((column) => `"${column}" = excluded."${column}"`);
        if (meta.hasUpdatedAt && !updatable.includes("updated_at")) {
          assignments.push(`"updated_at" = strftime('%Y-%m-%dT%H:%M:%fZ','now')`);
        }
        conflictSql = assignments.length
          ? ` ON CONFLICT(${conflictColumns.map((c) => `"${c}"`).join(", ")}) DO UPDATE SET ${assignments.join(", ")}`
          : ` ON CONFLICT(${conflictColumns.map((c) => `"${c}"`).join(", ")}) DO NOTHING`;
      }
    }

    const sql = `INSERT INTO "${op.table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})${conflictSql} RETURNING *`;
    const result = prepareCached(sql).all(...values) as Record<string, unknown>[];
    inserted.push(...result);
  };

  db.transaction(() => {
    rows.forEach(insertRow);
  })();

  if (!op.returning) return { data: null, error: null };

  return shapeRows(inserted.map((row) => fromDbRow(row, meta)), op);
}

function runUpdate(op: DbOperation, meta: TableMeta, userId: string): DbExecuteResult {
  const values = { ...(op.values as Record<string, unknown>) };
  if (meta.hasUpdatedAt && values.updated_at === undefined) {
    values.updated_at = new Date().toISOString();
  }

  const columns = Object.keys(values).filter((column) => {
    if (values[column] === undefined) return false;
    assertKnownColumn(column, meta, op.table);
    // user_id is owned by the session (the RLS equivalent) — never client-settable.
    return column !== "user_id";
  });

  if (columns.length === 0) {
    return op.returning ? shapeRows([], op) : { data: null, error: null };
  }

  const setSql = columns.map((column) => `"${column}" = ?`).join(", ");
  const setParams = columns.map((column) => toDbValue(values[column], meta.columns[column]));
  const { whereSql, params } = buildWhere(op, meta, userId);

  const sql = `UPDATE "${op.table}" SET ${setSql}${whereSql} RETURNING *`;
  const rows = prepareCached(sql).all(...setParams, ...params) as Record<string, unknown>[];

  if (!op.returning) return { data: null, error: null };

  return shapeRows(rows.map((row) => fromDbRow(row, meta)), op);
}

function runDelete(op: DbOperation, meta: TableMeta, userId: string): DbExecuteResult {
  const { whereSql, params } = buildWhere(op, meta, userId);
  const sql = `DELETE FROM "${op.table}"${whereSql} RETURNING *`;
  const rows = prepareCached(sql).all(...params) as Record<string, unknown>[];

  if (!op.returning) return { data: null, error: null };

  return shapeRows(rows.map((row) => fromDbRow(row, meta)), op);
}

function buildProjection(op: DbOperation, meta: TableMeta): string {
  const raw = op.columns?.trim();
  if (!raw || raw === "*") return "*";

  const columns = raw.split(",").map((column) => column.trim());
  return columns.map((column) => quoteColumn(column, meta, op.table)).join(", ");
}

function buildWhere(
  op: DbOperation,
  meta: TableMeta,
  userId: string,
): { whereSql: string; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];

  clauses.push(`"user_id" = ?`);
  params.push(userId);

  for (const filter of op.filters) {
    const column = quoteColumn(filter.column, meta, op.table);
    if (filter.value === null) {
      clauses.push(`${column} ${filter.op === "neq" ? "IS NOT" : "IS"} NULL`);
    } else {
      clauses.push(`${column} ${FILTER_SQL[filter.op]} ?`);
      params.push(toDbValue(filter.value, meta.columns[filter.column]));
    }
  }

  if (op.orFilter) {
    const parts = op.orFilter.split(",").map((segment) => {
      const [column, operator, ...rest] = segment.trim().split(".");
      if (operator !== "eq" || rest.length === 0) {
        throw new Error(`Unsupported or() filter segment: ${segment}`);
      }
      params.push(toDbValue(rest.join("."), meta.columns[column]));
      return `${quoteColumn(column, meta, op.table)} = ?`;
    });
    clauses.push(`(${parts.join(" OR ")})`);
  }

  return { whereSql: ` WHERE ${clauses.join(" AND ")}`, params };
}

function shapeRows(rows: Record<string, unknown>[], op: DbOperation): DbExecuteResult {
  if (op.single === "strict") {
    if (rows.length !== 1) return failure(multipleOrNoRowsError(rows.length));
    return { data: rows[0], error: null };
  }

  if (op.single === "maybe") {
    if (rows.length > 1) return failure(multipleOrNoRowsError(rows.length));
    return { data: rows[0] ?? null, error: null };
  }

  return { data: rows, error: null };
}

function assertKnownColumn(column: string, meta: TableMeta, table: string): void {
  if (!(column in meta.columns)) {
    // Same code Postgres uses; silently dropping the column would lose data.
    throw Object.assign(new Error(`column "${column}" of relation "${table}" does not exist`), {
      dbCode: "42703",
    });
  }
}

function quoteColumn(column: string, meta: TableMeta, table: string): string {
  assertKnownColumn(column, meta, table);
  return `"${column}"`;
}

function toDbValue(value: unknown, kind: string | undefined): unknown {
  if (value === undefined || value === null) return null;
  if (kind === "boolean") return value ? 1 : 0;
  if (kind === "json") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

function fromDbRow(row: Record<string, unknown>, meta: TableMeta): Record<string, unknown> {
  const shaped: Record<string, unknown> = {};
  for (const [column, value] of Object.entries(row)) {
    const kind = meta.columns[column];
    if (value !== null && kind === "boolean") {
      shaped[column] = Boolean(value);
    } else if (value !== null && kind === "json" && typeof value === "string") {
      try {
        shaped[column] = JSON.parse(value);
      } catch {
        shaped[column] = value;
      }
    } else {
      shaped[column] = value;
    }
  }
  return shaped;
}

function multipleOrNoRowsError(count: number): DbError {
  // PGRST116 matches PostgREST's code for single() cardinality violations.
  return {
    code: "PGRST116",
    message: `JSON object requested, ${count === 0 ? "no" : "multiple"} rows returned`,
  };
}

function toDbError(error: unknown): DbError {
  if (error && typeof error === "object") {
    const err = error as { message?: string; dbCode?: string };
    const message = err.message ?? "Database error";
    if (err.dbCode) return { code: err.dbCode, message };
    if (message.includes("UNIQUE constraint failed")) return { code: "23505", message };
    if (message.includes("CHECK constraint failed")) return { code: "23514", message };
    if (message.includes("FOREIGN KEY constraint failed")) return { code: "23503", message };
    return { message };
  }
  return { message: String(error) };
}

function failure(error: DbError): DbExecuteResult {
  return { data: null, error };
}
