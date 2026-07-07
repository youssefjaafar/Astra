#!/usr/bin/env node
// Manage users in the local SQLite database (the SQLite provider has no
// email-based password reset, so this is the recovery path for a forgotten
// password, and the seeding path for E2E credentials).
//
// Usage:
//   node scripts/local-user.mjs create <email> <password> [displayName]
//   node scripts/local-user.mjs reset-password <email> <newPassword>
//
// Honors ASTRA_SQLITE_PATH (defaults to data/astra.db). Password hashing must
// stay in sync with lib/db/sqlite/auth.ts (scrypt:<salt>:<hash>).

import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const [command, emailArg, password, displayNameArg] = process.argv.slice(2);

if (!["create", "reset-password"].includes(command) || !emailArg || !password) {
  console.error("Usage:");
  console.error("  node scripts/local-user.mjs create <email> <password> [displayName]");
  console.error("  node scripts/local-user.mjs reset-password <email> <newPassword>");
  process.exit(1);
}

if (password.length < 6 || password.length > 128) {
  console.error("Password must be between 6 and 128 characters.");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const dbPath = path.resolve(process.cwd(), process.env.ASTRA_SQLITE_PATH ?? "data/astra.db");

if (!fs.existsSync(dbPath)) {
  console.error(`No database at ${dbPath}.`);
  console.error("Start the app once (npm run dev) so the schema is created, then retry.");
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

function hashPassword(value) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(value, salt, 64).toString("hex")}`;
}

const existing = db.prepare("SELECT id FROM auth_users WHERE email = ?").get(email);

if (command === "create") {
  if (existing) {
    console.error(`User ${email} already exists. Use reset-password instead.`);
    process.exit(1);
  }

  const userId = randomUUID();
  const displayName = displayNameArg ?? email.split("@")[0];
  db.prepare(
    "INSERT INTO auth_users (id, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(userId, email, hashPassword(password), displayName, new Date().toISOString());
  db.prepare(
    "INSERT INTO profiles (id, user_id, display_name) VALUES (?, ?, ?) ON CONFLICT(user_id) DO NOTHING",
  ).run(randomUUID(), userId, displayName);
  console.log(`Created user ${email} (${userId}).`);
} else {
  if (!existing) {
    console.error(`No user found for ${email}.`);
    process.exit(1);
  }

  db.prepare("UPDATE auth_users SET password_hash = ? WHERE id = ?").run(
    hashPassword(password),
    existing.id,
  );
  db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").run(existing.id);
  console.log(`Password reset for ${email}; all sessions signed out.`);
}

db.close();
