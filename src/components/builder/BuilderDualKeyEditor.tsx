"use client";

import type { DualKeySectionProps } from "@/components/sections/DualKeySection";
import { coerceSectionImageAlign } from "@/components/sections/OptionalSectionImage";
import type { SiteConfig } from "@/lib/site-model";
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

function read(raw: Record<string, unknown>): DualKeySectionProps {
  const bulletsRaw = raw.bullets;
  let bullets: string[] = [];
  if (Array.isArray(bulletsRaw)) {
    bullets = bulletsRaw.filter((b): b is string => typeof b === "string");
  }
  if (bullets.length === 0) bullets = ["First bullet"];

  return {
    title: typeof raw.title === "string" ? raw.title : "",
    body: typeof raw.body === "string" ? raw.body : "",
    bullets,
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    imageAlt: typeof raw.imageAlt === "string" ? raw.imageAlt : undefined,
    imageCredit: typeof raw.imageCredit === "string" ? raw.imageCredit : undefined,
    imageAlign: coerceSectionImageAlign(raw.imageAlign),
  };
}

export function BuilderDualKeyEditor({ site, pageId, sectionId, onChange, props: rawProps, onRequestPexels }: Props) {
  const p = read(rawProps);

  const patch = (partial: Partial<DualKeySectionProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  const setBullet = (index: number, value: string) => {
    const next = [...p.bullets];
    next[index] = value;
    patch({ bullets: next });
  };

  const addBullet = () => patch({ bullets: [...p.bullets, "New bullet"] });
  const removeBullet = (index: number) => {
    if (p.bullets.length <= 1) return;
    patch({ bullets: p.bullets.filter((_, i) => i !== index) });
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Dual Key block</p>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Title</span>
        <input
          value={p.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Body</span>
        <textarea
          value={p.body}
          onChange={(e) => patch({ body: e.target.value })}
          rows={4}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <div className="space-y-2 border-t border-zinc-200 pt-2">
        <p className="text-[10px] uppercase text-zinc-500">Bullets</p>
        <ul className="space-y-2">
          {p.bullets.map((line, i) => (
            <li key={i} className="flex gap-1">
              <input
                value={line}
                onChange={(e) => setBullet(i, e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
              <button
                type="button"
                aria-label="Remove"
                disabled={p.bullets.length <= 1}
                onClick={() => removeBullet(i)}
                className="shrink-0 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addBullet} className="text-xs font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]">
          + Add bullet
        </button>
      </div>
      <SectionImageFields
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
        imageAlign={p.imageAlign}
        onPatch={(partial) => patch(partial as Partial<DualKeySectionProps>)}
        onRequestPexels={onRequestPexels}
      />
    </div>
  );
}
