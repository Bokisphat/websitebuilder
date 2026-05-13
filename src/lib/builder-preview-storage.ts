import { migrateLegacyAdvisoryHeroCta } from "./hero-cta-migrate";
import { normalizeTemplateId, type SiteConfig } from "./site-model";

export const BUILDER_PREVIEW_STORAGE_KEY = "fusion:builderPreview:v1";

/**
 * Older builder saves often omitted `sortByRentYieldDesc` / `preferCachedTopYield` on the home “top picks” strip,
 * which leaves `useFusionPropertiesList` in paginated mode — no cache file, no yield ranking, often empty or wrong cards.
 */
function migratePositiveCashflowHomeYieldStrip(site: SiteConfig): SiteConfig {
  const templateId = normalizeTemplateId(site.templateId);
  return {
    ...site,
    pages: site.pages.map((page) => {
      if (page.id !== "home") return page;

      let targetIndex = page.sections.findIndex((s) => s.id === "pcf-featured" && s.type === "featuredListings");
      if (targetIndex < 0 && templateId === "positiveCashflow") {
        targetIndex = page.sections.findIndex(
          (s, i) => i > 0 && page.sections[i - 1]?.type === "hero" && s.type === "featuredListings",
        );
      }
      if (targetIndex < 0) return page;

      const section = page.sections[targetIndex];
      const props = { ...(section.props as Record<string, unknown>) };

      if (props.sortByRentYieldDesc === undefined) props.sortByRentYieldDesc = true;
      if (props.preferCachedTopYield === undefined) props.preferCachedTopYield = true;
      if (props.maxItems === undefined) props.maxItems = 6;
      if (props.minRentYieldPercent === undefined) props.minRentYieldPercent = 5;
      if (props.yieldRankingScanPages === undefined) props.yieldRankingScanPages = 500;

      const nextSections = [...page.sections];
      nextSections[targetIndex] = { ...section, props };
      return { ...page, sections: nextSections };
    }),
  };
}

function normalizePreviewSite(site: SiteConfig): SiteConfig {
  return migratePositiveCashflowHomeYieldStrip(migrateLegacyAdvisoryHeroCta(site));
}

export function saveBuilderPreviewToStorage(site: SiteConfig): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = normalizePreviewSite(site);
    localStorage.setItem(BUILDER_PREVIEW_STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.warn("Builder preview: could not save to localStorage", e);
  }
}

export function loadBuilderPreviewFromStorage(): SiteConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUILDER_PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SiteConfig;
    if (!data?.pages || !Array.isArray(data.pages)) return null;
    if (!data.branding) return null;
    return normalizePreviewSite(data);
  } catch {
    return null;
  }
}
