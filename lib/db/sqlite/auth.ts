import "server-only";

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { getSqliteDb } from "@/lib/db/sqlite/connection";
import type { DbUser } from "@/lib/db/types";

export const SESSION_COOKIE = "astra_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Self-hosted SQLite deployments are often served over plain HTTP on a LAN;
// a blanket `secure: true` in production would make the browser drop the
// cookie and sign-in would silently loop. Derive it from the app URL instead.
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: appUrl ? appUrl.startsWith("https://") : process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};

type AuthUserRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: string;
};

function toDbUser(row: AuthUserRow): DbUser {
  return {
    id: row.id,
    email: row.email,
    user_metadata: row.display_name ? { display_name: row.display_name } : {},
    created_at: row.created_at,
  };
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createLocalUser(
  email: string,
  password: string,
  displayName?: string | null,
): { user: DbUser } | { error: string } {
  const db = getSqliteDb();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.prepare("SELECT id FROM auth_users WHERE email = ?").get(normalizedEmail);
  if (existing) return { error: "User already registered" };

  const row: AuthUserRow = {
    id: randomUUID(),
    email: normalizedEmail,
    password_hash: hashPassword(password),
    display_name: displayName ?? null,
    created_at: new Date().toISOString(),
  };

  try {
    db.prepare(
      "INSERT INTO auth_users (id, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(row.id, row.email, row.password_hash, row.display_name, row.created_at);
  } catch (error) {
    // Two concurrent signups can both pass the SELECT check above.
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return { error: "User already registered" };
    }
    throw error;
  }

  ensureLocalProfile(row.id, row.display_name ?? normalizedEmail.split("@")[0]);

  return { user: toDbUser(row) };
}

export function verifyLocalCredentials(
  email: string,
  password: string,
): { user: DbUser } | { error: string } {
  const row = getSqliteDb()
    .prepare("SELECT * FROM auth_users WHERE email = ?")
    .get(email.trim().toLowerCase()) as AuthUserRow | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: "Invalid login credentials" };
  }

  return { user: toDbUser(row) };
}

export function createLocalSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  const db = getSqliteDb();
  db.prepare("DELETE FROM auth_sessions WHERE expires_at < ?").run(new Date().toISOString());
  db.prepare("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    hashToken(token),
    userId,
    expiresAt,
  );

  return token;
}

export function getUserBySessionToken(token: string | undefined | null): DbUser | null {
  if (!token) return null;

  const row = getSqliteDb()
    .prepare(
      `SELECT u.* FROM auth_sessions s
       JOIN auth_users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), new Date().toISOString()) as AuthUserRow | undefined;

  return row ? toDbUser(row) : null;
}

export function deleteLocalSession(token: string | undefined | null): void {
  if (!token) return;
  getSqliteDb().prepare("DELETE FROM auth_sessions WHERE token_hash = ?").run(hashToken(token));
}

export function ensureLocalProfile(userId: string, displayName: string | null): void {
  getSqliteDb()
    .prepare(
      `INSERT INTO profiles (id, user_id, display_name)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO NOTHING`,
    )
    .run(randomUUID(), userId, displayName ?? "Commander");
}

export function userHasLocalPreferences(userId: string): boolean {
  return Boolean(
    getSqliteDb().prepare("SELECT id FROM user_preferences WHERE user_id = ?").get(userId),
  );
}
