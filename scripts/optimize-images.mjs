/**
 * Image refresh + optimization for PRM cards. Uses plain fetch() against
 * Supabase's REST API so we don't depend on @supabase/supabase-js (which
 * is in a partially-corrupted state in this workspace).
 */
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing env vars");
  process.exit(1);
}
const HEADERS = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

const MAPPINGS = {
  excursions: {
    "old-san-juan-walking": "photo-1565066019713-2886b345a96c",
    "el-morro-fort-tour": "photo-1589402278102-d3a969a78713",
    "casa-bacardi-distillery": "photo-1574713600544-ca13b5d573d5",
    "el-yunque-half-day": "photo-1561271484-3a69b8e31344",
    "el-morro-cristobal-combo": "photo-1665980531889-04e530633bec",
    "bacardi-mixology-class": "photo-1570448690239-4050e1eb92f3",
    "mofongo-mojito-class": "photo-1514362545857-3bc16c4c7d1b",
    "osj-rum-salsa-class": "photo-1555489401-79c274997434",
    "escambron-snorkel": "photo-1582273417870-183e69b360e7",
    "condado-clear-kayak": "photo-1612103183244-7598b792bb05",
    "san-juan-bay-catamaran": "photo-1629908513781-1857f7ec2c8a",
    "osj-self-audio-tour": "photo-1565066021936-08655d8ec3ab",
    "osj-ghost-walk": "photo-1705496464785-4a7dd68e870e",
    "bacardi-osj-combo": "photo-1608232385022-8ba61bec6c59",
    "san-juan-harbor-cruise": "photo-1658296628319-18f20d8525a4",
    "osj-sip-stroll": "photo-1514362545857-3bc16c4c7d1b",
    "san-juan-jet-ski": "photo-1554132267-d06483b00adc",
    "vieques-bio-bay-kayak": "photo-1552957091-7d7113198882",
    "el-yunque-full-day": "photo-1561271484-3a69b8e31344",
    "toro-verde-beast": "photo-1648853070657-6d58398bee93",
    "fajardo-bio-bay-kayak": "photo-1536441918530-c3bae05caf69",
    "culebra-ferry-turtle": "photo-1591025207163-942350e47db2",
    "el-yunque-waterslide": "photo-1597627094703-2a8af9caa749",
    "fajardo-catamaran-icacos": "photo-1629908513781-1857f7ec2c8a",
    "toro-verde-monster": "photo-1649017610908-c0ff38eb29b8",
    "rio-camuy-caves": "photo-1725780632003-894557a203f7",
    "cueva-ventana": "photo-1613069552490-dbb6cb30cd90",
    "charco-azul": "photo-1536625637853-ec02b2b4edbd",
    "hacienda-campo-rico-atv": "photo-1675428604186-a165487f857c",
    "carabali-horseback": "photo-1598711033236-3e0b403a14e8",
    "la-parguera-bio-bay": "photo-1579332550177-31a901024747",
    "three-in-one-day": "photo-1565066019713-2886b345a96c",
    "vieques-bio-bay-from-sj": "photo-1552957091-7d7113198882",
    "rio-grande-loiza-kayak": "photo-1612103183244-7598b792bb05",
    "bacardi-sunset-sail": "photo-1570191668385-84b70602b249",
  },
  future_excursions: {
    "immersive-art": "photo-1593073862407-a3ce22748763",
    "miniature-golf": "photo-1746695086529-3b478aa3fe23",
    "axe-throwing": "photo-1761873763418-2c9596bc8c65",
    "cock-fighting": "photo-1583510383754-35fc1d1eb598",
    "speakeasy": "photo-1570448690239-4050e1eb92f3",
    "jetski-tour-prm": "photo-1554132267-d06483b00adc",
    "walking-tour-prm": "photo-1565066021936-08655d8ec3ab",
    "wine-art-class": "photo-1709011581921-3ab28567996f",
    "pro-wrestling": "photo-1509563268479-0f004cf3f58b",
    "catamaran-prm": "photo-1629908513781-1857f7ec2c8a",
  },
  masterminds: {
    "uncorrelated-pr": "photo-1560439514-4e9645039924",
    "piloto-151": "photo-1553028826-f4804a6dba3b",
    "metro-wbc": "photo-1573496130141-209d200cebd8",
  },
};

const PARAMS = "auto=format&fit=crop&w=800&q=70&fm=webp";

function buildUrl(photoId) {
  return `https://images.unsplash.com/${photoId}?${PARAMS}`;
}
function optimizeExisting(url) {
  const base = url.split("?")[0];
  return `${base}?${PARAMS}`;
}

async function rest(method, path, body) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

let total = 0;
for (const [table, mapping] of Object.entries(MAPPINGS)) {
  const rows = await rest("GET", `${table}?select=id,slug,image_url`);
  console.log(`\n${table} (${rows.length} rows)`);
  let updated = 0;
  for (const row of rows) {
    const photoId = mapping[row.slug];
    const newUrl = photoId ? buildUrl(photoId) : optimizeExisting(row.image_url);
    if (newUrl !== row.image_url) {
      await rest("PATCH", `${table}?id=eq.${row.id}`, { image_url: newUrl });
      updated++;
      const tag = photoId ? "swap+opt " : "optimize ";
      console.log(`  ${tag} ${row.slug}`);
    }
  }
  console.log(`  → ${updated}/${rows.length} updated`);
  total += updated;
}
console.log(`\nDone. ${total} rows updated.`);
