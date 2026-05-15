/**
 * lib/admin/industry-stats.ts
 * ============================================================
 * RESEARCH NOTES — Puerto Rico Tourism Industry Statistics
 * Compiled: May 2025 | Auditable source citations below each stat
 * ============================================================
 *
 * --- VISITOR VOLUME ---
 * Source A: Discover Puerto Rico press release "Record-Breaking 2024" (Jan 2025)
 *   URL: https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html
 *   - 6.6 million air arrivals at LMM International Airport (2024) — +8% vs 2023
 *   - 1.4 million cruise passengers at San Juan Cruise Port (2024) — +10% vs 2023
 *   - 7.3 million room nights booked (2024) — +7% vs 2023
 *   - 101,700 leisure & hospitality jobs by Nov 2024 — +5% YoY (BLS data)
 *
 * Source B: Discover Puerto Rico "Research Update: $18B Economic Impact" (Aug 2025)
 *   URL: https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11
 *   - 7.5 million non-resident visitors (2024)
 *   - 4.2 million local travelers — 11.7M combined
 *   - $11.6B direct tourism spending (2024)
 *   - $18B total economic impact (direct + indirect + induced)
 *   - $8.6B tourism GDP contribution
 *   - 91,000 direct tourism jobs (9.6% of PR workforce)
 *   - 141,000 indirect jobs sustained
 *
 * Source C: Puerto Rico Tourism Company Visitor Profile FY2023-2024
 *   URL: https://tourism.pr.gov/wp-content/uploads/2025/07/Visitor-Profile-Fiscal-Year-2023-2024.pdf
 *   - Average non-resident visitor spend per trip: $1,009
 *   - Average resident visitor spend per trip: $939
 *   - 93% of visitors from mainland US
 *
 * --- ECONOMIC IMPACT ---
 * Source D: "Puerto Rico Tourism Reaches $18B Economic Impact 2024"
 *   URL: https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11
 *   - Food & beverage sector: $4.6B output (largest segment)
 *   - Lodging: $2.1B output
 *   - Air travel: $1.9B output
 *   - Tourism GDP: $8.6B (sector contribution)
 *   - Total economic impact: $18B
 *
 * --- CRUISE SPECIFICALLY ---
 * Source E: Discover Puerto Rico PR Newswire (Jan 2025)
 *   URL: https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html
 *   - 1.4M cruise pax through San Juan (2024), +10% YoY
 *   - ~500 cruise ship calls per year across two terminals
 *   - $201.9M economic impact from cruise season 2023-2024 (News Is My Business)
 *     URL: https://newsismybusiness.com/puerto-ricos-cruise-tourism-season-produced-201-9m-in-2023-2024/
 *
 * Source F: CruiseDig / CruiseTimetables 2025 schedules
 *   URL: https://cruisedig.com/ports/san-juan-puerto-rico
 *   - San Juan is a major Caribbean homeport + port of call
 *   - Pier 3 completed $100M upgrade in 2025 (dredging, ICON-class capable)
 *   - GPH (Global Ports Holding) began ops Feb 15, 2024 at SJCP
 *
 * --- ACT 60 / RELOCATION ---
 * Source G: Multiple legal/RE sources (Procopio, Christie's PR, Uncle Kam)
 *   URL: https://www.procopio.com/resource/puerto-rico-extends-act-60-resident-investor-program
 *   URL: https://christiesrealestatepr.com/blog/act-60-2025-reforms-puerto-rico
 *   - 4,000+ investors under Act 60/22 (Individual Investor) as of 2024
 *   - Program extended through 2055 (2025 legislation)
 *   - New applicants after Dec 31, 2025 face 4% passive income tax
 *   - Existing holders retain 0% rate — grandfathered in
 *   - Must purchase PR real estate within 2 years of decree
 *   - Deadline pressure creating seller's market in luxury segments
 *
 * --- CARIBBEAN / INDUSTRY TRENDS ---
 * Source H: CLIA 2025 State of the Cruise Industry Report
 *   URL: https://cruising.org/news/new-2025-state-cruise-industry-report-shows-cruising-vibrant-tourism-sector-growing-steadily
 *   - 34.6M global cruise passengers (2024)
 *   - 43% of all cruise pax sail Caribbean (largest market)
 *   - Caribbean capacity projected +28% by 2030
 *   - 58 new ships on order 2025-2030
 *   - $168B global cruise economic impact
 *   - 1.6M jobs supported globally by cruise industry
 *
 * Source I: Foundation for Puerto Rico VEP Report 2025
 *   URL: https://foundationforpuertorico.org/wp-content/uploads/2025/11/VEP_Short-Form_Master_2025.pdf
 *   - "No pause for Puerto Rico's Visitor Economy — it will continue to grow"
 *   - Tourism sector outperforming pre-COVID baseline across all metrics
 *
 * ============================================================
 */

export interface IndustryStat {
  label: string;
  value: string;
  delta?: string;
  source: string;
  sourceUrl: string;
  year: number;
  icon?: string;
  category?: "visitors" | "economy" | "cruise" | "jobs" | "act60" | "industry";
}

export const INDUSTRY_STATS: IndustryStat[] = [
  // ---- VISITORS ----
  {
    label: "Total economic impact",
    value: "$18B",
    delta: "New record",
    source: "Discover Puerto Rico Research Update",
    sourceUrl:
      "https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11",
    year: 2024,
    icon: "💎",
    category: "economy",
  },
  {
    label: "Annual non-resident visitors",
    value: "7.5M",
    delta: "+8% YoY",
    source: "Discover Puerto Rico / PR Tourism Co",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html",
    year: 2024,
    icon: "✈️",
    category: "visitors",
  },
  {
    label: "Air arrivals at LMM Airport",
    value: "6.6M",
    delta: "+8% vs 2023",
    source: "Discover Puerto Rico Annual Report",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html",
    year: 2024,
    icon: "🛫",
    category: "visitors",
  },
  {
    label: "Room nights booked",
    value: "7.3M",
    delta: "+7% YoY",
    source: "Discover Puerto Rico (STR / AirDNA data)",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html",
    year: 2024,
    icon: "🏨",
    category: "visitors",
  },
  // ---- ECONOMY ----
  {
    label: "Tourism GDP contribution",
    value: "$8.6B",
    source: "Discover Puerto Rico Research Update",
    sourceUrl:
      "https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11",
    year: 2024,
    icon: "📈",
    category: "economy",
  },
  {
    label: "Direct tourism spending",
    value: "$11.6B",
    source: "Discover Puerto Rico Research Update",
    sourceUrl:
      "https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11",
    year: 2024,
    icon: "💳",
    category: "economy",
  },
  {
    label: "Average visitor spend per trip",
    value: "$1,009",
    source: "PR Tourism Co Visitor Profile FY2023-2024",
    sourceUrl:
      "https://tourism.pr.gov/wp-content/uploads/2025/07/Visitor-Profile-Fiscal-Year-2023-2024.pdf",
    year: 2024,
    icon: "🛍️",
    category: "economy",
  },
  {
    label: "Food & beverage sector output",
    value: "$4.6B",
    source: "Discover Puerto Rico Research Update",
    sourceUrl:
      "https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11",
    year: 2024,
    icon: "🍽️",
    category: "economy",
  },
  // ---- CRUISE ----
  {
    label: "Annual cruise passengers — San Juan",
    value: "1.4M",
    delta: "+10% YoY",
    source: "Discover Puerto Rico / San Juan Cruise Port",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html",
    year: 2024,
    icon: "🚢",
    category: "cruise",
  },
  {
    label: "Cruise season economic impact",
    value: "$201.9M",
    source: "News Is My Business / PR Tourism Co",
    sourceUrl:
      "https://newsismybusiness.com/puerto-ricos-cruise-tourism-season-produced-201-9m-in-2023-2024/",
    year: 2024,
    icon: "⚓",
    category: "cruise",
  },
  {
    label: "Annual cruise ship calls — San Juan",
    value: "~500",
    source: "CruiseDig / San Juan Cruise Port Terminal",
    sourceUrl: "https://cruisedig.com/ports/san-juan-puerto-rico",
    year: 2025,
    icon: "🗓️",
    category: "cruise",
  },
  {
    label: "Caribbean cruise capacity growth by 2030",
    value: "+28%",
    source: "HOPE Research Group / CLIA 2025",
    sourceUrl: "https://www.hoperesearchgroup.com/blog/cruise-capacity-growth-projections",
    year: 2025,
    icon: "🌊",
    category: "cruise",
  },
  // ---- JOBS ----
  {
    label: "Direct tourism jobs in PR",
    value: "91,000",
    delta: "9.6% of workforce",
    source: "Discover Puerto Rico Research Update",
    sourceUrl:
      "https://www.discoverpuertorico.com/industry/research/research-update-puerto-rico-tourism-reaches-18b-economic-impact-2024/2025-08-11",
    year: 2024,
    icon: "👷",
    category: "jobs",
  },
  {
    label: "Leisure & hospitality jobs (record high)",
    value: "101,700",
    delta: "+5% YoY",
    source: "Bureau of Labor Statistics / Discover PR",
    sourceUrl: "https://www.bls.gov/eag/eag.pr.htm",
    year: 2024,
    icon: "🏖️",
    category: "jobs",
  },
  // ---- ACT 60 ----
  {
    label: "Act 60 Individual Investor decree holders",
    value: "4,000+",
    source: "Procopio / Christie's PR Real Estate",
    sourceUrl:
      "https://www.procopio.com/resource/puerto-rico-extends-act-60-resident-investor-program",
    year: 2024,
    icon: "📋",
    category: "act60",
  },
  {
    label: "Act 60 program extended through",
    value: "2055",
    delta: "Apply by Dec 31, 2025 for 0% rate",
    source: "Procopio Law / PR Legislation 2025",
    sourceUrl:
      "https://www.procopio.com/resource/puerto-rico-extends-act-60-resident-investor-program",
    year: 2025,
    icon: "⚖️",
    category: "act60",
  },
  // ---- INDUSTRY / TRENDS ----
  {
    label: "Global cruise passengers (2024)",
    value: "34.6M",
    delta: "4th consecutive growth year",
    source: "CLIA 2025 State of the Cruise Industry",
    sourceUrl:
      "https://cruising.org/news/new-2025-state-cruise-industry-report-shows-cruising-vibrant-tourism-sector-growing-steadily",
    year: 2024,
    icon: "🌍",
    category: "industry",
  },
  {
    label: "Caribbean share of global cruise market",
    value: "43%",
    source: "CLIA 2025 State of the Cruise Industry",
    sourceUrl:
      "https://cruising.org/news/new-2025-state-cruise-industry-report-shows-cruising-vibrant-tourism-sector-growing-steadily",
    year: 2024,
    icon: "🏝️",
    category: "industry",
  },
  {
    label: "New cruise ships on order (2025–2030)",
    value: "58",
    source: "HOPE Research Group cruise orderbook data",
    sourceUrl: "https://www.hoperesearchgroup.com/blog/cruise-capacity-growth-projections",
    year: 2025,
    icon: "🛳️",
    category: "industry",
  },
  {
    label: "PR destination likelihood to visit (2024 vs 2018)",
    value: "+67%",
    delta: "15% → 25% likelihood",
    source: "Strategic Marketing Research & Insights / Discover PR",
    sourceUrl:
      "https://www.prnewswire.com/news-releases/discover-puerto-rico-celebrates-a-record-breaking-2024-and-looks-ahead-to-2025-growth-302362792.html",
    year: 2024,
    icon: "❤️",
    category: "visitors",
  },
];

/** Ticker-ready highlights — short phrases for the marquee */
export const TICKER_STATS = INDUSTRY_STATS.filter((s) =>
  ["$18B", "7.5M", "1.4M", "91,000", "43%", "+28%", "$1,009", "4,000+"].includes(s.value)
);
