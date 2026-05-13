import type { SiteConfig } from "./site-model";

/** Merge props into a section on a given page (`home`, `listings`, custom ids, …). */
export function patchPageSectionProps(
  site: SiteConfig,
  pageId: string,
  sectionId: string,
  patch: Record<string, unknown>,
): SiteConfig {
  return {
    ...site,
    pages: site.pages.map((page) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          const next = { ...sec.props, ...patch };
          for (const key of Object.keys(patch)) {
            if (patch[key] === undefined) delete next[key];
          }
          return { ...sec, props: next };
        }),
      };
    }),
  };
}
