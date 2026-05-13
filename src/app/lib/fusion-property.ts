export type FusionProperty = {
  /** Stable unique key for list rendering (Fusion id when present, else slug + row index). */
  id: string;
  /**
   * URL segment for `/property/[slug]`: prefers API slug fields, else Fusion project id,
   * else a generated fallback.
   */
  slug: string;
  /** Fusion project id when provided — used for enquiry `project_id`. */
  projectId?: string;
  title: string;
  /** Full address or best-effort location line. */
  location: string;
  price: string;
  yield: string;
  type: string;
  /**
   * Extra type-related labels from Fusion (other columns, tags, slugs) used for filters.
   * Not shown on cards; `type` stays as the primary display label (`pt_title`).
   */
  typeSearchText?: string;
  /** Plain text; empty when Fusion omits it. */
  description: string;
  /** First listing image URL when provided by Fusion. */
  image?: string;
  /** All gallery images from Fusion (deduped, order preserved). */
  imageUrls?: string[];
  bedrooms?: string;
  bathrooms?: string;
  garage?: string;
  /**
   * Parsed from Fusion `avg_rent_yield` (and similar) for sorting — percentage points, e.g. 5.25 for 5.25%.
   */
  rentYieldPercent?: number;
};
