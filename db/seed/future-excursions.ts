import { getServiceRoleSupabase } from "./_supabase";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70&fm=webp`;

const rows = [
  { slug: "immersive-art", title: "Immersive Art Experience", description: "Walk-in projection-mapped gallery in Santurce featuring Puerto Rican artists.", image_url: img("photo-1593073862407-a3ce22748763"), image_source: "unsplash" as const, category: "art", sort_order: 1 },
  { slug: "miniature-golf", title: "Caribbean Mini-Golf", description: "18-hole tropical mini-golf themed around PR landmarks — El Morro, El Yunque, the Bio Bay.", image_url: img("photo-1746695086529-3b478aa3fe23"), image_source: "unsplash" as const, category: "family", sort_order: 2 },
  { slug: "axe-throwing", title: "Old San Juan Axe Throwing", description: "Friendly axe-throwing lanes in a converted colonial warehouse.", image_url: img("photo-1761873763418-2c9596bc8c65"), image_source: "unsplash" as const, category: "adventure", sort_order: 3 },
  { slug: "cock-fighting", title: "Traditional Gallera Showcase", description: "Historical and cultural exhibition on the gallera's role in Puerto Rican heritage. (Non-live exhibit; cockfighting is federally banned.)", image_url: img("photo-1583510383754-35fc1d1eb598"), image_source: "unsplash" as const, category: "culture", is_sensitive: true, sort_order: 4 },
  { slug: "harlem-globetrotters", title: "Globetrotter-Style Basketball Show", description: "Touring exhibition basketball with trick shots, comedy, and audience interaction.", image_url: img("photo-1546519638-68e109498ffc"), image_source: "unsplash" as const, category: "entertainment", sort_order: 5 },
  { slug: "artisanal-pizza", title: "Artisanal Pizza Making", description: "Wood-fired pizza class with locally-sourced toppings and a wine pairing.", image_url: img("photo-1513104890138-7c749659a591"), image_source: "unsplash" as const, category: "culinary", sort_order: 6 },
  { slug: "speakeasy", title: "Hidden Speakeasy Tour", description: "Prohibition-era cocktail crawl through Old San Juan's hidden bars.", image_url: img("photo-1570448690239-4050e1eb92f3"), image_source: "unsplash" as const, category: "nightlife", sort_order: 7 },
  { slug: "tiki-flotation", title: "Tiki Hut Flotation on the Bay", description: "Anchored floating tiki bars in San Juan Bay you swim out to.", image_url: img("photo-1530053969600-caed2596d242"), image_source: "ai_generated" as const, category: "water", sort_order: 8 },
  { slug: "snorkeling-prm", title: "PRM-Branded Snorkel Excursion", description: "Imagine PRM's own snorkel excursion — small group, our crew, our boat.", image_url: img("photo-1582967788606-a171c1080cb0"), image_source: "unsplash" as const, category: "water", sort_order: 9 },
  { slug: "jetski-tour-prm", title: "PRM Jet Ski Bay Tour", description: "Guided jet ski circuit around San Juan Bay with El Morro photo stops.", image_url: img("photo-1554132267-d06483b00adc"), image_source: "unsplash" as const, category: "water", sort_order: 10 },
  { slug: "walking-tour-prm", title: "PRM Walking Tour", description: "Curated Old San Juan walking tour with PRM-trained local guides.", image_url: img("photo-1565066021936-08655d8ec3ab"), image_source: "unsplash" as const, category: "history", sort_order: 11 },
  { slug: "mixology", title: "Mixology Experience", description: "Mixology lab teaching pitorro, rum, and tropical cocktail techniques.", image_url: img("photo-1514362545857-3bc16c4c7d1b"), image_source: "unsplash" as const, category: "culinary", sort_order: 12 },
  { slug: "live-local-music", title: "Live Local Music Showcase", description: "Rotating series featuring bomba, plena, and contemporary PR artists.", image_url: img("photo-1501386761578-eac5c94b800a"), image_source: "unsplash" as const, category: "music", sort_order: 13 },
  { slug: "dance-lessons", title: "Salsa & Bomba Dance Lessons", description: "Beginner-friendly group lessons with a live drummer.", image_url: img("photo-1504609813442-a8924e83f76e"), image_source: "unsplash" as const, category: "music", sort_order: 14 },
  { slug: "wine-art-class", title: "Wine & Art Class", description: "Sip-and-paint with Caribbean-themed instructors.", image_url: img("photo-1709011581921-3ab28567996f"), image_source: "unsplash" as const, category: "art", sort_order: 15 },
  { slug: "caribbean-art-auction", title: "Caribbean Art Auction", description: "Curated auction of Caribbean artists with proceeds to local arts programs.", image_url: img("photo-1531913764164-f85c52e6e654"), image_source: "unsplash" as const, category: "art", sort_order: 16 },
  { slug: "pro-wrestling", title: "Professional Wrestling Show", description: "Touring/local pro wrestling event in San Juan.", image_url: img("photo-1509563268479-0f004cf3f58b"), image_source: "unsplash" as const, category: "entertainment", sort_order: 17 },
  { slug: "catamaran-prm", title: "PRM Catamaran Day Trip", description: "Half-day catamaran sail with snorkel, lunch, and open bar.", image_url: img("photo-1629908513781-1857f7ec2c8a"), image_source: "unsplash" as const, category: "water", sort_order: 18 },
];

export async function seedFutureExcursions() {
  const supabase = getServiceRoleSupabase();
  const data = rows.map((r) => ({
    ...r,
    is_active: true,
    is_sensitive: r.is_sensitive ?? false,
  }));
  const { error } = await (supabase as any)
    .from("future_excursions")
    .upsert(data, { onConflict: "slug" });
  if (error) throw error;
  console.log(`  upserted ${rows.length} future excursions (1 flagged sensitive)`);
}
