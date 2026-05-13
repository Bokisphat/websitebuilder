/** Preset page palettes (background + text + surface tokens in globals.css). */
export const SITE_COLOR_SCHEMES = [
  "dark",
  "light",
  "midnight",
  "charcoal",
  "warm",
  "contrast",
  "cool",
  "sage",
] as const;
export type SiteColorScheme = (typeof SITE_COLOR_SCHEMES)[number];

/** UI labels for the builder & docs */
export const SITE_COLOR_SCHEME_CHOICES: { value: SiteColorScheme; label: string; hint: string }[] = [
  { value: "dark", label: "Dark", hint: "Deep neutral — default" },
  { value: "charcoal", label: "Charcoal", hint: "Soft dark, easier on the eyes" },
  { value: "midnight", label: "Midnight", hint: "Navy & slate" },
  { value: "light", label: "Light", hint: "Soft grey page" },
  { value: "contrast", label: "High contrast", hint: "White page, strong text" },
  { value: "warm", label: "Warm paper", hint: "Cream / stone tones" },
  { value: "cool", label: "Cool mist", hint: "Blue-grey, crisp" },
  { value: "sage", label: "Sage", hint: "Soft green-grey" },
];

function normalizeColorScheme(s: string | undefined): SiteColorScheme {
  if (s && (SITE_COLOR_SCHEMES as readonly string[]).includes(s)) return s as SiteColorScheme;
  return "dark";
}

/** Max width of main content blocks; hero title block stays comfortable width. */
export type SiteContentWidth = "narrow" | "default" | "wide";

export type BrandingConfig = {
  siteName: string;
  /** HTTPS URL or inline data URL from builder upload; shown in preview chrome. */
  logo: string;
  /** Preview header logo height scale, approx. 40–300 (%). Omitted → 100. */
  logoSizePercent?: number;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  /** Scheduling URL for CTAs wired to `#booking` (Cal.com, Calendly, Google appointment schedule, …). */
  bookingUrl?: string;
  /** When set, the preview header shows a Referral Partners link (external or absolute URL typical). */
  referralPartnersUrl?: string;
  /** Omitted in older saved sites; treated as "dark" when missing. */
  colorScheme?: SiteColorScheme;
  /** Omitted in older saved sites; treated as "default" when missing. */
  contentWidth?: SiteContentWidth;
};

/** Minimum logo scale for preview chrome (% of default size). */
export const LOGO_SIZE_PERCENT_MIN = 40;
/** Maximum logo scale for preview chrome (% of default size). */
export const LOGO_SIZE_PERCENT_MAX = 300;

/** Clamp logo scale for preview chrome (percent of default size). */
export function normalizeLogoSizePercent(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 100;
  return Math.min(LOGO_SIZE_PERCENT_MAX, Math.max(LOGO_SIZE_PERCENT_MIN, Math.round(value)));
}

export function withBrandingDefaults(b: BrandingConfig): BrandingConfig & {
  colorScheme: SiteColorScheme;
  contentWidth: SiteContentWidth;
  bookingUrl: string;
  referralPartnersUrl: string;
} {
  return {
    ...b,
    colorScheme: normalizeColorScheme(b.colorScheme),
    contentWidth: b.contentWidth ?? "default",
    bookingUrl: b.bookingUrl?.trim() ?? "",
    referralPartnersUrl: b.referralPartnersUrl?.trim() ?? "",
  };
}

export type SectionConfig = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

export type PageConfig = {
  id: string;
  name: string;
  sections: SectionConfig[];
  /**
   * Optional hosted video for this page (YouTube, Vimeo, direct .mp4/.webm, or any https link such as a Nextcloud share).
   * Shown after the first hero when present; non-embeddable URLs open in a new tab.
   */
  linkedVideoUrl?: string;
  /** Button / iframe title for the page video; defaults to “Watch video” for external links. */
  linkedVideoLabel?: string;
};

export type PublishStatus = "draft" | "published";

/** Built-in website layout presets (homepage stack + default branding). */
export const SITE_TEMPLATE_IDS = [
  "advisory",
  "smsfStrategy",
  "highYield",
  "positiveCashflow",
  "dualIncome",
  "lifestyleCorridors",
  "ndisProperties",
  "realEstateTheme2",
  "realEstateTheme3",
  "firstHomeBuyers",
] as const;
export type SiteTemplateId = (typeof SITE_TEMPLATE_IDS)[number];

/** Saved layout, or "custom" when not from a preset (blank site, import, or legacy). */
export type SiteLayoutId = SiteTemplateId | "custom";

/** Real Estate Theme 1–3 share the same consumer-style preview navigation. */
export const REAL_ESTATE_PORTAL_TEMPLATE_IDS = [
  "lifestyleCorridors",
  "realEstateTheme2",
  "realEstateTheme3",
] as const satisfies readonly SiteTemplateId[];

export function isRealEstatePortalTemplate(id: SiteLayoutId): boolean {
  return id !== "custom" && (REAL_ESTATE_PORTAL_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function isSiteTemplateId(value: string): value is SiteTemplateId {
  return (SITE_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function normalizeTemplateId(s: string | undefined): SiteLayoutId {
  if (s && (SITE_TEMPLATE_IDS as readonly string[]).includes(s)) return s as SiteTemplateId;
  return "custom";
}

export type SiteConfig = {
  id: string;
  name: string;
  /** Preset this site was created from, or "custom". Omitted in older saves → "custom". */
  templateId?: SiteLayoutId;
  branding: BrandingConfig;
  pages: PageConfig[];
  publishStatus: PublishStatus;
};

export function withSiteConfigDefaults(
  s: SiteConfig
): SiteConfig & { templateId: SiteLayoutId } {
  return {
    ...s,
    templateId: normalizeTemplateId(s.templateId),
  };
}
