import {
  FUSION_LISTINGS_PAGE_SIZE_MAX,
  getFusionServerConfig,
  resolveFusionPropertiesListUrlPaginated,
} from "./fusion-env";
import { extractListingRows } from "./map-fusion-properties";
import { fusionAuthHeaders } from "./fusion-upstream";

/** Pages fetched in parallel per wave (then next wave). */
export const FULL_LIST_BATCH_SIZE = 8;
export const UPSTREAM_PAGE_TIMEOUT_MS = 25_000;

export async function fetchFusionUpstream(
  propertiesUrl: string,
  config: NonNullable<ReturnType<typeof getFusionServerConfig>>,
  timeoutMs: number = 30_000,
) {
  const signal =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(timeoutMs)
      : undefined;
  return fetch(propertiesUrl, {
    method: "GET",
    headers: fusionAuthHeaders(config),
    cache: "no-store",
    signal,
  });
}

function fusionRowDedupeKey(row: unknown): string {
  if (!row || typeof row !== "object") return "";
  const r = row as Record<string, unknown>;
  for (const k of ["id", "project_id", "listing_id", "uuid"]) {
    const v = r[k];
    if (typeof v === "string" || typeof v === "number") return `${k}:${String(v)}`;
  }
  return "";
}

type OnePageResult =
  | { page: number; ok: true; rows: unknown[] }
  | { page: number; ok: false; status: number; is403: boolean };

async function fetchOneProjectPage(
  page: number,
  config: NonNullable<ReturnType<typeof getFusionServerConfig>>,
): Promise<OnePageResult> {
  const url = resolveFusionPropertiesListUrlPaginated(
    FUSION_LISTINGS_PAGE_SIZE_MAX,
    (page - 1) * FUSION_LISTINGS_PAGE_SIZE_MAX,
  );
  if (!url) return { page, ok: false, status: 0, is403: false };

  try {
    const upstream = await fetchFusionUpstream(url, config, UPSTREAM_PAGE_TIMEOUT_MS);
    const text = await upstream.text();
    if (upstream.status === 403) return { page, ok: false, status: 403, is403: true };
    if (!upstream.ok) return { page, ok: false, status: upstream.status, is403: false };
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      return { page, ok: false, status: 502, is403: false };
    }
    const rows = extractListingRows(parsed);
    return { page, ok: true, rows };
  } catch {
    return { page, ok: false, status: 504, is403: false };
  }
}

export async function mergeAllProjectPages(
  config: NonNullable<ReturnType<typeof getFusionServerConfig>>,
  maxPages: number,
  logPrefix = "[fusion-full-catalog]",
): Promise<{ mergedRows: unknown[]; pagesFetched: number; forbid403: boolean }> {
  const mergedRows: unknown[] = [];
  const seenIds = new Set<string>();
  let pagesFetched = 0;
  let nextPage = 1;
  let forbid403 = false;

  while (nextPage <= maxPages) {
    const batchEnd = Math.min(nextPage + FULL_LIST_BATCH_SIZE - 1, maxPages);
    const pageNums: number[] = [];
    for (let p = nextPage; p <= batchEnd; p++) pageNums.push(p);

    const settled = await Promise.allSettled(
      pageNums.map((p) => fetchOneProjectPage(p, config)),
    );

    let stop = false;

    for (let i = 0; i < settled.length; i++) {
      const page = nextPage + i;
      const entry = settled[i];
      if (entry.status !== "fulfilled") {
        console.error(`${logPrefix} all-pages batch promise rejected`, { page });
        stop = true;
        break;
      }
      const r = entry.value;
      pagesFetched = page;

      if (!r.ok) {
        if (r.is403) {
          if (mergedRows.length === 0) forbid403 = true;
          stop = true;
          break;
        }
        console.error(`${logPrefix} page failed`, { page, status: r.status });
        stop = true;
        break;
      }
      if (r.rows.length === 0) {
        stop = true;
        break;
      }
      for (let j = 0; j < r.rows.length; j++) {
        const row = r.rows[j];
        const key = fusionRowDedupeKey(row) || `p${r.page}-r${j}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          mergedRows.push(row);
        }
      }
      if (r.rows.length < FUSION_LISTINGS_PAGE_SIZE_MAX) {
        stop = true;
        break;
      }
    }

    nextPage = batchEnd + 1;
    if (stop) break;
  }

  return { mergedRows, pagesFetched, forbid403 };
}
