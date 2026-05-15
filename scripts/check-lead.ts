/**
 * Quick diagnostic: look up a lead by email and report what's in the DB.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/check-lead.ts <email>
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("usage: tsx scripts/check-lead.ts <email>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // 1. Direct lookup
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, email, first_name, last_name, funnel, source_origin, coupon_code, created_at")
    .eq("email", email.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("query error:", error);
    process.exit(2);
  }

  if (!leads || leads.length === 0) {
    console.log(`No lead found for ${email}.`);
  } else {
    console.log(`Found ${leads.length} lead(s) for ${email}:\n`);
    for (const l of leads) {
      console.log(`  id:           ${l.id}`);
      console.log(`  name:         ${l.first_name} ${l.last_name}`);
      console.log(`  email:        ${l.email}`);
      console.log(`  funnel:       ${l.funnel}`);
      console.log(`  source:       ${l.source_origin}`);
      console.log(`  coupon_code:  ${l.coupon_code}`);
      console.log(`  created_at:   ${l.created_at}`);
      console.log("");
    }
  }

  // 2. Overall counts
  const { count: total } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });
  console.log(`Total leads in DB: ${total}`);

  // 3. Last 10 leads
  const { data: recent } = await supabase
    .from("leads")
    .select("email, funnel, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  console.log(`\n10 most recent leads:`);
  for (const r of recent ?? []) {
    console.log(`  ${r.created_at}  ${r.funnel.padEnd(12)}  ${r.email}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
