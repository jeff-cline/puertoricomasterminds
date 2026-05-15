/**
 * Apply Supabase migrations to a remote Postgres in order.
 *
 * Reads SUPABASE_DB_URL from env. Format:
 *   postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres
 *
 * Usage:
 *   SUPABASE_DB_URL=... npx tsx scripts/apply-migrations.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");

async function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error("SUPABASE_DB_URL env var is required");
    process.exit(1);
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Found ${files.length} migration files:`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log("");

  const client = new Client({ connectionString: url });
  await client.connect();
  console.log("Connected to Postgres.\n");

  for (const file of files) {
    const full = path.join(MIGRATIONS_DIR, file);
    const sql = readFileSync(full, "utf8");
    process.stdout.write(`Applying ${file}… `);
    const t0 = Date.now();
    try {
      await client.query(sql);
      console.log(`OK (${Date.now() - t0}ms)`);
    } catch (err) {
      console.log("FAILED");
      console.error(`  ${(err as Error).message}`);
      await client.end();
      process.exit(2);
    }
  }

  await client.end();
  console.log("\nAll migrations applied successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
