// lib/affiliate/viator.ts

export type ViatorBaseLevel = "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo";

export interface BuildViatorUrlOpts {
  slug?: string;
  attractionId?: string;
  campaign: string;
  baseLevel?: ViatorBaseLevel;
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} env var is required`);
  return v;
}

function buildQuery(campaign: string): string {
  const params = new URLSearchParams({
    pid: getEnv("VIATOR_PID"),
    mcid: getEnv("VIATOR_MCID"),
    medium: getEnv("VIATOR_MEDIUM"),
    campaign,
  });
  return params.toString();
}

export const VIATOR_FALLBACK_URL_PATH =
  "/Puerto-Rico-attractions/San-Juan-Gate/d36-a19408";

export const VIATOR_FALLBACK_URL =
  `https://www.viator.com${VIATOR_FALLBACK_URL_PATH}`;

export function buildViatorUrl(opts: BuildViatorUrlOpts): string {
  const { slug, attractionId, campaign, baseLevel = "San-Juan" } = opts;
  const query = buildQuery(campaign);

  if (!slug || !attractionId) {
    return `${VIATOR_FALLBACK_URL}?${query}`;
  }
  return `https://www.viator.com/${baseLevel}-attractions/${slug}/${attractionId}?${query}`;
}
