import "server-only";

import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { SCHEMA_SQL } from "@/lib/db/sqlite/schema";

// Cached on globalThis so dev-server HMR reuses one connection.
const globalStore = globalThis as unknown as {
  __astraSqliteDb?: Database.Database;
  __astraStmtCache?: Map<string, Database.Statement>;
};

export function getSqliteDb(): Database.Database {
  if (globalStore.__astraSqliteDb) return globalStore.__astraSqliteDb;

  // Serverless filesystems are ephemeral: every instance would get its own
  // database and all writes vanish on recycle. Fail loudly instead of
  // silently losing user data.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    throw new Error(
      "Astra's SQLite provider requires a persistent filesystem and cannot run on serverless hosts (Vercel/Lambda/Netlify). " +
        "Set NEXT_PUBLIC_ASTRA_DB_PROVIDER=supabase and configure the Supabase env vars for this deployment, " +
        "or self-host on a machine with durable disk (see VERCEL_DEPLOYMENT.md).",
    );
  }

  const filePath = path.resolve(process.cwd(), process.env.ASTRA_SQLITE_PATH ?? "data/astra.db");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  // NORMAL is the recommended level with WAL: durable against app crashes,
  // and avoids an fsync per transaction (FULL's cost) on every small write.
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);

  globalStore.__astraSqliteDb = db;
  globalStore.__astraStmtCache = new Map();
  return db;
}

// Statement compilation is the fixed cost of every better-sqlite3 query; the
// app issues a small, finite set of parameterized SQL templates, so caching
// prepared statements makes repeat queries (session lookups, dashboard reads)
// skip the parse/plan step entirely.
export function prepareCached(sql: string): Database.Statement {
  const db = getSqliteDb();
  const cache = (globalStore.__astraStmtCache ??= new Map());

  let statement = cache.get(sql);
  if (!statement) {
    statement = db.prepare(sql);
    if (cache.size >= 256) cache.clear();
    cache.set(sql, statement);
  }

  return statement;
}
