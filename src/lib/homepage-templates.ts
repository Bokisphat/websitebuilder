import type { SiteTemplateId } from "./site-model";

export type HomeTemplateStatus = "live" | "coming_soon";

export type HomeTemplateItem = {
  id: string;
  name: string;
  description: string;
  /** When live, which builder template to load. */
  siteTemplateId?: SiteTemplateId;
  status: HomeTemplateStatus;
  /** Accent for card preview (live + coming). */
  previewPrimary: string;
  previewSecondary: string;
  /** Short label for who it targets. */
  audienceLabel: string;
  /**
   * Path from site root to a preview image in `/public` (e.g. `/templates/wealth-creation.svg`).
   * When omitted, the home page uses the generated abstract `TemplatePreviewBlock` and `previewPrimary` / `previewSecondary`.
   * Replace with PNG/WebP screenshots later without changing the card layout.
   */
  thumbnail?: string;
};

/**
 * Marketing catalogue: audience entry points. Live cards open the builder with a matching preset; High Yield is also available from the builder gallery.
 * Order: grid is `lg:grid-cols-3`, so Real Estate Theme 1–3 render on one row as items 7–9.
 */
export const HOMEPAGE_TEMPLATE_ITEMS: HomeTemplateItem[] = [
  {
    id: "wealth-creation",
    name: "General wealth creation",
    description:
      "Position long-term property wealth, tax-aware structures, and retirement outcomes for investors who want a broad advisory story.",
    siteTemplateId: "advisory",
    status: "live",
    previewPrimary: "#2563eb",
    previewSecondary: "#0ea5e9",
    audienceLabel: "Broad investors & wealth-focused buyers",
    thumbnail: "/templates/wealth-creation.svg",
  },
  {
    id: "positive-cashflow",
    name: "Positive cashflow",
    description:
      "Dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA) — rental return and stress-tested holding power for investors who need yield clarity before they enquire.",
    siteTemplateId: "positiveCashflow",
    status: "live",
    previewPrimary: "#0f766e",
    previewSecondary: "#0e7490",
    audienceLabel: "Yield and income investors",
    thumbnail: "/templates/positive-cashflow.svg",
  },
  {
    id: "smsf",
    name: "SMSF",
    description:
      "WT Capital–style SMSF property journey: wealth-within-reach hero, Discovery / Research / Strategy stages, macro research pillars, listings, testimonials, and book-a-strategy-call forms — serious compliance tone.",
    siteTemplateId: "smsfStrategy",
    status: "live",
    previewPrimary: "#1e3a5f",
    previewSecondary: "#c9a74a",
    audienceLabel: "SMSF trustees & super-led investors",
    thumbnail: "/templates/smsf.svg",
  },
  {
    id: "first-home",
    name: "First home buyers",
    description:
      "Patterned on First Home Buyers Australia (FHBA): grants and schemes in plain English, deposit pathway, pre-approval context, starter-home listings, and patient CTAs — ideal for new entrants.",
    siteTemplateId: "firstHomeBuyers",
    status: "live",
    previewPrimary: "#0284c7",
    previewSecondary: "#f97316",
    audienceLabel: "First-time buyers & scheme researchers",
    thumbnail: "/templates/first-home.svg",
  },
  {
    id: "dual-income",
    name: "Dual Income Properties",
    description:
      "Portal-style layout inspired by leading investment property sites: warm canvas, gold and navy accents, category-led copy, featured listings, and dual-income education — multi-dwelling and two rent lines without the clutter.",
    siteTemplateId: "dualIncome",
    status: "live",
    previewPrimary: "#b45309",
    previewSecondary: "#1e3a8a",
    audienceLabel: "Dual-key, duplex, portal funnels",
    thumbnail: "/templates/dual-income.svg",
  },
  {
    id: "ndis-properties",
    name: "NDIS Properties",
    description:
      "Specialist Disability Accommodation (SDA) and disability-housing journeys — design categories, checklist tone, enquiry capture, and Fusion listings for investor due diligence.",
    siteTemplateId: "ndisProperties",
    status: "live",
    previewPrimary: "#0369a1",
    previewSecondary: "#7c3aed",
    audienceLabel: "SDA investors & disability housing",
    thumbnail: "/templates/ndis-properties.svg",
  },
  {
    id: "real-estate-theme-1",
    name: "Real Estate Theme 1",
    description:
      "Consumer-style search experience inspired by leading real estate portals: bright layout, bold blue accents, discovery hero, and listing cards up front — tailored for lifestyle buyers, relocations, and growth corridors.",
    siteTemplateId: "lifestyleCorridors",
    status: "live",
    previewPrimary: "#2563eb",
    previewSecondary: "#38bdf8",
    audienceLabel: "Portal-style listings & buyer discovery",
    thumbnail: "/templates/market-room.svg",
  },
  {
    id: "real-estate-theme-2",
    name: "Real Estate Theme 2",
    description:
      "Woodards-inspired agency layout: connecting people with property, heritage trust tone, buy / sell / rent paths, suburb insight, appraisals, and a deep green & gold brand canvas.",
    siteTemplateId: "realEstateTheme2",
    status: "live",
    previewPrimary: "#1a3a2f",
    previewSecondary: "#b8945a",
    audienceLabel: "Full-service residential & network brands",
    thumbnail: "/templates/real-estate-theme-2.svg",
  },
  {
    id: "real-estate-theme-3",
    name: "Real Estate Theme 3",
    description:
      "Create Real Estate–style premier partner site: dream-home headline, polished navy & gold accents, partnership-led steps, and Fusion listings at the centre.",
    siteTemplateId: "realEstateTheme3",
    status: "live",
    previewPrimary: "#0f2744",
    previewSecondary: "#c9a227",
    audienceLabel: "Premier partner & dream-home positioning",
    thumbnail: "/templates/real-estate-theme-3.svg",
  },
];
