// db/seed/ships.ts
// We don't store ships in their own table in v1 — they live in code so the admin
// dropdown is fast and editable in one place. If we later need to attach metadata,
// promote this to a `ships` table.

export const SHIPS = [
  // mega_family
  { name: "Symphony of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Wonder of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Icon of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Oasis of the Seas", line: "Royal Caribbean", segment: "mega_family" },
  { name: "Mardi Gras", line: "Carnival", segment: "mega_family" },
  { name: "Celebration", line: "Carnival", segment: "mega_family" },
  { name: "Jubilee", line: "Carnival", segment: "mega_family" },
  { name: "Disney Magic", line: "Disney", segment: "mega_family" },
  { name: "Disney Fantasy", line: "Disney", segment: "mega_family" },
  { name: "Disney Wish", line: "Disney", segment: "mega_family" },
  { name: "Norwegian Prima", line: "Norwegian", segment: "mega_family" },
  { name: "Norwegian Viva", line: "Norwegian", segment: "mega_family" },
  // premium_mainstream
  { name: "Celebrity Equinox", line: "Celebrity", segment: "premium_mainstream" },
  { name: "Celebrity Apex", line: "Celebrity", segment: "premium_mainstream" },
  { name: "Celebrity Reflection", line: "Celebrity", segment: "premium_mainstream" },
  { name: "Caribbean Princess", line: "Princess", segment: "premium_mainstream" },
  { name: "Royal Princess", line: "Princess", segment: "premium_mainstream" },
  { name: "Sky Princess", line: "Princess", segment: "premium_mainstream" },
  { name: "Eurodam", line: "Holland America", segment: "premium_mainstream" },
  { name: "Nieuw Statendam", line: "Holland America", segment: "premium_mainstream" },
  { name: "MSC Seascape", line: "MSC", segment: "premium_mainstream" },
  { name: "MSC Divina", line: "MSC", segment: "premium_mainstream" },
  // luxury
  { name: "Seabourn Quest", line: "Seabourn", segment: "luxury" },
  { name: "Silver Spirit", line: "Silversea", segment: "luxury" },
  { name: "Seven Seas Splendor", line: "Regent", segment: "luxury" },
  { name: "Viking Sky", line: "Viking Ocean", segment: "luxury" },
  { name: "Viking Star", line: "Viking Ocean", segment: "luxury" },
  { name: "Oceania Riviera", line: "Oceania", segment: "luxury" },
  { name: "Windstar Star Pride", line: "Windstar", segment: "luxury" },
  // fun_ships
  { name: "Carnival Conquest", line: "Carnival", segment: "fun_ships" },
  { name: "Carnival Glory", line: "Carnival", segment: "fun_ships" },
  { name: "Carnival Sunshine", line: "Carnival", segment: "fun_ships" },
] as const;

export type Ship = (typeof SHIPS)[number];

export async function seedShips() {
  // Code-resident list — nothing to upsert. This function exists so the seed
  // runner can call it and log success.
  console.log(`  ship list embedded (${SHIPS.length} ships)`);
}
