import { Pool } from "pg";

// One pool per server process, per Next.js's own guidance for App Router +
// pg. In dev, Next reloads modules on every edit, which would otherwise
// leak a pool per reload — cached on `global` to survive that.
declare global {
  // eslint-disable-next-line no-var
  var _aspPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy config/.env.example to .env.local and point it at a " +
        "migrated + seeded database (see PROGRESS.md — db/schema.sql, db/seed.py).",
    );
  }
  return new Pool({ connectionString, max: Number(process.env.DATABASE_POOL_MAX) || 10 });
}

export const pool = global._aspPgPool ?? createPool();
if (process.env.NODE_ENV !== "production") global._aspPgPool = pool;
