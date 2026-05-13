"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FeaturedListingsSectionConfig } from "@/app/lib/section-config";
import { DEFAULT_LISTINGS_SAMPLE_DISCLAIMER } from "@/components/sections/FeaturedListings";
import { ListingsPagination } from "@/components/sections/ListingsPagination";
import { PROPERTY_TYPE_CATEGORY_OPTIONS } from "@/app/lib/property-type-categories";
import { filterFusionProperties } from "@/app/lib/property-listing-filters";
import { useFusionPropertiesList } from "@/app/lib/use-fusion-properties-list";

export function FeaturedListingsSection({
  section,
  siteId: _siteId,
}: {
  section: FeaturedListingsSectionConfig;
  siteId: string;
}) {
  const { listings: fetched, loading, error, page, setPage, hasNextPage, hasPrevPage, goNext, goPrev } =
    useFusionPropertiesList();

  const [query, setQuery] = useState("");
  const [typeCategoryId, setTypeCategoryId] = useState("");

  useEffect(() => {
    setPage(1);
  }, [query, typeCategoryId, setPage]);

  /** Filter this page’s batch first, then apply maxItems for the layout cap. */
  const filtered = useMemo(
    () => filterFusionProperties(fetched, query, typeCategoryId),
    [fetched, query, typeCategoryId],
  );

  const displayed = useMemo(() => {
    if (section.maxItems != null && section.maxItems >= 0) {
      return filtered.slice(0, section.maxItems);
    }
    return filtered;
  }, [filtered, section.maxItems]);

  const showDisclaimer = section.showSampleDisclaimer !== false;
  const disclaimerText =
    section.sampleDisclaimer?.trim() || DEFAULT_LISTINGS_SAMPLE_DISCLAIMER;
  const hasActiveFilters = Boolean(query.trim() || typeCategoryId);

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-white">{section.title}</h2>
          {section.subtitle ? <p className="mt-2 text-zinc-400">{section.subtitle}</p> : null}
        </div>

        {showDisclaimer ? (
          <p className="mb-8 rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-left text-sm leading-relaxed text-zinc-400">
            {disclaimerText}
          </p>
        ) : null}

        {!loading && !error && fetched.length > 0 ? (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="block min-w-[min(100%,14rem)] flex-1 sm:max-w-md">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Search</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Location, type, price, keyword…"
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20"
              />
            </label>
            <label className="block w-full min-w-[min(100%,12rem)] sm:min-w-[13.5rem] sm:max-w-[18rem]">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Property type</span>
              <select
                value={typeCategoryId}
                onChange={(e) => setTypeCategoryId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20"
              >
                <option value="">All types</option>
                {PROPERTY_TYPE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeCategoryId("");
                }}
                className="rounded-xl border border-white/15 bg-zinc-900/60 px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800/80"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && fetched.length > 0 ? (
          <p className="mb-4 text-xs text-zinc-500">
            Search and property type apply to the listings loaded on this page (up to 20 per page).
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite">
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-100"
              aria-label="Loading listings"
            />
          </div>
        ) : error ? (
          <p className="py-10 text-center text-sm text-zinc-400">Listings temporarily unavailable</p>
        ) : fetched.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">No listings to display yet.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500" aria-live="polite">
              {hasActiveFilters ? (
                <>
                  Showing {displayed.length} of {filtered.length} matching on page {page} ({fetched.length} loaded on this
                  page)
                </>
              ) : section.maxItems != null && section.maxItems >= 0 && fetched.length > displayed.length ? (
                <>
                  Showing {displayed.length} of {fetched.length} on page {page} (max {section.maxItems} on this layout)
                </>
              ) : (
                <>
                  {displayed.length} {displayed.length === 1 ? "listing" : "listings"} on page {page}
                </>
              )}
            </p>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-10 text-center">
                <p className="text-sm text-zinc-400">No listings match your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTypeCategoryId("");
                  }}
                  className="mt-4 text-sm font-medium text-white underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayed.map((property, index) => (
                  <Link
                    key={`${property.id}-${index}`}
                    id={`listing-${property.slug}`}
                    href={`/property/${encodeURIComponent(property.slug)}`}
                    className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/40 p-6 shadow-xl shadow-black/20 transition hover:border-white/20 hover:bg-zinc-900/60"
                  >
                    <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-zinc-800 text-sm text-zinc-500">
                      {property.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={property.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "Listing visual"
                      )}
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{property.type}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{property.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{property.location}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
                      <span>{property.price}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{property.yield}</span>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand-primary,#fafafa)] px-4 py-3 text-sm font-semibold text-zinc-950 ring-1 ring-white/10">
                        View details
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <ListingsPagination
              variant="dark"
              page={page}
              hasPrev={hasPrevPage}
              hasNext={hasNextPage}
              onPrev={goPrev}
              onNext={goNext}
            />
          </>
        )}

        <p className="mt-8 text-center text-xs text-zinc-600">
          <Link href="/" className="underline hover:text-zinc-400">
            Fusion Sites
          </Link>
        </p>
      </div>
    </section>
  );
}
