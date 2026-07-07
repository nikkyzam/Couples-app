// Applies supabase/schema.sql to your Supabase Postgres. Runs automatically
// before `npm run dev` / `npm run preview`, and can be run directly with
// `npm run db:push`. It's a no-op unless SUPABASE_DB_URL is set, so local-only
// use is never blocked. The schema is idempotent, so re-running is safe.
//
// SUPABASE_DB_URL is your database connection string (contains the DB password)
// — keep it in .env.local (git-ignored). It is NEVER exposed to the browser
// because it is not prefixed with VITE_.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const STRICT = process.argv.includes('--strict')
const done = (code) => process.exit(STRICT ? code : 0)

// Minimal .env loader (so we don't depend on the Vite runtime here).
function loadEnv(file) {
  if (!existsSync(file)) return
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const m = raw.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}
loadEnv('.env.local')
loadEnv('.env')

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.log(
    '[db:push] SUPABASE_DB_URL not set — skipping schema sync (local-only mode).',
  )
  process.exit(0)
}

const schemaPath = fileURLToPath(new URL('../supabase/schema.sql', import.meta.url))
const sql = readFileSync(schemaPath, 'utf8')

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
})

try {
  console.log('[db:push] applying supabase/schema.sql …')
  await client.connect()
  await client.query(sql)
  console.log('[db:push] schema is up to date ✓')
  await client.end()
} catch (err) {
  console.error(`[db:push] could not apply schema: ${err.message}`)
  console.error(
    '[db:push] check SUPABASE_DB_URL (use the Session pooler / Direct connection string with your DB password). Continuing…',
  )
  try {
    await client.end()
  } catch {
    /* ignore */
  }
  done(1)
}
