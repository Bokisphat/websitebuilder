import type { FusionProperty } from "./fusion-property";

/** Fixed filter groups shown in listings UI; IDs are stable for saved state / analytics. */
export const PROPERTY_TYPE_CATEGORY_OPTIONS = [
  { id: "house-land", label: "House & land" },
  { id: "apartments", label: "Apartments" },
  { id: "townhouse-units", label: "Townhouse / units" },
  { id: "duplex", label: "Duplex" },
  { id: "dual-occupancy", label: "Dual occupancy" },
  { id: "commercial", label: "Commercial" },
  { id: "dual-key", label: "Dual key" },
  { id: "display", label: "Display" },
  { id: "ndis", label: "NDIS" },
  { id: "flexi-living", label: "Flexi living" },
] as const;

export type PropertyTypeCategoryId = (typeof PROPERTY_TYPE_CATEGORY_OPTIONS)[number]["id"];

const PHRASES: Record<PropertyTypeCategoryId, string[]> = {
  "house-land": [
    "house & land",
    "house and land",
    "house/land",
    "h&l",
    "house & land package",
    "house and land package",
    "land package",
    "land & build",
    "land and build",
    "package home",
    "turnkey house",
    "houseland",
  ],
  apartments: [
    "apartment",
    "apartments",
    "apt.",
    "apt ",
    "penthouse",
    "high rise",
    "high-rise",
    "sky home",
    "skyhome",
    "off the plan apartment",
    "off-the-plan apartment",
    "studio apartment",
    "strata apartment",
  ],
  "townhouse-units": [
    "townhouse",
    "town house",
    "townhome",
    "town home",
    "terrace",
    "terrace home",
    "villa unit",
    "strata townhouse",
    "torrens townhouse",
    "strata title townhouse",
    "multi-dwelling",
    "multi dwelling",
    "attached dwelling",
  ],
  duplex: [
    "duplex",
    "duplexes",
    "duplex home",
    "duplex homes",
    "duplex pair",
    "duplex package",
    "duplex project",
    "duplex development",
    "duplex site",
    "duplex block",
    "duplex lot",
    "side by side",
    "side-by-side",
    "semi detached",
    "semi-detached",
    "semi detached pair",
    "semi-detached pair",
    "attached duplex",
    "paired dwelling",
    "mirror image",
    "battle axe duplex",
    "torrens duplex",
    "strata duplex",
    "2 x 2",
    "2x2",
  ],
  "dual-occupancy": [
    "dual occupancy",
    "dual occ",
    "dual occ.",
    "dualoccupancy",
    "dual living home",
    "two homes one lot",
    "two homes one block",
    "dual dwelling project",
    "auxiliary dwelling",
    "secondary dwelling",
  ],
  commercial: [
    "commercial",
    "retail",
    "office suite",
    "office building",
    "warehouse",
    "industrial",
    "bulky goods",
    "showroom",
    "neighbourhood centre",
    "neighborhood centre",
    "industrial unit",
    "business park",
  ],
  "dual-key": [
    "dual key",
    "dual-key",
    "dualkey",
    "dual income",
    "two income stream",
    "two income streams",
    "dual rental",
    "dual letting",
    "double key",
    "double-key",
  ],
  display: [
    "display home",
    "display village",
    "display suite",
    "display property",
    "display dwelling",
    "display centre",
    "display center",
    "show home",
    "show-home",
    "display lot",
  ],
  ndis: [
    "ndis",
    "n.d.i.s.",
    "sda ",
    "sda-compliant",
    "sda compliant",
    "specialist disability",
    "specialist disability accommodation",
    "disability accommodation",
    "supported independent living",
  ],
  "flexi-living": [
    "flexi living",
    "flexi-living",
    "flexi live",
    "flexible living",
    "flexi floorplan",
    "flexi floor plan",
    "flexible floorplan",
    "flexible floor plan",
    "multi-gen",
    "multigenerational",
    "multi-generational",
  ],
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Normalise punctuation so "house & land", "house/land", and "house and land" align. */
export function foldForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/[\u2013\u2014\u2212]+/g, "-")
    .replace(/\.{2,}/g, " ")
    .replace(/[_]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Single flattened string used for category + keyword search (slug, type hints, copy, specs).
 */
export function buildListingSearchBlob(p: FusionProperty): string {
  const slugWords = p.slug ? p.slug.replace(/[-_]+/g, " ") : "";
  return foldForMatch(
    [
      p.type,
      p.typeSearchText,
      p.title,
      p.description,
      p.location,
      slugWords,
      p.bedrooms,
      p.bathrooms,
      p.garage,
      p.price,
      p.yield,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function phraseMatchesInBlob(phrase: string, blob: string): boolean {
  const f = foldForMatch(phrase);
  if (f.length < 2) return false;
  const padded = ` ${blob} `;

  if (padded.includes(` ${f} `)) return true;

  const parts = f.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const re = new RegExp(`(^| )${escapeRegex(parts[0])}( |$)`);
    return re.test(blob);
  }

  const compactBlob = blob.replace(/\s+/g, "");
  const compactPhrase = f.replace(/\s+/g, "");
  if (compactPhrase.length >= 4 && compactBlob.includes(compactPhrase)) return true;

  return false;
}

/** True if this listing should appear when the given category is selected. */
export function propertyMatchesTypeCategory(listing: FusionProperty, categoryId: string): boolean {
  if (!categoryId) return true;
  const phrases = (PHRASES as Record<string, string[] | undefined>)[categoryId];
  if (!phrases?.length) return false;
  const blob = buildListingSearchBlob(listing);
  return phrases.some((phrase) => phraseMatchesInBlob(phrase, blob));
}

/**
 * Free-text box: every whitespace-separated token must match (AND), so "brisbane duplex" needs both.
 */
export function listingMatchesTextQuery(listing: FusionProperty, query: string): boolean {
  const raw = query.trim();
  if (!raw) return true;
  const blob = buildListingSearchBlob(listing);
  const tokens = foldForMatch(raw)
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return true;
  return tokens.every((t) => {
    if (t.length <= 1) return true;
    return phraseMatchesInBlob(t, blob);
  });
}
