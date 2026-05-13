import type { SiteConfig } from "./site-model";
import { createSite } from "./site-generator";

export const MOCK_SITE: SiteConfig = createSite("Fusion Demo Portfolio");
