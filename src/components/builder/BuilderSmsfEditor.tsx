"use client";

import type { SmsfSectionProps } from "@/components/sections/SmsfSection";
import { coerceSectionImageAlign } from "@/components/sections/OptionalSectionImage";
import type { SiteConfig } from "@/lib/site-model";
import { patchPageSectionProps } from "@/lib/patch-page-section";
import { SectionImageFields } from "./SectionImageFields";

type BuilderSmsfEditorProps = {
  site: SiteConfig;
  pageId: string;
  sectionId: string;
  onChange: (next: SiteConfig) => void;
  props: Record<string, unknown>;
  onRequestPexels: () => void;
};

function readSmsfProps(raw: Record<string, unknown>): SmsfSectionProps {
  const pointsRaw = raw.points;
  let points: string[] = [];
  if (Array.isArray(pointsRaw)) {
    points = pointsRaw.filter((p): p is string => typeof p === "string");
  }
  if (points.length === 0) points = ["First checklist item"];

  return {
    title: typeof raw.title === "string" ? raw.title : "",
    body: typeof raw.body === "string" ? raw.body : "",
    extendedBody: typeof raw.extendedBody === "string" ? raw.extendedBody : undefined,
    points,
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    imageAlt: typeof raw.imageAlt === "string" ? raw.imageAlt : undefined,
    imageCredit: typeof raw.imageCredit === "string" ? raw.imageCredit : undefined,
    imageAlign: coerceSectionImageAlign(raw.imageAlign),
  };
}

export function BuilderSmsfEditor({ site, pageId, sectionId, onChange, props: rawProps, onRequestPexels }: BuilderSmsfEditorProps) {
  const p = readSmsfProps(rawProps);

  const patch = (partial: Partial<SmsfSectionProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  const setPoint = (index: number, value: string) => {
    const next = [...p.points];
    next[index] = value;
    patch({ points: next });
  };

  const addPoint = () => {
    patch({ points: [...p.points, "New point"] });
  };

  const removePoint = (index: number) => {
    if (p.points.length <= 1) return;
    patch({ points: p.points.filter((_, i) => i !== index) });
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">SMSF block</p>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Title</span>
        <input
          value={p.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Intro</span>
        <textarea
          value={p.body}
          onChange={(e) => patch({ body: e.target.value })}
          rows={4}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">More detail (optional)</span>
        <textarea
          value={p.extendedBody ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            patch({ extendedBody: v.trim() === "" ? undefined : v });
          }}
          rows={4}
          placeholder="Optional longer explanation — appears below the image, or below the intro if no image."
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70 placeholder:text-zinc-400"
        />
      </label>

      <div className="space-y-2 border-t border-zinc-200 pt-2">
        <p className="text-[10px] uppercase text-zinc-500">Checklist bullets</p>
        <ul className="space-y-2">
          {p.points.map((line, i) => (
            <li key={i} className="flex gap-1">
              <input
                value={line}
                onChange={(e) => setPoint(i, e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
              <button
                type="button"
                aria-label="Remove bullet"
                disabled={p.points.length <= 1}
                onClick={() => removePoint(i)}
                className="shrink-0 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addPoint}
          className="text-xs font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]"
        >
          + Add bullet
        </button>
      </div>

      <SectionImageFields
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
        imageAlign={p.imageAlign}
        onPatch={(partial) => patch(partial as Partial<SmsfSectionProps>)}
        onRequestPexels={onRequestPexels}
      />
    </div>
  );
}
