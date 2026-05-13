const DEFAULT_FUSION_HOST = "https://fusioncrm.software";

export type FusionServerConfig = {
  hostUrl: string;
  apiKey: string;
  apiUrl: string;
};

export function getFusionHostUrl(): string {
  const raw = process.env.FUSION_HOST_URL?.trim();
  return (raw || DEFAULT_FUSION_HOST).replace(/\/$/, "");
}

/** Subscriber ID for list endpoints (query `subscriber`). Confirm with subscriber-detail if listings look wrong. */
export function getFusionSubscriberId(): string {
  return process.env.FUSION_SUBSCRIBER?.trim() || "8189";
}

/** Upper bound for listing grids (each `/api/properties?page=` request). */
export const FUSION_LISTINGS_PAGE_SIZE_MAX = 20;

/**
 * Default max paginated requests when merging the full feed (`/api/properties?all=1`).
 * Override with query `capPages` or env `FUSION_LISTINGS_AGGREGATE_MAX_PAGES` (clamped 1–500).
 */
export function getFusionListingsAggregateMaxPages(): number {
  const raw = process.env.FUSION_LISTINGS_AGGREGATE_MAX_PAGES?.trim();
  const n = raw ? parseInt(raw, 10) : 500;
  return Math.min(500, Math.max(1, Number.isFinite(n) ? n : 500));
}

/**
 * Max projects returned in one Fusion call when **not** using `?page=` (server-side slug resolution, etc.).
 * Paginated listing requests use {@link FUSION_LISTINGS_PAGE_SIZE_MAX} instead.
 */
export function getFusionPropertiesLimit(): string {
  return process.env.FUSION_API_PROPERTIES_LIMIT?.trim() || "200";
}

/**
 * Credentials for Fusion (`API-KEY`, `API-URL`) per official Postman / team guide.
 * `API-URL` must match an Authorized Origin row exactly (no scheme unless Fusion lists one).
 */
export function getFusionServerConfig(): FusionServerConfig | null {
  const apiKey = process.env.FUSION_API_KEY?.trim();
  const apiUrl = process.env.FUSION_API_URL?.trim();
  if (!apiKey || !apiUrl) return null;
  return { hostUrl: getFusionHostUrl(), apiKey, apiUrl };
}

/**
 * Full URL for projects. Prefer `FUSION_API_PROPERTIES_URL` when set; otherwise build from host + subscriber + limit.
 * No `wp_domain` query param — Postman `wp_domain` maps to the **API-URL** header, not the URL (per Fusion team guide).
 *
 * For `/api/fusion/projects` URLs, `limit` is always set from `FUSION_API_PROPERTIES_LIMIT` so a low `limit=` in the URL
 * string cannot cap the feed (fixes filters that need many rows, e.g. Duplex).
 */
export function resolveFusionPropertiesListUrl(): string | null {
  const explicit = process.env.FUSION_API_PROPERTIES_URL?.trim();
  const c = getFusionServerConfig();
  if (explicit) {
    const limit = getFusionPropertiesLimit();
    try {
      const u = new URL(explicit);
      const path = u.pathname.toLowerCase();
      if (limit && path.includes("fusion") && path.includes("project")) {
        u.searchParams.set("limit", limit);
        u.searchParams.delete("offset");
      }
      return u.toString();
    } catch {
      return explicit;
    }
  }
  if (!c) return null;

  const sub = getFusionSubscriberId();
  const limit = getFusionPropertiesLimit();
  return `${c.hostUrl}/api/fusion/projects?subscriber=${encodeURIComponent(sub)}&limit=${encodeURIComponent(limit)}`;
}

/**
 * Fusion list URL for a single page of listings (`limit` + `offset`). Unknown params are ignored upstream.
 * Use for `/api/properties?page=` so each response stays small.
 */
export function resolveFusionPropertiesListUrlPaginated(pageSize: number, offset: number): string | null {
  const size = Math.min(FUSION_LISTINGS_PAGE_SIZE_MAX, Math.max(1, Math.floor(pageSize)));
  const off = Math.max(0, Math.floor(offset));
  const explicit = process.env.FUSION_API_PROPERTIES_URL?.trim();
  const c = getFusionServerConfig();
  if (explicit) {
    try {
      const u = new URL(explicit);
      const path = u.pathname.toLowerCase();
      if (path.includes("fusion") && path.includes("project")) {
        u.searchParams.set("limit", String(size));
        if (off > 0) u.searchParams.set("offset", String(off));
        else u.searchParams.delete("offset");
      }
      return u.toString();
    } catch {
      return explicit;
    }
  }
  if (!c) return null;

  const sub = getFusionSubscriberId();
  const qs = new URLSearchParams({
    subscriber: sub,
    limit: String(size),
  });
  if (off > 0) qs.set("offset", String(off));
  return `${c.hostUrl}/api/fusion/projects?${qs.toString()}`;
}
