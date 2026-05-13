/**
 * JSON-serialisable section definitions for templated property sites.
 * Each section is a discriminated union on `kind`.
 */

export type HeroSectionConfig = {
  kind: "hero";
  headline: string;
  subheadline?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export type FeaturedListingsSectionConfig = {
  kind: "featuredListings";
  title: string;
  subtitle?: string;
  maxItems?: number;
  /** When false, hides the sample disclaimer. Default true. */
  showSampleDisclaimer?: boolean;
  /** Custom disclaimer copy; default explains listings are a small sample. */
  sampleDisclaimer?: string;
};

export type LeadCaptureSectionConfig = {
  kind: "leadCapture";
  title: string;
  subtitle?: string;
  buttonLabel: string;
};

export type TestimonialSectionConfig = {
  kind: "testimonial";
  quote: string;
  name: string;
  role: string;
};

export type TextImageSectionConfig = {
  kind: "textImage";
  title: string;
  body: string;
  imageSide?: "left" | "right";
  imageLabel?: string;
};

export type InvestorStrategySectionConfig = {
  kind: "investorStrategy";
  title: string;
  intro: string;
  bullets: string[];
};

export type SmsfExplainerSectionConfig = {
  kind: "smsfExplainer";
  title: string;
  body: string;
  highlights: string[];
};

export type DualKeyExplainerSectionConfig = {
  kind: "dualKeyExplainer";
  title: string;
  body: string;
  points: string[];
};

export type SectionConfig =
  | HeroSectionConfig
  | FeaturedListingsSectionConfig
  | LeadCaptureSectionConfig
  | TestimonialSectionConfig
  | TextImageSectionConfig
  | InvestorStrategySectionConfig
  | SmsfExplainerSectionConfig
  | DualKeyExplainerSectionConfig;

export type SitePageId = "home" | "listings" | "about" | "contact";

export type SitePagesConfig = Record<SitePageId, SectionConfig[]>;
