import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrency under light concurrent load.
// better-sqlite3 is synchronous and single-connection by design, so it
// handles one write at a time. This is fine for a single-server deployment
// but will bottleneck under horizontal scaling or heavy concurrent writes.
//
// Migration path to PostgreSQL when needed:
//   1. Replace `better-sqlite3` + `drizzle-orm/better-sqlite3` with
//      `postgres` (or `@neondatabase/serverless`) + `drizzle-orm/postgres-js`
//   2. Update connection string via DATABASE_URL env var
//   3. Run `drizzle-kit generate` then `drizzle-kit migrate` to produce SQL migrations
//   4. The schema file (schema.ts) requires only minor type adjustments
//      (e.g. `integer` → `serial` for auto-increment primary keys)
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
