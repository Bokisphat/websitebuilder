"use client";

import type { LeadFormProps } from "@/components/sections/LeadForm";
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

function read(raw: Record<string, unknown>) {
  return {
    title: typeof raw.title === "string" ? raw.title : "",
    description: typeof raw.description === "string" ? raw.description : "",
    buttonLabel: typeof raw.buttonLabel === "string" ? raw.buttonLabel : "",
    imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
    imageAlt: typeof raw.imageAlt === "string" ? raw.imageAlt : undefined,
    imageCredit: typeof raw.imageCredit === "string" ? raw.imageCredit : undefined,
    imageAlign: coerceSectionImageAlign(raw.imageAlign),
    anchorId: typeof raw.anchorId === "string" ? raw.anchorId : undefined,
  };
}

export function BuilderLeadFormEditor({ site, pageId, sectionId, onChange, props: rawProps, onRequestPexels }: Props) {
  const p = read(rawProps);

  const patch = (partial: Partial<LeadFormProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Lead form</p>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Title</span>
        <input
          value={p.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Description</span>
        <textarea
          value={p.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={3}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Button label</span>
        <input
          value={p.buttonLabel}
          onChange={(e) => patch({ buttonLabel: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Section HTML id (optional)</span>
        <input
          value={p.anchorId ?? ""}
          onChange={(e) => patch({ anchorId: e.target.value.trim() || undefined })}
          placeholder="e.g. enquiry — links use /page#enquiry"
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 font-mono text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <SectionImageFields
        imageUrl={p.imageUrl}
        imageAlt={p.imageAlt}
        imageCredit={p.imageCredit}
        imageAlign={p.imageAlign}
        onPatch={(partial) => patch(partial as Partial<LeadFormProps>)}
        onRequestPexels={onRequestPexels}
      />
    </div>
  );
}
