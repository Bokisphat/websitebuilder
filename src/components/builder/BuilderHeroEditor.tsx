"use client";

import { useState } from "react";
import type { HeroSectionProps } from "@/components/sections/HeroSection";
import { coerceSectionImageAlign } from "@/components/sections/OptionalSectionImage";
import type { SiteConfig } from "@/lib/site-model";
import { patchPageSectionProps } from "@/lib/patch-page-section";
import { SectionImageFields } from "./SectionImageFields";

type BuilderHeroEditorProps = {
  site: SiteConfig;
  pageId: string;
  sectionId: string;
  onChange: (next: SiteConfig) => void;
  props: Record<string, unknown>;
  onRequestPexels: () => void;
  /** Opens Pexels picker; selected image becomes full-width hero backdrop. */
  onRequestBackdropPexels?: () => void;
};

type AiGenJson = { url?: string; revisedPrompt?: string; error?: string };

function readHero(raw: Record<string, unknown>) {
  const rawTags = raw.strategyTags;
  const strategyTags = Array.isArray(rawTags)
    ? rawTags.filter((t): t is string => typeof t === "string")
    : undefined;
  const variant = raw.variant === "agencyPortal" ? "agencyPortal" : raw.variant === "default" ? "default" : undefined;
  return {
    headline: typeof raw.headline === "string" ? raw.headline : "",
    subheadline: typeof raw.subheadline === "string" ? raw.subheadline : "",
    ctaLabel: typeof raw.ctaLabel === "string" ? raw.ctaLabel : "",
    ctaHref: typeof raw.ctaHref === "string" ? raw.ctaHref : "#",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    imageAlt: typeof raw.imageAlt === "string" ? raw.imageAlt : undefined,
    imageCredit: typeof raw.imageCredit === "string" ? raw.imageCredit : undefined,
    imageAlign: coerceSectionImageAlign(raw.imageAlign),
    variant,
    spotlightLabel: typeof raw.spotlightLabel === "string" ? raw.spotlightLabel : undefined,
    spotlightTitle: typeof raw.spotlightTitle === "string" ? raw.spotlightTitle : undefined,
    spotlightPrice: typeof raw.spotlightPrice === "string" ? raw.spotlightPrice : undefined,
    spotlightLocation: typeof raw.spotlightLocation === "string" ? raw.spotlightLocation : undefined,
    spotlightBeds: typeof raw.spotlightBeds === "string" ? raw.spotlightBeds : undefined,
    spotlightBaths: typeof raw.spotlightBaths === "string" ? raw.spotlightBaths : undefined,
    spotlightCars: typeof raw.spotlightCars === "string" ? raw.spotlightCars : undefined,
    strategyTags,
    backdropImageUrl: typeof raw.backdropImageUrl === "string" ? raw.backdropImageUrl : undefined,
    backdropImageAlt: typeof raw.backdropImageAlt === "string" ? raw.backdropImageAlt : undefined,
    backdropOverlayStrength:
      typeof raw.backdropOverlayStrength === "number" && !Number.isNaN(raw.backdropOverlayStrength)
        ? raw.backdropOverlayStrength
        : undefined,
  };
}

export function BuilderHeroEditor({
  site,
  pageId,
  sectionId,
  onChange,
  props: rawProps,
  onRequestPexels,
  onRequestBackdropPexels,
}: BuilderHeroEditorProps) {
  const p = readHero(rawProps);
  const [aiBackdropLoading, setAiBackdropLoading] = useState(false);
  const [aiBackdropError, setAiBackdropError] = useState<string | null>(null);
  /** When set, Generate uses this instead of (or merged with) description — does not overwrite accessibility text. */
  const [aiBackdropPromptOnly, setAiBackdropPromptOnly] = useState("");

  const patch = (partial: Partial<HeroSectionProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  const generateBackdropWithAi = async () => {
    const fromAlt = p.backdropImageAlt?.trim() ?? "";
    const fromBox = aiBackdropPromptOnly.trim();
    const seed = fromBox || fromAlt;
    if (!seed) {
      setAiBackdropError(
        'Add text in "Backdrop description" above, or describe the scene in "AI prompt only" below, then try again.',
      );
      return;
    }
    setAiBackdropLoading(true);
    setAiBackdropError(null);
    const prompt = `${seed}. Ultra-wide atmospheric photograph suitable as a property website hero backdrop, editorial quality, shallow depth of field optional, no text, logos, or watermarks.`;
    try {
      const res = await fetch("/api/ai-image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await res.json()) as AiGenJson;
      if (!res.ok) {
        setAiBackdropError(data.error ?? "Could not generate image");
        return;
      }
      if (!data.url) {
        setAiBackdropError("No image URL returned");
        return;
      }
      patch({ backdropImageUrl: data.url });
    } catch {
      setAiBackdropError("Network error");
    } finally {
      setAiBackdropLoading(false);
    }
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Hero block</p>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Headline</span>
        <input
          value={p.headline}
          onChange={(e) => patch({ headline: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Subheadline</span>
        <textarea
          value={p.subheadline}
          onChange={(e) => patch({ subheadline: e.target.value })}
          rows={3}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <div className="space-y-2 rounded-md border border-zinc-200 bg-white/80 p-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Backdrop image</p>
        <p className="text-[11px] leading-snug text-zinc-500">
          Large photo behind the headline (full width). Headline uses light text on a dark overlay — adjust strength below.
        </p>
        {p.backdropImageUrl ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-300">
              <img src={p.backdropImageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() =>
                patch({
                  backdropImageUrl: undefined,
                  backdropImageAlt: undefined,
                  backdropOverlayStrength: undefined,
                })
              }
              className="text-xs font-medium text-[var(--fusion-builder-accent)] hover:underline"
            >
              Remove backdrop
            </button>
          </div>
        ) : null}
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Backdrop URL (HTTPS)</span>
          <input
            value={p.backdropImageUrl ?? ""}
            onChange={(e) => patch({ backdropImageUrl: e.target.value || undefined })}
            onBlur={(e) => patch({ backdropImageUrl: e.target.value.trim() || undefined })}
            placeholder="https://…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Backdrop description (accessibility)</span>
          <input
            value={p.backdropImageAlt ?? ""}
            onChange={(e) => patch({ backdropImageAlt: e.target.value || undefined })}
            onBlur={(e) => patch({ backdropImageAlt: e.target.value.trim() || undefined })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
        </label>
        <p className="text-[10px] leading-relaxed text-zinc-500">
          This text is for screen readers. Use it to describe the photo (or the scene you want). Then click{" "}
          <span className="font-medium text-zinc-600">Generate backdrop image (AI)</span> — or open{" "}
          <span className="font-medium text-zinc-600">Pick backdrop from Pexels</span> and use the{" "}
          <span className="font-medium text-zinc-600">Create with AI</span> tab there.
        </p>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">AI prompt only (optional)</span>
          <textarea
            value={aiBackdropPromptOnly}
            onChange={(e) => setAiBackdropPromptOnly(e.target.value)}
            rows={2}
            placeholder='If different from accessibility text: e.g. "Gold Coast high-rise dusk, cranes, warm light"'
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
          <span className="mt-1 block text-[9px] text-zinc-500">
            When filled, generation uses this instead of the backdrop description — your accessibility text is left unchanged.
          </span>
        </label>
        <button
          type="button"
          onClick={() => void generateBackdropWithAi()}
          disabled={aiBackdropLoading}
          className="w-full rounded-lg bg-[var(--fusion-builder-accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)] disabled:opacity-50"
        >
          {aiBackdropLoading ? "Generating…" : "Generate backdrop image (AI)"}
        </button>
        {aiBackdropError ? <p className="text-[11px] text-amber-800">{aiBackdropError}</p> : null}
        <p className="text-[9px] text-zinc-500">
          Uses <code className="rounded bg-zinc-100 px-0.5">OPENAI_API_KEY</code> (OpenAI GPT Image). Same API as Pexels picker → Create with AI. Hosted URLs can expire; re-host for production if needed.
        </p>
        <div>
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">
            Overlay darkness ({p.backdropOverlayStrength ?? 55}%)
          </span>
          <input
            type="range"
            min={15}
            max={80}
            value={p.backdropOverlayStrength ?? 55}
            onChange={(e) => patch({ backdropOverlayStrength: Number(e.target.value) })}
            className="w-full accent-[var(--fusion-builder-accent)]"
            aria-label="Backdrop overlay strength"
          />
        </div>
        {onRequestBackdropPexels ? (
          <button
            type="button"
            onClick={onRequestBackdropPexels}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Pick backdrop from Pexels
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Hero layout</span>
          <select
            value={p.variant ?? "default"}
            onChange={(e) => {
              const v = e.target.value;
              patch({
                variant: v === "agencyPortal" ? "agencyPortal" : "default",
              } as Partial<HeroSectionProps>);
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          >
            <option value="default">Centered (standard)</option>
            <option value="agencyPortal">Agency portal — split + featured card + tags</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">CTA label</span>
          <input
            value={p.ctaLabel}
            onChange={(e) => patch({ ctaLabel: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">CTA link</span>
          <input
            value={p.ctaHref}
            onChange={(e) => patch({ ctaHref: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
        </label>
      </div>
      {p.variant === "agencyPortal" ? (
        <div className="space-y-2 rounded-md border border-zinc-200 bg-white/80 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Featured spotlight card</p>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase text-zinc-500">Spotlight label</span>
            <input
              value={p.spotlightLabel ?? ""}
              onChange={(e) => patch({ spotlightLabel: e.target.value || undefined })}
              placeholder="e.g. Featured opportunity"
              className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase text-zinc-500">Lot / title</span>
            <input
              value={p.spotlightTitle ?? ""}
              onChange={(e) => patch({ spotlightTitle: e.target.value || undefined })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
            />
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Price line</span>
              <input
                value={p.spotlightPrice ?? ""}
                onChange={(e) => patch({ spotlightPrice: e.target.value || undefined })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Location</span>
              <input
                value={p.spotlightLocation ?? ""}
                onChange={(e) => patch({ spotlightLocation: e.target.value || undefined })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Beds</span>
              <input
                value={p.spotlightBeds ?? ""}
                onChange={(e) => patch({ spotlightBeds: e.target.value || undefined })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Baths</span>
              <input
                value={p.spotlightBaths ?? ""}
                onChange={(e) => patch({ spotlightBaths: e.target.value || undefined })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Car spaces</span>
              <input
                value={p.spotlightCars ?? ""}
                onChange={(e) => patch({ spotlightCars: e.target.value || undefined })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase text-zinc-500">Strategy tags (one per line)</span>
            <textarea
              value={(p.strategyTags ?? []).join("\n")}
              onChange={(e) => {
                const tags = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                patch({ strategyTags: tags.length ? tags : undefined });
              }}
              rows={4}
              placeholder={"FIRB\nMetro high-yield\nSMSF freehold"}
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
            />
          </label>
        </div>
      ) : null}
      <SectionImageFields
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
        imageAlign={p.imageAlign}
        onPatch={(partial) => patch(partial as Partial<HeroSectionProps>)}
        onRequestPexels={onRequestPexels}
      />
    </div>
  );
}
