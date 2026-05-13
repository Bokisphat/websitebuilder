import type { FusionSite } from "./fusion-site-model";
import type { SectionConfig, SitePagesConfig } from "./section-config";
import { defaultSiteConfig } from "./site-config";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `site_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function deepClonePages(pages: SitePagesConfig): SitePagesConfig {
  const raw = JSON.stringify(pages);
  return JSON.parse(raw) as SitePagesConfig;
}

function buildDefaultPages(basePath: string): SitePagesConfig {
  const contactHref = `${basePath}/contact`;
  const listingsHref = `${basePath}/listings`;

  const home: SectionConfig[] = [
    {
      kind: "hero",
      headline: "Investment-grade property, presented clearly.",
      subheadline: "Curated listings, investor education, and a direct line to your team.",
      ctaLabel: "View listings",
      ctaHref: listingsHref,
      secondaryCtaLabel: "Talk to us",
      secondaryCtaHref: contactHref,
    },
    { kind: "featuredListings", title: "Featured opportunities", maxItems: 3 },
    {
      kind: "investorStrategy",
      title: "How we help investors",
      intro: "Structured research, not hype — built for busy professionals who want clarity fast.",
      bullets: [
        "Cashflow and growth scenarios in plain language",
        "Due diligence pack and depreciation guidance partners",
        "Portfolio alignment with your lending and tax position",
      ],
    },
    {
      kind: "leadCapture",
      title: "Request the shortlist",
      subtitle: "We will send curated matches; no spam.",
      buttonLabel: "Send my details",
    },
  ];

  const listings: SectionConfig[] = [
    {
      kind: "hero",
      headline: "Current listings",
      subheadline: "Every asset is vetted for tenant profile, yield, and exit liquidity.",
      ctaLabel: "Get pre-qualified",
      ctaHref: contactHref,
    },
    { kind: "featuredListings", title: "All active listings", maxItems: 8 },
    {
      kind: "dualKeyExplainer",
      title: "Why dual-key matters",
      body: "Two income streams from one title can smooth vacancy risk and lift net yield when configured well.",
      points: ["Separate tenancy agreements", "Independent living zones", "Strong demand in corridor cities"],
    },
  ];

  const about: SectionConfig[] = [
    {
      kind: "textImage",
      title: "Built for serious property investors",
      body: "We are a specialist team focused on high-converting property sites that respect your brand and your buyer’s time. Fusion CRM integration will keep listings and leads in sync.",
      imageSide: "right",
      imageLabel: "Your team",
    },
    {
      kind: "smsfExplainer",
      title: "SMSF buyers",
      body: "Self-managed super fund acquisitions have specific lending, structure, and compliance steps. We surface the right questions early so conversations stay productive.",
      highlights: ["Liquidity and contribution caps", "LRBA considerations", "Independent advice encouraged"],
    },
    {
      kind: "testimonial",
      quote: "Finally a site that looks premium and actually pushes qualified leads to our inbox.",
      name: "Alex M.",
      role: "Buyer's agent, QLD",
    },
  ];

  const contact: SectionConfig[] = [
    {
      kind: "hero",
      headline: "Start a conversation",
      subheadline: "Leave your details and we will respond within one business day.",
      ctaLabel: "Call now",
      ctaHref: "tel:",
    },
    { kind: "leadCapture", title: "Contact the team", subtitle: "Mock form — no data leaves your browser.", buttonLabel: "Submit" },
  ];

  return { home, listings, about, contact };
}

export type GenerateSiteOptions = {
  /** When omitted, a new UUID is assigned. */
  id?: string;
  /** Dashboard label */
  name?: string;
  /** Public name inside branding.siteName */
  publicSiteName?: string;
};

/**
 * Creates a new Fusion Site with four pages and mock listings.
 */
export function generateSite(options?: GenerateSiteOptions): FusionSite {
  const id = options?.id ?? newId();
  const path = `/site/${id}`;
  const short = id.slice(0, 8);

  const siteName = options?.publicSiteName ?? `Investor site ${short}`;
  const name = options?.name ?? `New property site ${short}`;

  return {
    id,
    name,
    branding: {
      ...defaultSiteConfig,
      siteName,
      tagline: "Structured property sites that convert enquiries into qualified conversations.",
      logoUrl: "",
      primaryColor: "#a78bfa",
      secondaryColor: "#34d399",
      phone: defaultSiteConfig.phone,
      email: defaultSiteConfig.email,
    },
    listings: [],
    pages: buildDefaultPages(path),
  };
}

export function duplicateSite(site: FusionSite): FusionSite {
  const newSiteId = newId();
  const basePath = `/site/${newSiteId}`;
  const clonedPages = deepClonePages(site.pages);

  const rewriteHref = (href: string) => {
    const prev = `/site/${site.id}`;
    if (href.startsWith(prev)) {
      return href.replace(prev, basePath);
    }
    return href;
  };

  const remapSections = (sections: SectionConfig[]): SectionConfig[] =>
    sections.map((section) => {
      if (section.kind === "hero") {
        return {
          ...section,
          ctaHref: rewriteHref(section.ctaHref),
          secondaryCtaHref: section.secondaryCtaHref ? rewriteHref(section.secondaryCtaHref) : undefined,
        };
      }
      return { ...section };
    });

  return {
    id: newSiteId,
    name: `${site.name} (Copy)`,
    branding: { ...site.branding },
    listings: site.listings.map((p) => ({ ...p })),
    pages: {
      home: remapSections(clonedPages.home),
      listings: remapSections(clonedPages.listings),
      about: remapSections(clonedPages.about),
      contact: remapSections(clonedPages.contact),
    },
  };
}
