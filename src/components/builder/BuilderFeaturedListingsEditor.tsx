"use client";

import { useRef, useState } from "react";
import {
  coerceManualListingMode,
  normalizeManualListingsFromUnknown,
  type ManualListingMode,
} from "@/app/lib/manual-listings";
import type {
  FeaturedListingsProps,
  ListingsYieldBand,
  YieldBandFilterConfig,
} from "@/components/sections/FeaturedListings";
import { coerceSectionImageAlign } from "@/components/sections/OptionalSectionImage";
import { isRealEstatePortalTemplate, withSiteConfigDefaults, type SiteConfig } from "@/lib/site-model";
import { patchPageSectionProps } from "@/lib/patch-page-section";
import { SectionImageFields } from "./SectionImageFields";

type Props = {
  site: SiteConfig;
  pageId: string;
  sectionId: string;
  onChange: (next: SiteConfig) => void;
  props: Record<string, unknown>;
  onRequestPexels: () => void;
};

function readYieldBandFilter(raw: Record<string, unknown>): YieldBandFilterConfig | undefined {
  const yb = raw.yieldBandFilter;
  if (!yb || typeof yb !== "object" || Array.isArray(yb)) return undefined;
  const o = yb as Record<string, unknown>;
  const floorRaw = o.floorPercent;
  if (typeof floorRaw !== "number" || !Number.isFinite(floorRaw)) return undefined;
  const floorPercent = Math.min(100, Math.max(0, floorRaw));
  const db = o.defaultBand;
  const defaultBand: ListingsYieldBand =
    db === "atLeast" || db === "below" || db === "all" ? db : "atLeast";
  return { floorPercent, defaultBand };
}

function read(raw: Record<string, unknown>) {
  const maxRaw = raw.maxItems;
  const maxItems =
    typeof maxRaw === "number" && Number.isFinite(maxRaw) && maxRaw > 0 ? Math.floor(maxRaw) : undefined;
  const scanRaw = raw.yieldRankingScanPages;
  const yieldRankingScanPages =
    typeof scanRaw === "number" && Number.isFinite(scanRaw)
      ? Math.min(500, Math.max(1, Math.floor(scanRaw)))
      : undefined;
  const minYieldRaw = raw.minRentYieldPercent;
  const minRentYieldPercent =
    typeof minYieldRaw === "number" && Number.isFinite(minYieldRaw) && minYieldRaw >= 0
      ? Math.min(100, minYieldRaw)
      : undefined;
  const manualListings = Array.isArray(raw.manualListings) ? raw.manualListings : [];
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    anchorId: typeof raw.anchorId === "string" ? raw.anchorId : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    imageAlt: typeof raw.imageAlt === "string" ? raw.imageAlt : undefined,
    imageCredit: typeof raw.imageCredit === "string" ? raw.imageCredit : undefined,
    imageAlign: coerceSectionImageAlign(raw.imageAlign),
    showSampleDisclaimer: raw.showSampleDisclaimer === false ? false : true,
    sampleDisclaimer: typeof raw.sampleDisclaimer === "string" ? raw.sampleDisclaimer : undefined,
    sortByRentYieldDesc: raw.sortByRentYieldDesc === true,
    preferCachedTopYield: raw.preferCachedTopYield === true,
    maxItems,
    yieldRankingScanPages,
    minRentYieldPercent,
    yieldBandFilter: readYieldBandFilter(raw),
    manualListings,
    manualListingMode: coerceManualListingMode(raw.manualListingMode),
  };
}

export function BuilderFeaturedListingsEditor({ site, pageId, sectionId, onChange, props: rawProps, onRequestPexels }: Props) {
  const p = read(rawProps);
  const isCompactTeaser = Boolean(p.sortByRentYieldDesc && p.maxItems != null && p.maxItems > 0);
  const fusionTemplate = withSiteConfigDefaults(site).templateId;
  const showManualStock = isRealEstatePortalTemplate(fusionTemplate);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadHint, setUploadHint] = useState<string | null>(null);
  const [syncHint, setSyncHint] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const normalizedManual = normalizeManualListingsFromUnknown(p.manualListings);

  const patch = (partial: Partial<FeaturedListingsProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  const onUploadJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploadHint(null);
    try {
      const text = await f.text();
      const parsed: unknown = JSON.parse(text);
      const rawRows = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && !Array.isArray(parsed) && "listings" in parsed
          ? (parsed as { listings: unknown }).listings
          : null;
      const rows = normalizeManualListingsFromUnknown(rawRows);
      if (rows.length === 0) {
        setUploadHint("No valid listings found (need title on each row).");
        return;
      }
      patch({ manualListings: rows });
      setUploadHint(`Loaded ${rows.length} listing${rows.length === 1 ? "" : "s"} (max 80).`);
    } catch {
      setUploadHint("Could not read JSON.");
    }
  };

  const publishToDataFile = async (replaceAll: boolean) => {
    if (normalizedManual.length === 0) {
      setSyncHint("Upload listings in the builder first.");
      return;
    }
    setSyncBusy(true);
    setSyncHint(null);
    try {
      const res = await fetch("/api/manual-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: normalizedManual, replaceAll }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; count?: number };
      if (!res.ok || !data.success) {
        setSyncHint(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      setSyncHint(
        replaceAll
          ? `Wrote ${data.count ?? normalizedManual.length} listings to data/manual-listings.json.`
          : `Merged; ${data.count ?? "—"} total rows in data/manual-listings.json.`,
      );
    } catch {
      setSyncHint("Network error while saving.");
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Featured listings</p>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Section title</span>
        <input
          value={p.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Anchor ID (optional)</span>
        <input
          value={p.anchorId ?? ""}
          onChange={(e) => patch({ anchorId: e.target.value.trim() || undefined })}
          placeholder="listings"
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
        <span className="mt-1 block text-[10px] text-zinc-500">Matches hero CTAs linking to #listings</span>
      </label>
      <div className="space-y-2 rounded-md border border-zinc-200 bg-white/80 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Yield ranking (homepage teaser)</p>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={p.sortByRentYieldDesc}
            onChange={(e) => patch({ sortByRentYieldDesc: e.target.checked })}
            className="mt-0.5 rounded border-zinc-300 text-[var(--fusion-builder-accent)] focus:ring-[var(--fusion-builder-accent)]"
          />
          <span className="text-[10px] leading-snug text-zinc-600">
            Sort by highest gross / rent yield. The API merges the full Fusion listing feed (up to the page cap below),
            then ranks and caps the grid.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={p.preferCachedTopYield}
            disabled={!isCompactTeaser}
            onChange={(e) => patch({ preferCachedTopYield: e.target.checked })}
            className="mt-0.5 rounded border-zinc-300 text-[var(--fusion-builder-accent)] focus:ring-[var(--fusion-builder-accent)] disabled:opacity-50"
          />
          <span className="text-[10px] leading-snug text-zinc-600">
            Prefer cached top-yield picks file (`data/top-yield-picks.json`). Visitors load instantly; falls back to a
            live full-catalog scan if the file is missing. Rebuild with POST `/api/properties/top-yield/refresh`.
          </span>
        </label>
        <label className="block">
          <input
            type="number"
            min={1}
            max={50}
            value={p.maxItems ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              patch({ maxItems: v === "" ? undefined : Math.max(1, Math.min(50, parseInt(v, 10) || 1)) });
            }}
            placeholder="e.g. 6"
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Max API pages (full feed cap)</span>
          <input
            type="number"
            min={1}
            max={500}
            value={p.yieldRankingScanPages ?? (p.sortByRentYieldDesc ? 500 : "")}
            disabled={!p.sortByRentYieldDesc}
            onChange={(e) => {
              const v = e.target.value;
              patch({
                yieldRankingScanPages: v === "" ? undefined : Math.max(1, Math.min(500, parseInt(v, 10) || 1)),
              });
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70 disabled:opacity-50"
          />
          <span className="mt-1 block text-[10px] text-zinc-500">
            Server walks up to this many pages (20 projects each) until the list is exhausted — use 500 for the full API
            catalogue (default).
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Minimum yield (% p.a.)</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={p.minRentYieldPercent ?? ""}
            disabled={!p.sortByRentYieldDesc}
            onChange={(e) => {
              const v = e.target.value.trim();
              patch({
                minRentYieldPercent:
                  v === "" ? undefined : Math.min(100, Math.max(0, Number.parseFloat(v) || 0)),
              });
            }}
            placeholder="e.g. 5 — only show at or above this yield before top-N"
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70 disabled:opacity-50"
          />
          <span className="mt-1 block text-[10px] text-zinc-500">Leave blank for no floor.</span>
        </label>
      </div>
      <div className="space-y-2 rounded-md border border-zinc-200 bg-white/80 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Full listings grid — rental return filter
        </p>
        {isCompactTeaser ? (
          <p className="text-[10px] leading-snug text-amber-800">
            This block is in homepage teaser mode (yield ranking + max items). The visitor yield dropdown applies only on a
            full searchable grid; turn off teaser mode on this section to use it.
          </p>
        ) : (
          <p className="text-[10px] leading-snug text-zinc-600">
            Optional: default the listings page to a yield band (e.g. 5%+). Visitors can switch to under that threshold or
            all returns.
          </p>
        )}
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={p.yieldBandFilter != null}
            disabled={isCompactTeaser}
            onChange={(e) => {
              if (e.target.checked) {
                patch({ yieldBandFilter: { floorPercent: 5, defaultBand: "atLeast" } });
              } else {
                patch({ yieldBandFilter: undefined });
              }
            }}
            className="mt-0.5 rounded border-zinc-300 text-[var(--fusion-builder-accent)] focus:ring-[var(--fusion-builder-accent)] disabled:opacity-50"
          />
          <span className="text-[10px] leading-snug text-zinc-600">
            Enable rental return band filter (default threshold + under / all options in the live UI)
          </span>
        </label>
        {p.yieldBandFilter && !isCompactTeaser ? (
          <>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Threshold (% p.a.)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={p.yieldBandFilter.floorPercent}
                onChange={(e) => {
                  const n = Number.parseFloat(e.target.value);
                  if (!Number.isFinite(n)) return;
                  patch({
                    yieldBandFilter: {
                      ...p.yieldBandFilter!,
                      floorPercent: Math.min(100, Math.max(0, n)),
                    },
                  });
                }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Default when page opens</span>
              <select
                value={p.yieldBandFilter.defaultBand}
                onChange={(e) => {
                  const defaultBand = e.target.value as ListingsYieldBand;
                  patch({
                    yieldBandFilter: { ...p.yieldBandFilter!, defaultBand },
                  });
                }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              >
                <option value="atLeast">At least threshold (e.g. 5%+)</option>
                <option value="below">Under threshold</option>
                <option value="all">All returns</option>
              </select>
            </label>
          </>
        ) : null}
      </div>
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={p.showSampleDisclaimer}
          onChange={(e) => patch({ showSampleDisclaimer: e.target.checked })}
          className="mt-0.5 rounded border-zinc-300 text-[var(--fusion-builder-accent)] focus:ring-[var(--fusion-builder-accent)]"
        />
        <span className="text-[10px] leading-snug text-zinc-600">
          Show sample disclaimer (reassures visitors this grid is not the full inventory).
        </span>
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Custom disclaimer (optional)</span>
        <textarea
          rows={3}
          value={p.sampleDisclaimer ?? ""}
          onChange={(e) => patch({ sampleDisclaimer: e.target.value.trim() ? e.target.value : undefined })}
          placeholder="Leave blank to use the default message."
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <SectionImageFields
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
        imageAlign={p.imageAlign}
        onPatch={(partial) => patch(partial as Partial<FeaturedListingsProps>)}
        onRequestPexels={onRequestPexels}
      />

      {showManualStock ? (
        <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50/80 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            Your own listings (Real Estate themes)
          </p>
          <p className="text-[10px] leading-snug text-emerald-900/90">
            Upload a JSON array (or <code className="rounded bg-white/80 px-0.5">{"{ \"listings\": [...] }"}</code>
            ). <strong>Replace</strong> shows only your rows in this section (no Fusion fetch). <strong>Prepend</strong>{" "}
            puts your rows first on homepage teaser strips, then Fusion (deduped by slug). Full grids use the Fusion feed
            unless Replace is on. Property detail pages need{" "}
            <code className="rounded bg-white/80 px-0.5">data/manual-listings.json</code> — use the buttons below after
            upload.
          </p>
          <a
            href="/templates/manual-listings.example.json"
            download="manual-listings.example.json"
            className="inline-block text-[10px] font-medium text-emerald-800 underline underline-offset-2"
          >
            Download example JSON
          </a>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase text-emerald-900/80">How manual rows mix with Fusion</span>
            <select
              value={p.manualListingMode}
              onChange={(e) => patch({ manualListingMode: e.target.value as ManualListingMode })}
              className="w-full rounded-lg border border-emerald-200/80 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-emerald-500/70"
            >
              <option value="off">Off — Fusion API only</option>
              <option value="replace">Replace — this section uses only uploaded rows</option>
              <option value="prepend">Prepend — teaser strips: yours first, then Fusion</option>
            </select>
          </label>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onUploadJson} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-emerald-300 bg-white px-2 py-1.5 text-[10px] font-medium text-emerald-900 hover:bg-emerald-50"
            >
              Upload JSON…
            </button>
            <button
              type="button"
              onClick={() => {
                patch({ manualListings: undefined, manualListingMode: "off" });
                setUploadHint(null);
                setSyncHint(null);
              }}
              disabled={normalizedManual.length === 0 && p.manualListingMode === "off"}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              Clear uploaded rows &amp; mode
            </button>
          </div>
          <p className="text-[10px] text-emerald-900/85">
            Stored in this site draft: <strong>{normalizedManual.length}</strong> listing
            {normalizedManual.length === 1 ? "" : "s"}.
          </p>
          {uploadHint ? <p className="text-[10px] text-emerald-900">{uploadHint}</p> : null}
          <div className="flex flex-wrap gap-2 border-t border-emerald-200/60 pt-2">
            <button
              type="button"
              disabled={syncBusy || normalizedManual.length === 0}
              onClick={() => void publishToDataFile(true)}
              className="rounded-lg border border-emerald-600 bg-emerald-700 px-2 py-1.5 text-[10px] font-medium text-white hover:bg-emerald-800 disabled:opacity-40"
            >
              Save to server file (replace)
            </button>
            <button
              type="button"
              disabled={syncBusy || normalizedManual.length === 0}
              onClick={() => void publishToDataFile(false)}
              className="rounded-lg border border-emerald-400 bg-white px-2 py-1.5 text-[10px] font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-40"
            >
              Merge into server file
            </button>
          </div>
          <p className="text-[10px] leading-snug text-emerald-900/75">
            Allowed in development by default. In production, set{" "}
            <code className="rounded bg-white/80 px-0.5">MANUAL_LISTINGS_ALLOW_WRITE=true</code>.
          </p>
          {syncHint ? <p className="text-[10px] font-medium text-emerald-900">{syncHint}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
