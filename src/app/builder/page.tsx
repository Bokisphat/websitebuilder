"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BuilderDualKeyEditor } from "@/components/builder/BuilderDualKeyEditor";
import { BuilderFeaturedListingsEditor } from "@/components/builder/BuilderFeaturedListingsEditor";
import { BuilderHeroEditor } from "@/components/builder/BuilderHeroEditor";
import { BuilderInvestorStrategyEditor } from "@/components/builder/BuilderInvestorStrategyEditor";
import { BuilderLeadFormEditor } from "@/components/builder/BuilderLeadFormEditor";
import { BuilderSessionInterestEditor } from "@/components/builder/BuilderSessionInterestEditor";
import { BuilderSmsfEditor } from "@/components/builder/BuilderSmsfEditor";
import { BuilderTestimonialEditor } from "@/components/builder/BuilderTestimonialEditor";
import { BuilderTextImageEditor } from "@/components/builder/BuilderTextImageEditor";
import { BuilderVideoEmbedEditor } from "@/components/builder/BuilderVideoEmbedEditor";
import { BuilderTemplateGallery } from "@/components/builder/BuilderTemplateGallery";
import { PexelsImagePicker } from "@/components/builder/PexelsImagePicker";
import { SitePageSections } from "@/components/site/SitePageSections";
import { patchPageSectionProps } from "@/lib/patch-page-section";
import type { HeroSectionProps } from "@/components/sections/HeroSection";
import {
  createBlankSection,
  SECTION_TYPE_OPTIONS,
  type BuilderSectionType,
} from "@/lib/site-section-defaults";
import { LogoUploadField } from "@/components/builder/LogoUploadField";
import { SitePreviewHeaderRow, type SitePreviewNavItem } from "@/components/site/SitePreviewHeaderRow";
import { SiteThemeFrame } from "@/components/site/SiteThemeFrame";
import { saveBuilderPreviewToStorage } from "@/lib/builder-preview-storage";
import { memberSitesClientHeaders } from "@/lib/member-sites/client-fetch";
import { duplicateSiteConfig } from "@/lib/site-generator";
import type { SiteColorScheme, SiteConfig, SiteContentWidth, SiteTemplateId } from "@/lib/site-model";
import {
  isRealEstatePortalTemplate,
  isSiteTemplateId,
  LOGO_SIZE_PERCENT_MAX,
  LOGO_SIZE_PERCENT_MIN,
  normalizeLogoSizePercent,
  SITE_COLOR_SCHEME_CHOICES,
  SITE_TEMPLATE_IDS,
  withBrandingDefaults,
  withSiteConfigDefaults,
} from "@/lib/site-model";
import { HOMEPAGE_TEMPLATE_ITEMS } from "@/lib/homepage-templates";
import { buildLifestyleCorridorsNavItems } from "@/lib/lifestyle-corridors-nav";
import { appendReferralPartnersNavItem } from "@/lib/referral-partners-nav";
import { SITE_TEMPLATE_BUILDERS } from "@/lib/site-templates";

function cloneSite(site: SiteConfig): SiteConfig {
  const s = JSON.parse(JSON.stringify(site)) as SiteConfig;
  if (!s.publishStatus) s.publishStatus = "draft";
  return s;
}

function readFirstHero(site: SiteConfig, pageId: string): HeroSectionProps {
  const page = site.pages.find((p) => p.id === pageId);
  const hero = page?.sections.find((s) => s.type === "hero");
  const props = (hero?.props ?? {}) as Partial<HeroSectionProps>;
  const rawTags = props.strategyTags;
  const strategyTags = Array.isArray(rawTags)
    ? rawTags.filter((t): t is string => typeof t === "string")
    : undefined;
  return {
    headline: props.headline ?? "",
    subheadline: props.subheadline,
    ctaLabel: props.ctaLabel ?? "View",
    ctaHref: props.ctaHref ?? "#",
    imageUrl: props.imageUrl,
    imageAlt: props.imageAlt,
    imageCredit: props.imageCredit,
    imageAlign: props.imageAlign,
    variant: props.variant,
    spotlightLabel: props.spotlightLabel,
    spotlightTitle: props.spotlightTitle,
    spotlightPrice: props.spotlightPrice,
    spotlightLocation: props.spotlightLocation,
    spotlightBeds: props.spotlightBeds,
    spotlightBaths: props.spotlightBaths,
    spotlightCars: props.spotlightCars,
    strategyTags,
  };
}

function patchFirstHero(site: SiteConfig, pageId: string, patch: Partial<HeroSectionProps>): SiteConfig {
  const page = site.pages.find((p) => p.id === pageId);
  const heroId = page?.sections.find((s) => s.type === "hero")?.id;
  if (!heroId) return site;
  return patchPageSectionProps(site, pageId, heroId, patch as Record<string, unknown>);
}

function appendPageSection(site: SiteConfig, pageId: string, section: SiteConfig["pages"][0]["sections"][0]): SiteConfig {
  return {
    ...site,
    pages: site.pages.map((p) => (p.id === pageId ? { ...p, sections: [...p.sections, section] } : p)),
  };
}

function movePageSection(site: SiteConfig, pageId: string, index: number, direction: -1 | 1): SiteConfig {
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) return site;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= page.sections.length) return site;
  const sections = [...page.sections];
  const tmp = sections[index];
  sections[index] = sections[nextIndex];
  sections[nextIndex] = tmp;
  return {
    ...site,
    pages: site.pages.map((p) => (p.id === pageId ? { ...p, sections } : p)),
  };
}

function builderNavTabLabel(pageId: string, pageName: string): string {
  const map: Record<string, string> = {
    home: "Home",
    listings: "Listings",
    about: "About",
    contact: "Contact",
  };
  return map[pageId] ?? pageName;
}

function generateNewPageId(site: SiteConfig, suggestedName: string): string {
  const base =
    suggestedName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "page";
  let id = base;
  let n = 1;
  while (site.pages.some((p) => p.id === id)) {
    id = `${base}-${n++}`;
  }
  return id;
}

function sectionLabel(type: string): string {
  return SECTION_TYPE_OPTIONS.find((o) => o.type === type)?.label ?? type;
}

type BuilderPhase = "select" | "edit";

type PexelsPickTarget =
  | { mode: "sectionImage"; sectionId: string }
  | { mode: "heroBackdrop"; sectionId: string };

const MEMBER_SITE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function BuilderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteIdParam = searchParams.get("siteId");
  const templateParam = searchParams.get("template");
  const didApplyFromQuery = useRef(false);
  const remoteSiteIdRef = useRef<string | null>(null);
  const lastRemoteSaveJson = useRef<string>("");
  /** When true, choosing a template from the gallery should confirm before replacing the current site. */
  const browseForReplaceRef = useRef(false);
  /** Set when navigating from /member/sites "New site" — template pick persists via POST with templateId. */
  const memberPendingCreateRef = useRef<{ name: string } | null>(null);
  const memberCreateSubmittingRef = useRef(false);
  const [memberCreateError, setMemberCreateError] = useState<string | null>(null);
  const [memberCreateSubmitting, setMemberCreateSubmitting] = useState(false);
  const [phase, setPhase] = useState<BuilderPhase>("select");
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [replaceConfirm, setReplaceConfirm] = useState<SiteTemplateId | null>(null);
  const [addType, setAddType] = useState<BuilderSectionType>("hero");
  /** Which Text + image section is choosing a Pexels photo (preview click or sidebar). */
  const [pexelsPick, setPexelsPick] = useState<PexelsPickTarget | null>(null);
  /** Which page’s sections + hero shortcuts are being edited (matches site nav: Home, Listings, …). */
  const [editorPageId, setEditorPageId] = useState("home");
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [newPageNameDraft, setNewPageNameDraft] = useState("");
  const [newPageLinkedVideoUrl, setNewPageLinkedVideoUrl] = useState("");

  const applyTemplate = useCallback((id: SiteTemplateId) => {
    const builder = SITE_TEMPLATE_BUILDERS[id];
    if (!builder) return;
    setSite(cloneSite(builder.build()));
    setEditorPageId("home");
    browseForReplaceRef.current = false;
    setPhase("edit");
  }, []);

  useEffect(() => {
    if (siteIdParam && MEMBER_SITE_ID_RE.test(siteIdParam)) {
      memberPendingCreateRef.current = null;
      return;
    }
    if (searchParams.get("memberNew") === "1") {
      const raw = searchParams.get("name");
      let name = "New site";
      if (raw) {
        try {
          name = decodeURIComponent(raw).trim() || "New site";
        } catch {
          name = raw.trim() || "New site";
        }
      }
      memberPendingCreateRef.current = { name };
    } else {
      memberPendingCreateRef.current = null;
    }
  }, [siteIdParam, searchParams]);

  const goToTemplateGallery = useCallback(
    (fromEdit: boolean) => {
      if (fromEdit) browseForReplaceRef.current = true;
      else browseForReplaceRef.current = false;
      setPhase("select");
    },
    [],
  );

  const onPickTemplate = useCallback(
    (id: SiteTemplateId) => {
      if (browseForReplaceRef.current && site) {
        const current = withSiteConfigDefaults(site).templateId;
        if (current === id) {
          browseForReplaceRef.current = false;
          setPhase("edit");
          return;
        }
        setReplaceConfirm(id);
        return;
      }

      const pending = memberPendingCreateRef.current;
      if (pending) {
        if (memberCreateSubmittingRef.current) return;
        memberCreateSubmittingRef.current = true;
        setMemberCreateSubmitting(true);
        setMemberCreateError(null);

        void (async () => {
          try {
            const res = await fetch("/api/member/sites", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...memberSitesClientHeaders() },
              body: JSON.stringify({ name: pending.name, templateId: id }),
            });
            const data = (await res.json().catch(() => ({}))) as {
              id?: string;
              config?: SiteConfig;
              error?: string;
              hint?: string;
            };
            if (!res.ok) {
              const msg =
                data.error ??
                (res.status === 403 ? "Site limit reached." : `Could not create site (${res.status})`);
              const hint = typeof data.hint === "string" ? data.hint : "";
              setMemberCreateError(hint ? `${msg} ${hint}` : msg);
              memberCreateSubmittingRef.current = false;
              setMemberCreateSubmitting(false);
              return;
            }
            if (data.id && data.config) {
              const cfg = withSiteConfigDefaults(data.config);
              setSite(cfg);
              setEditorPageId("home");
              browseForReplaceRef.current = false;
              remoteSiteIdRef.current = data.id;
              lastRemoteSaveJson.current = JSON.stringify(cfg);
              memberPendingCreateRef.current = null;
              memberCreateSubmittingRef.current = false;
              setMemberCreateSubmitting(false);
              setPhase("edit");
              router.replace(`/builder?siteId=${encodeURIComponent(data.id)}`);
            } else {
              setMemberCreateError("Invalid response from server.");
              memberCreateSubmittingRef.current = false;
              setMemberCreateSubmitting(false);
            }
          } catch {
            setMemberCreateError("Network error. Check your connection and try again.");
            memberCreateSubmittingRef.current = false;
            setMemberCreateSubmitting(false);
          }
        })();
        return;
      }

      applyTemplate(id);
    },
    [applyTemplate, site, router],
  );

  const confirmTemplateReplace = useCallback(() => {
    if (!replaceConfirm) return;
    applyTemplate(replaceConfirm);
    setReplaceConfirm(null);
  }, [applyTemplate, replaceConfirm]);

  useEffect(() => {
    if (siteIdParam && MEMBER_SITE_ID_RE.test(siteIdParam)) return;
    if (didApplyFromQuery.current) return;
    if (!templateParam || !isSiteTemplateId(templateParam)) return;
    didApplyFromQuery.current = true;
    browseForReplaceRef.current = false;
    applyTemplate(templateParam);
  }, [siteIdParam, templateParam, applyTemplate]);

  useEffect(() => {
    if (!siteIdParam || !MEMBER_SITE_ID_RE.test(siteIdParam)) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/member/sites/${encodeURIComponent(siteIdParam)}`, {
        headers: memberSitesClientHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as { config?: SiteConfig; error?: string };
      if (!res.ok) {
        console.warn("[builder] Could not load saved site:", data.error ?? res.status);
        return;
      }
      if (!data.config || cancelled) return;
      const cfg = withSiteConfigDefaults(data.config);
      setSite(cfg);
      setPhase("edit");
      setEditorPageId("home");
      browseForReplaceRef.current = false;
      remoteSiteIdRef.current = siteIdParam;
      lastRemoteSaveJson.current = JSON.stringify(cfg);
    })();
    return () => {
      cancelled = true;
    };
  }, [siteIdParam]);

  useEffect(() => {
    if (phase !== "edit" || !site) return;
    const t = setTimeout(() => {
      saveBuilderPreviewToStorage(site);
    }, 400);
    return () => clearTimeout(t);
  }, [site, phase]);

  useEffect(() => {
    if (phase !== "edit" || !site) return;
    const rid = remoteSiteIdRef.current;
    if (!rid) return;
    const serialized = JSON.stringify(site);
    if (serialized === lastRemoteSaveJson.current) return;
    const t = setTimeout(() => {
      void fetch(`/api/member/sites/${encodeURIComponent(rid)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...memberSitesClientHeaders() },
        body: JSON.stringify({ config: site }),
      })
        .then((r) => {
          if (r.ok) lastRemoteSaveJson.current = serialized;
        })
        .catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [site, phase]);

  useEffect(() => {
    if (!site?.pages.length) return;
    if (!site.pages.some((p) => p.id === editorPageId)) {
      setEditorPageId(site.pages[0].id);
    }
  }, [site, editorPageId]);

  const openFullPagePreview = useCallback(() => {
    if (site) saveBuilderPreviewToStorage(site);
    window.open("/builder/preview", "_blank", "noopener,noreferrer");
  }, [site]);

  const hero = useMemo(() => {
    if (!site?.pages.length) return readFirstHero(EMPTY_SITE_PLACEHOLDER, "home");
    const pid = site.pages.find((p) => p.id === editorPageId)?.id ?? site.pages[0].id;
    return readFirstHero(site, pid);
  }, [site, editorPageId]);

  const activePage = useMemo(() => {
    if (!site?.pages.length) return null;
    return site.pages.find((p) => p.id === editorPageId) ?? site.pages[0];
  }, [site, editorPageId]);

  /** Site-wide builder fields (template, publish, branding, hero shortcuts) live on Home; other tabs edit that page’s sections only. */
  const editingHome = editorPageId === "home";

  const fusionLayoutId = useMemo(
    () => (site ? withSiteConfigDefaults(site).templateId : "custom"),
    [site],
  );

  const headerNavItems = useMemo((): SitePreviewNavItem[] | undefined => {
    if (!site?.pages?.length) return undefined;

    const branding = withBrandingDefaults(site.branding);
    const rp = branding.referralPartnersUrl.trim();

    let items: SitePreviewNavItem[] | undefined;

    if (isRealEstatePortalTemplate(fusionLayoutId)) {
      items = buildLifestyleCorridorsNavItems(editorPageId, "embedded", setEditorPageId);
    } else if (site.pages.length >= 2) {
      items = site.pages.map((p) => ({
        id: p.id,
        label: builderNavTabLabel(p.id, p.name),
        href: p.id === "home" ? "/builder/preview" : `/builder/preview?page=${encodeURIComponent(p.id)}`,
        active: p.id === editorPageId,
        onActivate: () => setEditorPageId(p.id),
      }));
    } else if (rp) {
      const p = site.pages[0];
      items = [
        {
          id: p.id,
          label: builderNavTabLabel(p.id, p.name),
          href: p.id === "home" ? "/builder/preview" : `/builder/preview?page=${encodeURIComponent(p.id)}`,
          active: p.id === editorPageId,
          onActivate: () => setEditorPageId(p.id),
        },
      ];
    }

    if (!items?.length && !rp) return undefined;

    return appendReferralPartnersNavItem(items ?? [], branding.referralPartnersUrl);
  }, [site, fusionLayoutId, editorPageId]);

  const publishStatus = site?.publishStatus ?? "draft";

  const setBranding = useCallback((patch: Partial<SiteConfig["branding"]>) => {
    setSite((s) => (!s ? s : { ...s, branding: { ...s.branding, ...patch } }));
  }, []);

  const setSiteName = useCallback((value: string) => {
    setSite((s) => (!s ? s : { ...s, name: value, branding: { ...s.branding, siteName: value } }));
  }, []);

  const setHeroField = useCallback(<K extends keyof HeroSectionProps>(key: K, value: HeroSectionProps[K]) => {
    setSite((s) => {
      if (!s?.pages.length) return s;
      const pid = s.pages.find((p) => p.id === editorPageId)?.id ?? s.pages[0].id;
      return patchFirstHero(s, pid, { [key]: value } as Partial<HeroSectionProps>);
    });
  }, [editorPageId]);

  const handleDuplicate = useCallback(() => {
    setSite((prev) => (!prev ? prev : duplicateSiteConfig(prev)));
    setEditorPageId("home");
    remoteSiteIdRef.current = null;
    lastRemoteSaveJson.current = "";
  }, []);

  const handleAddSection = useCallback(() => {
    setSite((s) => (!s ? s : appendPageSection(s, editorPageId, createBlankSection(addType))));
  }, [addType, editorPageId]);

  const confirmAddPage = useCallback(() => {
    if (!site) return;
    const name = newPageNameDraft.trim() || "New page";
    const id = generateNewPageId(site, name);
    const v = newPageLinkedVideoUrl.trim();
    setSite({
      ...site,
      pages: [
        ...site.pages,
        {
          id,
          name,
          sections: [createBlankSection("hero")],
          ...(v ? { linkedVideoUrl: v } : {}),
        },
      ],
    });
    setEditorPageId(id);
    setNewPageNameDraft("");
    setNewPageLinkedVideoUrl("");
    setAddPageOpen(false);
  }, [site, newPageNameDraft, newPageLinkedVideoUrl]);

  const removeEditorPage = useCallback(() => {
    if (!site || site.pages.length <= 1 || editorPageId === "home") return;
    const idx = site.pages.findIndex((p) => p.id === editorPageId);
    const remaining = site.pages.filter((p) => p.id !== editorPageId);
    const fallback = (idx > 0 ? remaining[idx - 1] : remaining[0])?.id ?? "home";
    setSite({ ...site, pages: remaining });
    setEditorPageId(fallback);
  }, [site, editorPageId]);

  if (phase === "select") {
    return (
      <div className="min-h-screen bg-[var(--fusion-builder-page)] text-zinc-900">
        <nav className="border-b border-zinc-300/90 bg-[var(--fusion-builder-page)]/90 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition">
              ← Fusion Sites
            </Link>
            <span className="text-xs uppercase tracking-wide text-zinc-500">Fusion V4 · Website builder</span>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">Choose a website template</h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Conversion-first property advisory sites — strategy positioning, live Fusion listings where it matters,
              and lead capture built for CRM workflows. Pick a template to preload copy, section order, and CTAs, then
              customise in the editor.
            </p>
            {searchParams.get("memberNew") === "1" && !siteIdParam ? (
              <p className="mt-4 text-sm leading-relaxed text-zinc-700">
                You&apos;re creating a new saved site. Choose a template below — it will be stored under your member
                account and listed on{" "}
                <Link href="/member/sites" className="font-medium text-[var(--fusion-builder-accent)] hover:underline">
                  My sites
                </Link>
                .
              </p>
            ) : null}
          </header>

          {memberCreateError ? (
            <div
              className="mx-auto mt-8 max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-900"
              role="alert"
            >
              {memberCreateError}
            </div>
          ) : null}

          {site ? (
            <p className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  browseForReplaceRef.current = false;
                  setPhase("edit");
                }}
                className="text-sm font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]"
              >
                ← Back to editor
              </button>
            </p>
          ) : null}
          <div className="mt-14">
            <BuilderTemplateGallery
              items={HOMEPAGE_TEMPLATE_ITEMS}
              onChooseTemplate={onPickTemplate}
              disabled={memberCreateSubmitting}
            />
          </div>
        </main>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-[var(--fusion-builder-page)] px-6 py-24 text-center text-zinc-600">
        <p className="text-sm">No site loaded.</p>
        <button
          type="button"
          onClick={() => setPhase("select")}
          className="mt-6 text-sm font-semibold text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]"
        >
          Back to templates
        </button>
      </div>
    );
  }

  const layoutId = withSiteConfigDefaults(site).templateId;
  const templateLabel =
    layoutId === "custom" ? "Custom" : SITE_TEMPLATE_BUILDERS[layoutId].label;

  return (
    <div className="min-h-screen bg-[var(--fusion-builder-page)] text-zinc-900">
      <nav className="border-b border-zinc-300/90 bg-[var(--fusion-builder-page)]/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition">
              ← Fusion Sites
            </Link>
            <button
              type="button"
              onClick={() => goToTemplateGallery(true)}
              className="text-sm font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)] transition"
            >
              All templates
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                publishStatus === "published"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/15 text-amber-200"
              }`}
            >
              {publishStatus}
            </span>
            <span className="text-xs uppercase tracking-wide text-zinc-500">Builder</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-h-[calc(100vh-56px)] max-w-[1600px] grid-cols-1 gap-0 lg:grid-cols-2 lg:divide-x lg:divide-zinc-300/70">
        <aside className="max-h-[calc(100vh-56px)] overflow-y-auto border-b border-zinc-300/90 p-6 lg:border-b-0">
          <h1 className="text-xl font-bold text-zinc-900">Edit site</h1>
          <p className="mt-1 text-sm text-zinc-500">Changes apply to the live preview immediately.</p>

          <div className="mt-5 rounded-xl border border-zinc-300/90 bg-white/90 p-4 shadow-sm">
            <Field label="Site name">
              <input
                value={site.branding.siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </Field>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Shown in the header and on your member sites list. Editable from any page tab.
            </p>
          </div>

          <div className="mt-5 space-y-3 rounded-xl border border-zinc-300/90 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Pages</p>
            <p className="text-xs text-zinc-500">Match the live site: switch page to edit its sections. New pages appear in full-page preview navigation.</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {site.pages.map((p) => {
                const on = p.id === editorPageId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditorPageId(p.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      on
                        ? "bg-[var(--fusion-builder-accent)] text-white shadow-sm"
                        : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {builderNavTabLabel(p.id, p.name)}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setAddPageOpen((o) => !o)}
                className="rounded-full border border-dashed border-zinc-400 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent)]"
              >
                + Add page
              </button>
            </div>
            {addPageOpen ? (
              <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/90 p-3">
                <label className="block text-xs">
                  <span className="mb-1 block text-zinc-500">New page name</span>
                  <input
                    value={newPageNameDraft}
                    onChange={(e) => setNewPageNameDraft(e.target.value)}
                    placeholder="e.g. Resources"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    onKeyDown={(e) => e.key === "Enter" && confirmAddPage()}
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-zinc-500">Hosted video link (optional)</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={newPageLinkedVideoUrl}
                    onChange={(e) => setNewPageLinkedVideoUrl(e.target.value)}
                    placeholder="YouTube, Vimeo, direct .mp4, or share page (e.g. Nextcloud)"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                  />
                  <span className="mt-1 block text-[10px] leading-relaxed text-zinc-500">
                    Paste the public URL after you upload elsewhere. Embeddable links play on the page; other https links
                    open in a new tab.
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={confirmAddPage}
                    className="rounded-lg bg-[var(--fusion-builder-accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddPageOpen(false);
                      setNewPageNameDraft("");
                      setNewPageLinkedVideoUrl("");
                    }}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            {activePage ? (
              <>
                <div className="flex flex-col gap-2 border-t border-zinc-200/90 pt-3 sm:flex-row sm:items-end sm:justify-between">
                  <label className="block min-w-0 flex-1 text-xs">
                    <span className="mb-1 block text-zinc-500">Menu label (full-page preview)</span>
                    <input
                      value={activePage.name}
                      onChange={(e) =>
                        setSite((s) =>
                          !s
                            ? s
                            : {
                                ...s,
                                pages: s.pages.map((p) => (p.id === editorPageId ? { ...p, name: e.target.value } : p)),
                              },
                        )
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    />
                  </label>
                  {editorPageId !== "home" && site.pages.length > 1 ? (
                    <button
                      type="button"
                      onClick={removeEditorPage}
                      className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 hover:bg-red-100"
                    >
                      Remove page
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2 border-t border-zinc-200/90 pt-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Page video (optional)</p>
                  <label className="block text-xs">
                    <span className="mb-1 block text-zinc-500">Hosted video URL</span>
                    <input
                      type="url"
                      inputMode="url"
                      value={activePage.linkedVideoUrl ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSite((s) =>
                          !s
                            ? s
                            : {
                                ...s,
                                pages: s.pages.map((p) =>
                                  p.id === editorPageId
                                    ? { ...p, linkedVideoUrl: v.trim() ? v : undefined }
                                    : p
                                ),
                              },
                        );
                      }}
                      onBlur={(e) => {
                        const t = e.target.value.trim();
                        setSite((s) =>
                          !s
                            ? s
                            : {
                                ...s,
                                pages: s.pages.map((p) =>
                                  p.id === editorPageId ? { ...p, linkedVideoUrl: t || undefined } : p
                                ),
                              },
                        );
                      }}
                      placeholder="YouTube, Vimeo, direct file, or share link (Nextcloud, etc.)"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="mb-1 block text-zinc-500">Button / title (optional)</span>
                    <input
                      value={activePage.linkedVideoLabel ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSite((s) =>
                          !s
                            ? s
                            : {
                                ...s,
                                pages: s.pages.map((p) =>
                                  p.id === editorPageId
                                    ? { ...p, linkedVideoLabel: v.trim() ? v : undefined }
                                    : p
                                ),
                              },
                        );
                      }}
                      onBlur={(e) => {
                        const t = e.target.value.trim();
                        setSite((s) =>
                          !s
                            ? s
                            : {
                                ...s,
                                pages: s.pages.map((p) =>
                                  p.id === editorPageId ? { ...p, linkedVideoLabel: t || undefined } : p
                                ),
                              },
                        );
                      }}
                      placeholder="e.g. Watch listing walkthrough"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    />
                  </label>
                  <p className="text-[10px] leading-relaxed text-zinc-500">
                    Shows after this page&apos;s hero. Embeddable URLs play inline; other https links open in a new tab.
                    You can also add a dedicated <span className="font-medium text-zinc-600">Video</span> section
                    elsewhere on the page.
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {editingHome ? (
            <>
          <div className="mt-6 space-y-3 rounded-xl border border-zinc-300/90 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Website layout</p>
            <p className="text-sm font-semibold text-zinc-900">{templateLabel}</p>
            <label className="block">
              <span className="mb-1.5 block text-xs text-zinc-500">Switch preset (confirms if you have a site open)</span>
              <select
                value={layoutId === "custom" ? "__custom" : layoutId}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__custom") return;
                  if (!isSiteTemplateId(v)) return;
                  if (v === layoutId) return;
                  setReplaceConfirm(v);
                }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              >
                <option value="__custom" disabled>
                  Custom (edited manually) — or pick a preset below
                </option>
                {SITE_TEMPLATE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {SITE_TEMPLATE_BUILDERS[id].label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => goToTemplateGallery(true)}
              className="text-sm font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)] transition"
            >
              Browse template gallery…
            </button>
            <p className="text-xs text-zinc-500">
              Applying another layout replaces the homepage, other pages, and branding with that template’s defaults. Your
              current site is not kept unless you duplicate it first.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-300/90 bg-white/90 px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Publish state</p>
              <p className="text-sm text-zinc-700">{publishStatus === "published" ? "Live" : "Draft"}</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-400 bg-white accent-[var(--fusion-builder-accent)]"
                checked={publishStatus === "published"}
                onChange={(e) =>
                  setSite((s) =>
                    !s
                      ? s
                      : {
                          ...s,
                          publishStatus: e.target.checked ? "published" : "draft",
                        },
                  )
                }
              />
              Published
            </label>
          </div>

          <div className="mt-8 space-y-6">
            <Field label="Logo">
              <LogoUploadField logo={site.branding.logo || undefined} onChange={(next) => setBranding({ logo: next ?? "" })} />
            </Field>
            <Field label="Logo size">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={LOGO_SIZE_PERCENT_MIN}
                  max={LOGO_SIZE_PERCENT_MAX}
                  step={5}
                  value={normalizeLogoSizePercent(site.branding.logoSizePercent)}
                  onChange={(e) => setBranding({ logoSizePercent: Number(e.target.value) })}
                  className="min-w-0 flex-1 accent-[var(--fusion-builder-accent)]"
                  aria-label="Logo size"
                />
                <span className="w-14 shrink-0 text-right text-xs tabular-nums text-zinc-600">
                  {normalizeLogoSizePercent(site.branding.logoSizePercent)}%
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Scales the logo (or letter badge) in the preview header. Full-page preview matches.
              </p>
            </Field>
            <Field label="Headline (first hero on this page)">
              <input
                value={hero.headline}
                onChange={(e) => setHeroField("headline", e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </Field>
            <Field label="Subheadline (first hero on this page)">
              <textarea
                value={hero.subheadline ?? ""}
                onChange={(e) => setHeroField("subheadline", e.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </Field>
            <Field label="Phone">
              <input
                value={site.branding.phone}
                onChange={(e) => setBranding({ phone: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={site.branding.email}
                onChange={(e) => setBranding({ email: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </Field>
            <Field label="Booking / calendar link">
              <input
                type="url"
                inputMode="url"
                placeholder="https://cal.com/you/strategy-call"
                value={withBrandingDefaults(site.branding).bookingUrl}
                onChange={(e) => setBranding({ bookingUrl: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Paste your scheduling URL (Cal.com, Calendly, HubSpot Meetings, Outlook Bookings). For Google Calendar,
                use <span className="text-zinc-400">Create appointment schedule</span> in Calendar and paste the booking
                page link — visits open in a new tab; availability syncs inside that provider, not Fusion.
              </p>
            </Field>
            <Field label="Referral Partners (header link)">
              <input
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={withBrandingDefaults(site.branding).referralPartnersUrl}
                onChange={(e) => setBranding({ referralPartnersUrl: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Leave blank to hide. When set, the preview header shows a <span className="text-zinc-400">Referral Partners</span>{" "}
                item next to your site pages.
              </p>
            </Field>
            <Field label="Primary color">
              <div className="flex gap-3">
                <input
                  type="color"
                  value={site.branding.primaryColor}
                  onChange={(e) => setBranding({ primaryColor: e.target.value })}
                  className="h-12 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
                  aria-label="Primary color"
                />
                <input
                  value={site.branding.primaryColor}
                  onChange={(e) => setBranding({ primaryColor: e.target.value })}
                  className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
                />
              </div>
            </Field>
            <Field label="Page look">
              <p className="mb-2 text-xs text-zinc-500">Overall background, text, and card styling for the site and previews. Primary/secondary still tint buttons and accents.</p>
              <select
                value={withBrandingDefaults(site.branding).colorScheme}
                onChange={(e) => setBranding({ colorScheme: e.target.value as SiteColorScheme })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              >
                {SITE_COLOR_SCHEME_CHOICES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label} — {o.hint}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Content width">
              <p className="mb-2 text-xs text-zinc-500">How wide main sections (text, listings) span on large screens.</p>
              <select
                value={withBrandingDefaults(site.branding).contentWidth}
                onChange={(e) => setBranding({ contentWidth: e.target.value as SiteContentWidth })}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              >
                <option value="narrow">Narrow</option>
                <option value="default">Balanced (default)</option>
                <option value="wide">Wide</option>
              </select>
            </Field>
          </div>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/90 p-4 text-xs text-zinc-600">
              <p className="font-medium text-zinc-800">Editing {activePage?.name ?? "this page"}</p>
              <p className="mt-2 leading-relaxed">
                Template, publish, logo, contact details, colours, content width, and duplicate site are on the{" "}
                <button
                  type="button"
                  onClick={() => setEditorPageId("home")}
                  className="font-semibold text-[var(--fusion-builder-accent)] underline decoration-[var(--fusion-builder-accent)]/40 underline-offset-2 hover:opacity-90"
                >
                  Home
                </button>{" "}
                tab.
              </p>
            </div>
          )}

          <div className={editingHome ? "mt-10 border-t border-zinc-300/90 pt-8" : "mt-6 border-t border-zinc-300/90 pt-6"}>
            <h2 className="text-sm font-semibold text-zinc-900">
              {activePage ? `${activePage.name} sections` : "Page sections"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Reorder or append blocks on this page. Add sections below.</p>
            <ul className="mt-4 space-y-2">
              {activePage?.sections.map((sec, index) => (
                <li key={sec.id} className="rounded-lg border border-zinc-300/90 bg-white/90 shadow-sm">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate text-zinc-800">
                      <span className="text-zinc-500">{index + 1}. </span>
                      {sectionLabel(sec.type)}
                    </span>
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => setSite((s) => (!s ? s : movePageSection(s, editorPageId, index, -1)))}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-800 disabled:opacity-30 hover:bg-zinc-100"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={index === (activePage?.sections.length ?? 1) - 1}
                        onClick={() => setSite((s) => (!s ? s : movePageSection(s, editorPageId, index, 1)))}
                        className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-800 disabled:opacity-30 hover:bg-zinc-100"
                      >
                        ↓
                      </button>
                    </span>
                  </div>
                  {sec.type === "hero" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderHeroEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                        onRequestBackdropPexels={() => setPexelsPick({ mode: "heroBackdrop", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "featuredListings" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderFeaturedListingsEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "leadForm" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderLeadFormEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "sessionInterest" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderSessionInterestEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "textImage" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderTextImageEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "testimonial" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderTestimonialEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "smsf" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderSmsfEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "dualKey" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderDualKeyEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "investorStrategy" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderInvestorStrategyEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                        onRequestPexels={() => setPexelsPick({ mode: "sectionImage", sectionId: sec.id })}
                      />
                    </div>
                  ) : null}
                  {sec.type === "videoEmbed" && site ? (
                    <div className="border-t border-zinc-200 px-2 pb-2">
                      <BuilderVideoEmbedEditor
                        site={site}
                        pageId={editorPageId}
                        sectionId={sec.id}
                        props={sec.props as Record<string, unknown>}
                        onChange={setSite}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as BuilderSectionType)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70 sm:flex-1"
              >
                {SECTION_TYPE_OPTIONS.map((o) => (
                  <option key={o.type} value={o.type}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSection}
                className="rounded-xl bg-[var(--fusion-builder-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fusion-builder-accent-hover)]"
              >
                Add section
              </button>
            </div>
          </div>

          {editingHome ? (
            <div className="mt-10 border-t border-zinc-300/90 pt-8">
              <button
                type="button"
                onClick={handleDuplicate}
                className="w-full rounded-xl border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 transition"
              >
                Duplicate site
              </button>
              <p className="mt-2 text-xs text-zinc-500">
                Clones configuration, new id, appends &quot; Copy&quot; to names. Publish state is copied.
              </p>
            </div>
          ) : null}
        </aside>

        <section className="max-h-[calc(100vh-56px)] overflow-y-auto bg-[#dcdce0] p-4 lg:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
              Live preview · {activePage?.name ?? "Page"}
            </p>
            <button
              type="button"
              onClick={openFullPagePreview}
              className="rounded-lg border border-[var(--fusion-builder-accent)]/45 bg-[var(--fusion-builder-accent)]/12 px-3 py-1.5 text-xs font-semibold text-[#8b5220] hover:bg-[var(--fusion-builder-accent)]/22"
            >
              Open full-page preview (new tab)
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-300/90 shadow-xl shadow-zinc-400/25">
            <SiteThemeFrame site={site} className="overflow-hidden rounded-2xl">
              <div className="sticky top-0 z-10 border-b border-[var(--fs-border)] bg-[var(--fs-page-bg)]/95 px-4 py-3 backdrop-blur">
                <SitePreviewHeaderRow
                  branding={site.branding}
                  publishStatus={publishStatus}
                  siteDocumentName={site.name}
                  navItems={headerNavItems}
                  navPresentation={isRealEstatePortalTemplate(fusionLayoutId) ? "inline-separated" : "pills"}
                />
              </div>
              <div className="max-h-[min(70vh,720px)] overflow-y-auto">
                {activePage ? (
                  <SitePageSections
                    page={activePage}
                    bookingUrl={withBrandingDefaults(site.branding).bookingUrl}
                    fusionTemplate={fusionLayoutId}
                    onPickStockImage={(id) => setPexelsPick({ mode: "sectionImage", sectionId: id })}
                  />
                ) : null}
              </div>
            </SiteThemeFrame>
          </div>
        </section>
      </div>

      <PexelsImagePicker
        open={pexelsPick !== null}
        onClose={() => setPexelsPick(null)}
        onSelect={(sel) => {
          const target = pexelsPick;
          if (!target) return;
          const { sectionId } = target;
          if (target.mode === "sectionImage") {
            setSite((s) =>
              s
                ? patchPageSectionProps(s, editorPageId, sectionId, {
                    imageUrl: sel.imageUrl,
                    imageAlt: sel.imageAlt,
                    imageCredit: sel.imageCredit,
                  })
                : s
            );
          } else {
            setSite((s) =>
              s
                ? patchPageSectionProps(s, editorPageId, sectionId, {
                    backdropImageUrl: sel.imageUrl,
                    backdropImageAlt: sel.imageAlt,
                  })
                : s
            );
          }
          setPexelsPick(null);
        }}
        initialQuery="property architecture"
      />

      {replaceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="layout-confirm-title">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/40"
            aria-label="Close"
            onClick={() => setReplaceConfirm(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-300 bg-white p-6 shadow-2xl">
            <h2 id="layout-confirm-title" className="text-lg font-semibold text-zinc-900">
              Switch to {SITE_TEMPLATE_BUILDERS[replaceConfirm].label}?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              This loads that layout’s default copy, section order, and branding. It replaces the entire site in the editor
              (all pages, not only the homepage). This cannot be undone in one click — use{" "}
              <span className="font-medium text-zinc-800">Duplicate site</span> first if you want a backup.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setReplaceConfirm(null)}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTemplateReplace}
                className="rounded-xl bg-[var(--fusion-builder-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)]"
              >
                Replace with this layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Minimal site shape only so hooks have stable defaults before a template is chosen (never rendered). */
const EMPTY_SITE_PLACEHOLDER: SiteConfig = {
  id: "_",
  name: "",
  templateId: "custom",
  publishStatus: "draft",
  branding: {
    siteName: "",
    logo: "",
    primaryColor: "#000000",
    secondaryColor: "#000000",
    phone: "",
    email: "",
    bookingUrl: "",
    referralPartnersUrl: "",
    colorScheme: "dark",
    contentWidth: "default",
  },
  pages: [{ id: "home", name: "Homepage", sections: [] }],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function BuilderPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--fusion-builder-page)] text-sm text-zinc-600">Loading builder…</div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderPageFallback />}>
      <BuilderPageInner />
    </Suspense>
  );
}
