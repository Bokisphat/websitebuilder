import type { SiteLayoutId, SiteTemplateId } from "./site-model";

/**
 * Layout-only Tailwind for heroes (colours come from theme or backdrop “light foreground” overrides).
 * Lets each built-in template feel distinct at first load while staying fully editable.
 */
export type HeroVisualPreset = {
  section: string;
  padding: string;
  innerDefault: string;
  title: string;
  subtitle: string;
  cta: string;
  agencySectionExtra: string;
  agencyPadding: string;
  agencyTitle: string;
  agencySubtitle: string;
};

const BASE: HeroVisualPreset = {
  section: "",
  padding: "py-20",
  innerDefault: "mx-auto max-w-3xl text-center",
  title: "text-4xl font-bold tracking-tight sm:text-5xl",
  subtitle: "mt-4 text-lg leading-relaxed",
  cta: "",
  agencySectionExtra: "",
  agencyPadding: "py-14 md:py-20",
  agencyTitle: "text-4xl font-bold tracking-tight sm:text-5xl",
  agencySubtitle: "mt-4 text-lg leading-relaxed",
};

const ADVISORY: HeroVisualPreset = {
  section: "min-h-[38vh] sm:min-h-[44vh]",
  padding: "py-16 md:py-24",
  innerDefault: "mx-auto max-w-2xl text-center",
  title: "text-[1.75rem] font-semibold leading-snug tracking-tight sm:text-4xl sm:leading-tight lg:text-[2.65rem]",
  subtitle: "mt-5 text-base leading-relaxed sm:text-lg",
  cta: "rounded-full px-8 shadow-md",
  agencySectionExtra: "min-h-[40vh]",
  agencyPadding: "py-16 md:py-24",
  agencyTitle: "text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.5rem]",
  agencySubtitle: "mt-4 text-base leading-relaxed sm:text-lg",
};

const SMSF_STRATEGY: HeroVisualPreset = {
  section: "min-h-[40vh] sm:min-h-[46vh]",
  padding: "py-20 md:py-24",
  innerDefault: "mx-auto max-w-3xl text-center",
  title: "text-3xl font-bold tracking-wide sm:text-4xl lg:text-[2.65rem]",
  subtitle: "mt-6 max-w-2xl mx-auto text-base leading-relaxed sm:text-lg",
  cta: "rounded-md px-8 ring-2 ring-white/35 ring-offset-2 ring-offset-transparent",
  agencySectionExtra: "min-h-[44vh]",
  agencyPadding: "py-16 md:py-24",
  agencyTitle: "text-3xl font-bold tracking-wide sm:text-4xl",
  agencySubtitle: "mt-5 text-base leading-relaxed sm:text-lg",
};

const HIGH_YIELD: HeroVisualPreset = {
  section: "min-h-[40vh] sm:min-h-[48vh]",
  padding: "py-20 md:py-28",
  innerDefault: "mx-auto max-w-3xl text-center",
  title: "text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.1rem]",
  subtitle: "mt-6 text-lg leading-relaxed sm:text-xl",
  cta: "rounded-xl px-8 uppercase tracking-wide text-sm",
  agencySectionExtra: "min-h-[46vh]",
  agencyPadding: "py-16 md:py-24",
  agencyTitle: "text-4xl font-extrabold leading-tight sm:text-5xl",
  agencySubtitle: "mt-5 text-lg leading-relaxed",
};

const POSITIVE_CASHFLOW: HeroVisualPreset = {
  section: "min-h-[42vh] sm:min-h-[50vh]",
  padding: "py-16 md:py-24",
  innerDefault: "mx-auto max-w-3xl text-center",
  title: "text-4xl font-bold tracking-tight sm:text-5xl",
  subtitle: "mt-5 text-lg leading-relaxed",
  cta: "rounded-xl px-7 shadow-lg",
  agencySectionExtra: "min-h-[46vh] sm:min-h-[52vh]",
  agencyPadding: "py-14 md:py-20",
  agencyTitle: "text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]",
  agencySubtitle: "mt-4 text-base leading-relaxed sm:text-lg",
};

const DUAL_INCOME: HeroVisualPreset = {
  section: "min-h-[56vh] sm:min-h-[64vh]",
  padding: "py-20 md:py-28",
  innerDefault: "mx-auto max-w-4xl text-center",
  title: "text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl",
  subtitle: "mt-6 max-w-3xl mx-auto text-lg leading-relaxed sm:text-xl",
  cta: "rounded-2xl px-10 py-3.5 text-base shadow-lg",
  agencySectionExtra: "min-h-[58vh]",
  agencyPadding: "py-16 md:py-24",
  agencyTitle: "text-4xl font-bold leading-[1.1] sm:text-5xl",
  agencySubtitle: "mt-5 text-lg leading-relaxed sm:text-xl",
};

const LIFESTYLE_PORTAL: HeroVisualPreset = {
  section: "min-h-[52vh] sm:min-h-[60vh]",
  padding: "py-20 md:py-28",
  innerDefault: "mx-auto max-w-3xl text-center",
  title: "text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[2.85rem]",
  subtitle: "mt-6 max-w-2xl mx-auto text-base leading-relaxed sm:text-lg text-white/90",
  cta: "rounded-lg px-8 py-3 text-base font-semibold shadow-md ring-2 ring-white/20",
  agencySectionExtra: "min-h-[54vh]",
  agencyPadding: "py-16 md:py-24",
  agencyTitle: "text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.5rem]",
  agencySubtitle: "mt-5 text-base leading-relaxed sm:text-lg text-white/90",
};

const BY_ID: Record<SiteTemplateId, HeroVisualPreset> = {
  advisory: ADVISORY,
  smsfStrategy: SMSF_STRATEGY,
  highYield: HIGH_YIELD,
  positiveCashflow: POSITIVE_CASHFLOW,
  dualIncome: DUAL_INCOME,
  lifestyleCorridors: LIFESTYLE_PORTAL,
  ndisProperties: POSITIVE_CASHFLOW,
  realEstateTheme2: LIFESTYLE_PORTAL,
  realEstateTheme3: LIFESTYLE_PORTAL,
  firstHomeBuyers: ADVISORY,
};

export function getHeroVisualPreset(layoutId: SiteLayoutId): HeroVisualPreset {
  if (layoutId === "custom") return BASE;
  return BY_ID[layoutId] ?? BASE;
}
