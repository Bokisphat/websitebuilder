"use client";

import { useCallback, useEffect, useState } from "react";
import type { FusionProperty } from "./fusion-property";
import { FUSION_LISTINGS_PAGE_SIZE_MAX, getFusionListingsAggregateMaxPages } from "./fusion-env";
import { propertiesFromApiJson } from "./parse-properties-response";
import { readPropertiesPagination } from "./read-properties-pagination";

export type FusionPropertiesListMode = "paginated" | "aggregate" | "cachedTopYield";

export type TopYieldListMeta = {
  /** True when listings came from `data/top-yield-picks.json` via GET `/api/properties/top-yield`. */
  fromCache: boolean;
  /** ISO timestamp from cache file when `fromCache`. */
  updatedAt?: string;
};

export type UseFusionPropertiesListOptions = {
  /** When false, skips all fetching (manual-listing replace mode). Default true. */
  enabled?: boolean;
  /** `aggregate` loads the full feed from the API (server merges every paginated page, up to a cap). */
  mode?: FusionPropertiesListMode;
  /**
   * When `mode` is `aggregate` or `cachedTopYield` (fallback), max upstream pages the server will walk (each page up to {@link FUSION_LISTINGS_PAGE_SIZE_MAX} listings).
   * Default {@link getFusionListingsAggregateMaxPages} (500). Lower to reduce load while testing.
   */
  aggregateMaxPages?: number;
};

const PROPERTIES_FETCH_TIMEOUT_MS = 25_000;
const FULL_FEED_FETCH_TIMEOUT_MS = 240_000;
const TOP_YIELD_CACHE_FETCH_TIMEOUT_MS = 15_000;

function combineAbortSignals(outer?: AbortSignal, timeoutMs = PROPERTIES_FETCH_TIMEOUT_MS): AbortSignal | undefined {
  const timeout =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(timeoutMs)
      : undefined;
  if (outer && timeout && typeof AbortSignal.any === "function") {
    return AbortSignal.any([outer, timeout]);
  }
  if (timeout) return timeout;
  return outer;
}

async function fetchPropertiesPage(
  page: number,
  outerSignal?: AbortSignal,
): Promise<{
  rows: FusionProperty[];
  failed: boolean;
  hasMoreHint: boolean;
}> {
  const res = await fetch(`/api/properties?page=${page}&limit=${FUSION_LISTINGS_PAGE_SIZE_MAX}`, {
    cache: "no-store",
    signal: combineAbortSignals(outerSignal, PROPERTIES_FETCH_TIMEOUT_MS),
  });
  const json: unknown = await res.json().catch(() => null);
  const failedEnvelope =
    json && typeof json === "object" && "success" in json && (json as { success: unknown }).success === false;

  if (!res.ok || failedEnvelope) {
    return { rows: [], failed: true, hasMoreHint: false };
  }
  const rows = propertiesFromApiJson(json);
  const meta = readPropertiesPagination(json);
  const hasMoreHint = meta?.hasMore ?? rows.length === FUSION_LISTINGS_PAGE_SIZE_MAX;
  return { rows, failed: false, hasMoreHint };
}

async function fetchAllPropertiesFromApi(
  capPages: number,
  outerSignal?: AbortSignal,
): Promise<{
  rows: FusionProperty[];
  failed: boolean;
}> {
  const qs = new URLSearchParams({ all: "1", capPages: String(capPages) });
  const res = await fetch(`/api/properties?${qs.toString()}`, {
    cache: "no-store",
    signal: combineAbortSignals(outerSignal, FULL_FEED_FETCH_TIMEOUT_MS),
  });
  const json: unknown = await res.json().catch(() => null);
  const failedEnvelope =
    json && typeof json === "object" && "success" in json && (json as { success: unknown }).success === false;

  if (!res.ok || failedEnvelope) {
    return { rows: [], failed: true };
  }
  const rows = propertiesFromApiJson(json);
  return { rows, failed: false };
}

export function useFusionPropertiesList(opts: UseFusionPropertiesListOptions = {}) {
  const enabled = opts.enabled !== false;
  const mode = opts.mode ?? "paginated";
  const raw = opts.aggregateMaxPages;
  const n = typeof raw === "number" ? raw : Number(raw);
  const aggregateCapPages = Math.min(
    500,
    Math.max(1, Number.isFinite(n) ? n : getFusionListingsAggregateMaxPages()),
  );

  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<FusionProperty[]>([]);
  const [loading, setLoading] = useState(() => enabled);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [topYieldMeta, setTopYieldMeta] = useState<TopYieldListMeta | null>(null);

  useEffect(() => {
    if (enabled) return;
    setListings([]);
    setLoading(false);
    setError(false);
    setHasMore(false);
    setTopYieldMeta(null);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || mode !== "aggregate") return;
    const abortInflight = new AbortController();
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { rows, failed } = await fetchAllPropertiesFromApi(aggregateCapPages, abortInflight.signal);
        if (cancelled) return;
        if (failed) {
          setError(true);
          setListings([]);
          setHasMore(false);
        } else {
          setListings(rows);
          setError(false);
          setHasMore(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setListings([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      abortInflight.abort();
    };
  }, [enabled, mode, aggregateCapPages]);

  useEffect(() => {
    if (!enabled || mode !== "cachedTopYield") return;
    const abortInflight = new AbortController();
    let cancelled = false;
    setLoading(true);
    setTopYieldMeta(null);
    (async () => {
      try {
        const res = await fetch("/api/properties/top-yield", {
          cache: "no-store",
          signal: combineAbortSignals(abortInflight.signal, TOP_YIELD_CACHE_FETCH_TIMEOUT_MS),
        });
        const json: unknown = await res.json().catch(() => null);
        const o = json && typeof json === "object" ? (json as Record<string, unknown>) : null;
        const data = o?.data;
        const cache = o?.cache && typeof o.cache === "object" ? (o.cache as Record<string, unknown>) : null;
        const okCache =
          !cancelled &&
          res.ok &&
          o?.success === true &&
          Array.isArray(data) &&
          (data as FusionProperty[]).length > 0;

        if (okCache) {
          setListings(data as FusionProperty[]);
          setError(false);
          setHasMore(false);
          setTopYieldMeta({
            fromCache: true,
            updatedAt: typeof cache?.updatedAt === "string" ? cache.updatedAt : undefined,
          });
          setLoading(false);
          return;
        }

        const { rows, failed } = await fetchAllPropertiesFromApi(aggregateCapPages, abortInflight.signal);
        if (cancelled) return;
        if (failed) {
          setError(true);
          setListings([]);
          setHasMore(false);
        } else {
          setListings(rows);
          setError(false);
          setHasMore(false);
        }
        setTopYieldMeta({ fromCache: false });
      } catch {
        if (!cancelled) {
          setError(true);
          setListings([]);
          setHasMore(false);
          setTopYieldMeta({ fromCache: false });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      abortInflight.abort();
    };
  }, [enabled, mode, aggregateCapPages]);

  useEffect(() => {
    if (!enabled || mode !== "paginated") return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { rows, failed, hasMoreHint } = await fetchPropertiesPage(page, undefined);
        if (failed) {
          if (!cancelled) {
            setError(true);
            setListings([]);
            setHasMore(false);
          }
          return;
        }
        if (!cancelled) {
          setListings(rows);
          setError(false);
          setHasMore(hasMoreHint);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setListings([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, mode, page]);

  const goNext = useCallback(() => {
    if (mode !== "paginated") return;
    setPage((p) => p + 1);
  }, [mode]);

  const goPrev = useCallback(() => {
    if (mode !== "paginated") return;
    setPage((p) => Math.max(1, p - 1));
  }, [mode]);

  return {
    listings,
    loading,
    error,
    page,
    setPage,
    hasNextPage: mode === "paginated" && hasMore,
    hasPrevPage: mode === "paginated" && page > 1,
    goNext,
    goPrev,
    topYieldMeta: mode === "cachedTopYield" ? topYieldMeta : null,
  };
}
