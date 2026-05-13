import type { FusionProperty } from "./fusion-property";
import type { SiteConfig } from "./site-config";
import type { SitePagesConfig } from "./section-config";

/** One member property website instance (mock-persisted in client state / localStorage). */
export type FusionSite = {
  id: string;
  /** Internal label in the dashboard (distinct from public siteName in branding). */
  name: string;
  branding: SiteConfig;
  /** Mock inventory attached to this site until CRM sync exists. */
  listings: FusionProperty[];
  pages: SitePagesConfig;
};
