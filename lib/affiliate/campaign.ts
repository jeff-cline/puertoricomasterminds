// lib/affiliate/campaign.ts

const MAX_LEN = 64;

function kebab(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface CampaignHandleOpts {
  context: string;     // e.g. "homepage-hero" or "gate-yes"
  decision: string;    // e.g. "click", "yes", "no", "book"
  entitySlug: string;  // e.g. "vieques-bio-bay"
}

export function campaignHandle(opts: CampaignHandleOpts): string {
  const parts = [opts.context, opts.decision, opts.entitySlug]
    .map(kebab)
    .filter((p) => p.length > 0);
  return parts.join("-").slice(0, MAX_LEN).replace(/-$/, "");
}
