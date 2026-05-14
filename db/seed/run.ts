import "dotenv/config";
import { seedSuperAdmin } from "./super-admin";
import { seedExcursions } from "./excursions";
import { seedFutureExcursions } from "./future-excursions";
import { seedMasterminds } from "./masterminds";
import { seedShips } from "./ships";

async function main() {
  console.log("Seeding super admin…");
  await seedSuperAdmin();
  console.log("Seeding excursions…");
  await seedExcursions();
  console.log("Seeding future excursions…");
  await seedFutureExcursions();
  console.log("Seeding masterminds…");
  await seedMasterminds();
  console.log("Seeding ships…");
  await seedShips();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
