"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FusionProperty } from "@/app/lib/fusion-property";
import {
  coerceManualListingMode,
  normalizeManualListingsFromUnknown,
  type ManualListingMode,
} from "@/app/lib/manual-listings";
import { PROPERTY_TYPE_CATEGORY_OPTIONS } from "@/app/lib/property-type-categories";
import { filterFusionProperties } from "@/app/lib/property-listing-filters";
import { numericRentYieldForSort, sortPropertiesByRentYieldDesc } from "@/app/lib/property-yield-sort";
import { useFusionPropertiesList } from "@/app/lib/use-fusion-properties-list";
import { FUSION_LISTINGS_PAGE_SIZE_MAX } from "@/app/lib/fusion-env";
import type { SiteLayoutId } from "@/lib/site-model";
import { ListingsPagination } from "./ListingsPagination";
import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export const DEFAULT_LISTINGS_SAMPLE_DISCLAIMER =
  "The properties shown here are only a small sample of what is available through our networks. Many more opportunities exist — contact us for a curated shortlist matched to your goals, budget, and preferred locations.";

/** Visitor-changable yield band on the full listings grid (ignored in compact “top picks” mode). */
export type ListingsYieldBand = "atLeast" | "below" | "all";

export type YieldBandFilterConfig = {
  /** Boundary in percentage points (e.g. `5` = 5% p.a.). */
  floorPercent: number;
  /** Band selected when the page first loads; filters let visitors switch (e.g. view under the threshold). */
  defaultBand: ListingsYieldBand;
};

export type FeaturedListingsProps = {
  title: string;
  /** Targets hero CTAs that use `#listings` (default). Use a distinct value if you add several listing blocks on one page. */
  anchorId?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
  /** When false, hides the sample disclaimer. Default true. */
  showSampleDisclaimer?: boolean;
  /** Overrides default sample disclaimer text when non-empty. */
  sampleDisclaimer?: string;
  /**
   * Cap how many cards render after sort/filter (e.g. homepage “top picks” strip).
   */
  maxItems?: number;
  /**
   * When true, listings are sorted by gross / rent yield (highest first), using API fields such as `avg_rent_yield`.
   */
  sortByRentYieldDesc?: boolean;
  /**
   * When sorting by yield, how many API pages to merge before ranking (each page up to {@link FUSION_LISTINGS_PAGE_SIZE_MAX} listings).
   * Default 5. Ignored when `sortByRentYieldDesc` is false.
   */
  yieldRankingScanPages?: number;
  /**
   * Only include listings whose gross / rent yield is at least this many percentage points (e.g. `5` = 5% p.a. or higher).
   * Applied **before** sorting and capping — ensures the top N are all above this floor.
   */
  minRentYieldPercent?: number;
  /**
   * Hide search, property-type filter, and pagination. Defaults to true when both `sortByRentYieldDesc` and `maxItems` are set.
   */
  hideListingFilters?: boolean;
  /**
   * Full listings grid only: default rental-return band and a dropdown so visitors can include under‑threshold stock.
   * Ignored when {@link hideListingFilters} resolves to compact mode.
   */
  yieldBandFilter?: YieldBandFilterConfig;
  /**
   * When true with yield sort + compact strip, load precomputed picks from `/api/properties/top-yield` first
   * (instant when `data/top-yield-picks.json` exists), then fall back to a live full-catalog merge.
   */
  preferCachedTopYield?: boolean;
  /**
   * Builder-uploaded stock (e.g. JSON). Parsed and capped via {@link normalizeManualListingsFromUnknown}.
   * Intended for Real Estate Theme 1–3 when you want your own catalogue rows without every Fusion project.
   */
  manualListings?: FusionProperty[] | unknown[];
  /**
   * `replace` — only show manual rows when the array is non-empty (no Fusion fetch for this section).
   * `prepend` — show manual rows first on compact homepage strips, then Fusion rows (deduped by slug). Ignored on full grids.
   * `off` — Fusion feed only (default).
   */
  manualListingMode?: ManualListingMode;
};

/** Props saved on the section plus builder/runtime context (not serialised). */
export type FeaturedListingsViewProps = FeaturedListingsProps & {
  sectionId?: string;
  fusionTemplate?: SiteLayoutId;
};

/**
 * Fills missing props for the Positive Cashflow preset listing sections.
 * Keys off stable section ids from `site-templates.ts` so behaviour still works when `templateId`
 * is missing or normalized to `"custom"` in older localStorage drafts.
 */
function mergePositiveCashflowFeaturedDefaults(
  sectionId: string | undefined,
  p: FeaturedListingsProps,
): FeaturedListingsProps {
  if (sectionId === "pcf-featured") {
    return {
      ...p,
      maxItems: p.maxItems ?? 6,
      minRentYieldPercent: p.minRentYieldPercent ?? 5,
      /** Treat missing flag as on; only explicit `false` turns ranking/cache off. */
      sortByRentYieldDesc: p.sortByRentYieldDesc !== false,
      yieldRankingScanPages: p.yieldRankingScanPages ?? 500,
      preferCachedTopYield: p.preferCachedTopYield !== false,
    };
  }
  if (sectionId === "pcf-list-grid") {
    return {
      ...p,
      yieldBandFilter: p.yieldBandFilter ?? { floorPercent: 5, defaultBand: "atLeast" },
    };
  }
  return p;
}

export function FeaturedListings({
  sectionId,
  fusionTemplate: _fusionTemplate,
  ...incoming
}: FeaturedListingsViewProps) {
  const pIn = incoming as FeaturedListingsProps & {
    manualListings?: unknown;
    manualListingMode?: unknown;
  };
  const p = mergePositiveCashflowFeaturedDefaults(sectionId, pIn as FeaturedListingsProps);
  const manualListingMode = coerceManualListingMode((p as FeaturedListingsProps & { manualListingMode?: unknown }).manualListingMode);
  const manualRows = useMemo(
    () => normalizeManualListingsFromUnknown((p as FeaturedListingsProps & { manualListings?: unknown }).manualListings),
    [(p as FeaturedListingsProps & { manualListings?: unknown }).manualListings],
  );

  const {
    title,
    anchorId = "listings",
    imageUrl,
    imageAlt,
    imageCredit,
    imageAlign,
    onPickImage,
    showSampleDisclaimer = true,
    sampleDisclaimer,
    maxItems,
    sortByRentYieldDesc = false,
    yieldRankingScanPages = 5,
    minRentYieldPercent,
    hideListingFilters,
    yieldBandFilter: yieldBandFilterProp,
    preferCachedTopYield = false,
  } = p;
  const autoCompact = Boolean(sortByRentYieldDesc && maxItems !== undefined && maxItems > 0);
  const compact =
    hideListingFilters === false ? false : hideListingFilters === true ? true : autoCompact;

  const yieldBandFilter =
    !compact && yieldBandFilterProp && Number.isFinite(yieldBandFilterProp.floorPercent)
      ? {
          floorPercent: Math.min(100, Math.max(0, yieldBandFilterProp.floorPercent)),
          defaultBand: (["atLeast", "below", "all"] as const).includes(yieldBandFilterProp.defaultBand)
            ? yieldBandFilterProp.defaultBand
            : "atLeast",
        }
      : undefined;

  const listOpts =
    preferCachedTopYield && sortByRentYieldDesc && autoCompact
      ? { mode: "cachedTopYield" as const, aggregateMaxPages: yieldRankingScanPages }
      : sortByRentYieldDesc
        ? { mode: "aggregate" as const, aggregateMaxPages: yieldRankingScanPages }
        : {};

  const useReplace = manualListingMode === "replace" && manualRows.length > 0;
  const effectivePrepend = manualListingMode === "prepend" && manualRows.length > 0 && compact;

  const {
    listings: pageListings,
    loading,
    error,
    page,
    setPage,
    hasNextPage,
    hasPrevPage,
    goNext,
    goPrev,
    topYieldMeta,
  } = useFusionPropertiesList({ ...listOpts, enabled: !useReplace });

  const mergedSource = useMemo(() => {
    if (useReplace) return manualRows;
    if (effectivePrepend) {
      const slugs = new Set(manualRows.map((m) => m.slug));
      return [...manualRows, ...pageListings.filter((row) => !slugs.has(row.slug))];
    }
    return pageListings;
  }, [useReplace, effectivePrepend, manualRows, pageListings]);

  const loadingVisible = useReplace ? false : loading;

  const [query, setQuery] = useState("");
  const [typeCategoryId, setTypeCategoryId] = useState("");
  const [listingsYieldBand, setListingsYieldBand] = useState<ListingsYieldBand>(() => {
    const raw = yieldBandFilterProp;
    if (!raw || !Number.isFinite(raw.floorPercent)) return "all";
    if (raw.defaultBand === "atLeast" || raw.defaultBand === "below" || raw.defaultBand === "all") {
      return raw.defaultBand;
    }
    return "atLeast";
  });

  useEffect(() => {
    if (compact || !yieldBandFilterProp || !Number.isFinite(yieldBandFilterProp.floorPercent)) {
      setListingsYieldBand("all");
      return;
    }
    const d = yieldBandFilterProp.defaultBand;
    setListingsYieldBand(
      d === "atLeast" || d === "below" || d === "all" ? d : "atLeast",
    );
  }, [compact, yieldBandFilterProp?.floorPercent, yieldBandFilterProp?.defaultBand]);

  useEffect(() => {
    if (compact) return;
    setPage(1);
  }, [compact, query, typeCategoryId, listingsYieldBand, setPage]);

  const listings = useMemo(() => {
    let rows = mergedSource;
    const neg = Number.NEGATIVE_INFINITY;

    if (minRentYieldPercent !== undefined && Number.isFinite(minRentYieldPercent)) {
      const floor = minRentYieldPercent;
      rows = rows.filter((row) => {
        const y = numericRentYieldForSort(row);
        return y !== neg && y >= floor;
      });
    }

    if (sortByRentYieldDesc) {
      rows = sortPropertiesByRentYieldDesc(rows);
    }
    if (!compact && yieldBandFilter) {
      const floor = yieldBandFilter.floorPercent;
      if (listingsYieldBand === "atLeast") {
        rows = rows.filter((row) => {
          const y = numericRentYieldForSort(row);
          return y !== neg && y >= floor;
        });
      } else if (listingsYieldBand === "below") {
        rows = rows.filter((row) => {
          const y = numericRentYieldForSort(row);
          return y !== neg && y < floor;
        });
      }
    }
    if (!compact) {
      rows = filterFusionProperties(rows, query, typeCategoryId);
    }
    if (maxItems !== undefined && maxItems > 0) {
      rows = rows.slice(0, maxItems);
    }
    return rows;
  }, [
    mergedSource,
    sortByRentYieldDesc,
    compact,
    query,
    typeCategoryId,
    maxItems,
    minRentYieldPercent,
    yieldBandFilter,
    listingsYieldBand,
  ]);

  const totalLoaded = useReplace ? manualRows.length : pageListings.length;
  const disclaimerText = sampleDisclaimer?.trim() || DEFAULT_LISTINGS_SAMPLE_DISCLAIMER;
  const yieldBandDiffersFromDefault =
    Boolean(yieldBandFilter) && listingsYieldBand !== yieldBandFilter?.defaultBand;
  const hasActiveFilters = Boolean(query.trim() || typeCategoryId || yieldBandDiffersFromDefault);
  const scanPages = sortByRentYieldDesc ? Math.min(500, Math.max(1, yieldRankingScanPages)) : 1;

  return (
    <section id={anchorId || undefined} className="scroll-mt-28 px-6 py-16">
      <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)]">
        {(imageUrl || onPickImage) && (
          <div className="mb-8">
            <OptionalSectionImage
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              imageCredit={imageCredit}
              onPickImage={onPickImage}
              align={imageAlign}
              className="max-w-3xl"
            />
          </div>
        )}
        <h2 className="mb-4 text-2xl font-bold text-[var(--fs-heading)]">{title}</h2>

        {showSampleDisclaimer ? (
          <p className="mb-8 rounded-xl border border-[var(--fs-border)] bg-[var(--fs-band)] px-4 py-3 text-sm leading-relaxed text-[var(--fs-muted)]">
            {disclaimerText}
          </p>
        ) : null}

        {!loadingVisible && !error && !useReplace && pageListings.length > 0 && !compact ? (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="block min-w-[min(100%,14rem)] flex-1 sm:max-w-md">
              <span className="mb-1 block text-xs font-medium text-[var(--fs-subtle)]">Search</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Location, type, price, keyword…"
                autoComplete="off"
                className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-3 py-2.5 text-sm text-[var(--fs-text)] placeholder:text-[var(--fs-faint)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
              />
            </label>
            <label className="block w-full min-w-[min(100%,12rem)] sm:min-w-[13.5rem] sm:max-w-[18rem]">
              <span className="mb-1 block text-xs font-medium text-[var(--fs-subtle)]">Property type</span>
              <select
                value={typeCategoryId}
                onChange={(e) => setTypeCategoryId(e.target.value)}
                className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-3 py-2.5 text-sm text-[var(--fs-text)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
              >
                <option value="">All types</option>
                {PROPERTY_TYPE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {yieldBandFilter ? (
              <label className="block w-full min-w-[min(100%,12rem)] sm:min-w-[14rem] sm:max-w-[20rem]">
                <span className="mb-1 block text-xs font-medium text-[var(--fs-subtle)]">Rental return (gross / yield)</span>
                <select
                  value={listingsYieldBand}
                  onChange={(e) => setListingsYieldBand(e.target.value as ListingsYieldBand)}
                  className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-3 py-2.5 text-sm text-[var(--fs-text)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
                >
                  <option value="atLeast">
                    {yieldBandFilter.floorPercent}% and higher
                    {yieldBandFilter.defaultBand === "atLeast" ? " (opens by default)" : ""}
                  </option>
                  <option value="below">
                    Under {yieldBandFilter.floorPercent}%
                    {yieldBandFilter.defaultBand === "below" ? " (opens by default)" : ""}
                  </option>
                  <option value="all">
                    All (any return)
                    {yieldBandFilter.defaultBand === "all" ? " (opens by default)" : ""}
                  </option>
                </select>
              </label>
            ) : null}
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeCategoryId("");
                  if (yieldBandFilter) setListingsYieldBand(yieldBandFilter.defaultBand);
                }}
                className="rounded-xl border border-[var(--fs-border)] bg-[var(--fs-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--fs-heading)] hover:bg-[var(--fs-card)]"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
        {!loadingVisible && !error && !useReplace && pageListings.length > 0 && !compact ? (
          <p className="mb-4 text-xs text-[var(--fs-faint)]">
            Search, property type
            {yieldBandFilter ? ", and rental return band" : ""} apply to listings loaded on this page (up to{" "}
            {FUSION_LISTINGS_PAGE_SIZE_MAX} per page).
          </p>
        ) : null}

        {loadingVisible ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite">
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--fs-subtle)] border-t-[var(--fs-heading)]"
              aria-label="Loading listings"
            />
          </div>
        ) : mergedSource.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--fs-muted)]">
            {error ? "Listings temporarily unavailable." : "No listings to display yet."}
          </p>
        ) : (
          <>
            {compact && sortByRentYieldDesc ? (
              <p className="mb-4 text-sm text-[var(--fs-subtle)]" aria-live="polite">
                {topYieldMeta?.fromCache ? (
                  <>
                    Showing {listings.length} cached top-yield picks
                    {topYieldMeta.updatedAt
                      ? ` (refreshed ${new Date(topYieldMeta.updatedAt).toLocaleString()})`
                      : ""}
                    .
                    {minRentYieldPercent !== undefined && Number.isFinite(minRentYieldPercent)
                      ? ` Each has gross / rent yield ≥ ${minRentYieldPercent}% p.a. (saved snapshot).`
                      : ""}
                  </>
                ) : minRentYieldPercent !== undefined && Number.isFinite(minRentYieldPercent) ? (
                  <>
                    Showing up to {maxItems ?? listings.length} listings with yield ≥ {minRentYieldPercent}% (highest
                    first). {listings.length} matched from {totalLoaded} projects loaded from the full API catalogue (up
                    to {scanPages} × {FUSION_LISTINGS_PAGE_SIZE_MAX} per page).
                    {preferCachedTopYield && topYieldMeta && !topYieldMeta.fromCache
                      ? " Optional: save a server-side snapshot to skip this scan on each visit."
                      : null}
                  </>
                ) : (
                  <>
                    Showing the top {listings.length} by gross / rent yield from {totalLoaded} projects loaded from the
                    full API catalogue (up to {scanPages} × {FUSION_LISTINGS_PAGE_SIZE_MAX} per page).
                    {preferCachedTopYield && topYieldMeta && !topYieldMeta.fromCache
                      ? " Optional: save a server-side snapshot to skip this scan on each visit."
                      : null}
                  </>
                )}
              </p>
            ) : (
              <p className="mb-4 text-sm text-[var(--fs-subtle)]" aria-live="polite">
                {hasActiveFilters ? (
                  <>
                    {listings.length} matching on page {page} (of {totalLoaded} loaded on this page)
                  </>
                ) : (
                  <>
                    {totalLoaded} {totalLoaded === 1 ? "listing" : "listings"} on page {page}
                  </>
                )}
              </p>
            )}
            {listings.length === 0 ? (
              <div className="rounded-xl border border-[var(--fs-border)] bg-[var(--fs-band)] px-4 py-10 text-center">
                <p className="text-sm text-[var(--fs-muted)]">
                  {compact &&
                  minRentYieldPercent !== undefined &&
                  Number.isFinite(minRentYieldPercent) &&
                  !hasActiveFilters ? (
                    <>
                      No listings in the last scan had gross / rent yield of at least {minRentYieldPercent}% p.a.
                      Increase &ldquo;API pages to scan&rdquo; in the builder or lower the minimum yield.
                    </>
                  ) : !compact && yieldBandFilter && listingsYieldBand !== "all" ? (
                    <>
                      No listings on this page match &ldquo;
                      {listingsYieldBand === "atLeast" ? `${yieldBandFilter.floorPercent}% and higher` : `under ${yieldBandFilter.floorPercent}%`}
                      &rdquo; with the current filters. Try a different rental return band or another page.
                    </>
                  ) : (
                    "No listings match your filters."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTypeCategoryId("");
                    if (yieldBandFilter) setListingsYieldBand(yieldBandFilter.defaultBand);
                  }}
                  className="mt-4 text-sm font-medium text-[var(--brand-secondary)] underline-offset-2 hover:underline"
                  style={{ color: "var(--brand-secondary)" }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((property, index) => (
                  <Link
                    key={`${property.id}-${index}`}
                    href={`/property/${encodeURIComponent(property.slug)}`}
                    className="block rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-card)] p-6 shadow-[var(--fs-shadow)] transition hover:bg-[var(--fs-listing-hover)]"
                  >
                    <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[var(--fs-image-placeholder)] text-xs text-[var(--fs-subtle)]">
                      {property.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={property.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "Listing"
                      )}
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--fs-subtle)]">{property.type}</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--fs-heading)]">{property.title}</h3>
                    <p className="mt-1 text-sm text-[var(--fs-muted)]">{property.location}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--fs-text)]">
                      <span className="font-medium" style={{ color: "var(--brand-secondary, #34d399)" }}>
                        {property.price}
                      </span>
                      <span className="text-[var(--fs-faint)]">·</span>
                      <span>{property.yield}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!compact ? (
              <ListingsPagination
                variant="themed"
                page={page}
                hasPrev={hasPrevPage}
                hasNext={hasNextPage}
                onPrev={goPrev}
                onNext={goNext}
              />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
