import type { SiteConfig } from "./site-model";

/** Default label for the advisory template primary hero CTA. */
export const ADVISORY_BOOK_WEALTH_SESSION_LABEL = "Book a wealth strategy session";

/** Old drafts mapped this button to `#listings`; registration lives at `#session-interest`. */
export function resolveAdvisoryWealthHeroHref(ctaLabel: string, ctaHref: string): string {
  if (ctaLabel.trim() !== ADVISORY_BOOK_WEALTH_SESSION_LABEL) return ctaHref;
  const h = ctaHref.trim();
  if (h === "#listings" || h === "#") return "#session-interest";
  return ctaHref;
}

export function migrateLegacyAdvisoryHeroCta(site: SiteConfig): SiteConfig {
  let changed = false;

  const pages = site.pages.map((page) => {
    if (page.id !== "home") return page;

    const sections = page.sections.map((sec) => {
      if (sec.type !== "hero") return sec;
      const p = sec.props as { ctaLabel?: string; ctaHref?: string };
      const rawLabel = typeof p.ctaLabel === "string" ? p.ctaLabel : "";
      const rawHref = typeof p.ctaHref === "string" ? p.ctaHref : "";
      const nextHref = resolveAdvisoryWealthHeroHref(rawLabel, rawHref);
      if (nextHref === rawHref) return sec;
      changed = true;
      return { ...sec, props: { ...sec.props, ctaHref: nextHref } };
    });

    return { ...page, sections };
  });

  if (!changed) return site;
  return { ...site, pages };
}
