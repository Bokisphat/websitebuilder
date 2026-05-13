"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteThemeFrame } from "@/components/site/SiteThemeFrame";
import { SitePreviewHeaderRow, type SitePreviewNavItem } from "@/components/site/SitePreviewHeaderRow";
import { SitePageSections } from "@/components/site/SitePageSections";
import {
  BUILDER_PREVIEW_STORAGE_KEY,
  loadBuilderPreviewFromStorage,
} from "@/lib/builder-preview-storage";
import { buildLifestyleCorridorsNavItems } from "@/lib/lifestyle-corridors-nav";
import { appendReferralPartnersNavItem } from "@/lib/referral-partners-nav";
import type { SiteConfig } from "@/lib/site-model";
import {
  isRealEstatePortalTemplate,
  withBrandingDefaults,
  withSiteConfigDefaults,
} from "@/lib/site-model";

function previewNavLabel(pageId: string, fallbackName: string): string {
  const map: Record<string, string> = {
    home: "Home",
    listings: "Listings",
    about: "About",
    contact: "Contact",
  };
  return map[pageId] ?? fallbackName;
}

function BuilderPreviewContent() {
  const searchParams = useSearchParams();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = useCallback(() => {
    setSite(loadBuilderPreviewFromStorage());
  }, []);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== BUILDER_PREVIEW_STORAGE_KEY) return;
      if (e.newValue) {
        try {
          const data = JSON.parse(e.newValue) as SiteConfig;
          if (data?.pages) setSite(data);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const pageParam = searchParams.get("page");

  const pageId = useMemo(() => {
    if (!site?.pages?.length) return "home";
    if (!pageParam) return "home";
    return site.pages.some((p) => p.id === pageParam) ? pageParam : "home";
  }, [site, pageParam]);

  const activePage = useMemo(() => {
    if (!site?.pages?.length) return null;
    return site.pages.find((p) => p.id === pageId) ?? site.pages[0] ?? null;
  }, [site, pageId]);

  const fusionLayoutId = useMemo(
    () => (site ? withSiteConfigDefaults(site).templateId : "custom"),
    [site],
  );

  const navItems: SitePreviewNavItem[] | undefined = useMemo(() => {
    if (!site?.pages?.length) return undefined;

    const branding = withBrandingDefaults(site.branding);
    const rp = branding.referralPartnersUrl.trim();

    let items: SitePreviewNavItem[] | undefined;

    if (isRealEstatePortalTemplate(fusionLayoutId)) {
      items = buildLifestyleCorridorsNavItems(pageId, "fullPage");
    } else if (site.pages.length >= 2) {
      items = site.pages.map((p) => ({
        id: p.id,
        label: previewNavLabel(p.id, p.name),
        href: p.id === "home" ? "/builder/preview" : `/builder/preview?page=${encodeURIComponent(p.id)}`,
        active: p.id === pageId,
      }));
    } else if (rp) {
      const p = site.pages[0];
      items = [
        {
          id: p.id,
          label: previewNavLabel(p.id, p.name),
          href: p.id === "home" ? "/builder/preview" : `/builder/preview?page=${encodeURIComponent(p.id)}`,
          active: p.id === pageId,
        },
      ];
    }

    if (!items?.length && !rp) return undefined;

    return appendReferralPartnersNavItem(items ?? [], branding.referralPartnersUrl);
  }, [site, pageId, fusionLayoutId]);

  /** Honour `#listings`, `#session-interest`, etc. after sections paint (standalone preview has no duplicate scroll bug). */
  useEffect(() => {
    if (!mounted || !site) return;
    const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!raw) return;

    const scrollToHash = () => {
      try {
        const id = decodeURIComponent(raw);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        /* ignore malformed hash */
      }
    };

    requestAnimationFrame(scrollToHash);
    const t = setTimeout(scrollToHash, 150);
    return () => clearTimeout(t);
  }, [mounted, site, pageId]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--fusion-builder-page)] text-sm text-zinc-600">
        Loading preview…
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-[var(--fusion-builder-page)] px-6 py-20 text-zinc-800">
        <div className="mx-auto max-w-lg rounded-2xl border border-zinc-300 bg-white p-8 shadow-lg shadow-zinc-400/15">
          <h1 className="text-lg font-semibold text-zinc-900">No preview data yet</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Open the <strong>website builder</strong>, load or build a site, then use{" "}
            <span className="font-medium text-[var(--fusion-builder-accent)]">Open full-page preview in new tab</span> so
            the current draft is saved for this view.
          </p>
          <Link
            href="/builder"
            className="mt-6 inline-block rounded-xl bg-[var(--fusion-builder-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)]"
          >
            Go to builder
          </Link>
        </div>
      </div>
    );
  }

  const publishStatus = site.publishStatus ?? "draft";

  return (
    <div className="min-h-screen bg-[var(--fusion-builder-page)]">
      <div className="border-b border-zinc-300/90 bg-white/90 px-4 py-2 text-xs text-zinc-600 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-zinc-900">Full-page preview</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span>
              Resize the window or use the browser’s responsive / device mode to test screen sizes. Updates when you change
              the site in the builder (this tab or another tab).
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="hidden rounded bg-zinc-200 px-2 py-0.5 text-[10px] text-zinc-600 sm:inline">/builder/preview</code>
            <Link
              href="/builder"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              Back to editor
            </Link>
          </div>
        </div>
      </div>

      <SiteThemeFrame site={site} className="w-full min-w-0">
        <div className="border-b border-[var(--fs-border)] bg-[var(--fs-page-bg)]/95 px-4 py-3 sm:px-6">
          <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)]">
            <SitePreviewHeaderRow
              branding={site.branding}
              publishStatus={publishStatus}
              navItems={navItems}
              navPresentation={isRealEstatePortalTemplate(fusionLayoutId) ? "inline-separated" : "pills"}
            />
          </div>
        </div>
        <div className="w-full min-w-0">
          {activePage ? (
            <SitePageSections
              page={activePage}
              bookingUrl={withBrandingDefaults(site.branding).bookingUrl}
              fusionTemplate={fusionLayoutId}
            />
          ) : null}
        </div>
      </SiteThemeFrame>
    </div>
  );
}

export default function BuilderPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--fusion-builder-page)] text-sm text-zinc-600">
          Loading preview…
        </div>
      }
    >
      <BuilderPreviewContent />
    </Suspense>
  );
}
