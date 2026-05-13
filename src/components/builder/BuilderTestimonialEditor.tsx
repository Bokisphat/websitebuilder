"use client";

import type { TestimonialItem, TestimonialSectionProps } from "@/components/sections/TestimonialSection";
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

function normalizeItems(raw: Record<string, unknown>): TestimonialItem[] {
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    return raw.items.map((it: unknown) => {
      const o = it as Record<string, unknown>;
      return {
        quote: typeof o.quote === "string" ? o.quote : "",
        author: typeof o.author === "string" ? o.author : "",
        role: typeof o.role === "string" ? o.role : "",
      };
    });
  }
  return [
    {
      quote: typeof raw.quote === "string" ? raw.quote : "",
      author: typeof raw.author === "string" ? raw.author : "",
      role: typeof raw.role === "string" ? raw.role : "",
    },
  ];
}

export function BuilderTestimonialEditor({ site, pageId, sectionId, onChange, props: rawProps, onRequestPexels }: Props) {
  const raw = rawProps;
  const items = normalizeItems(raw);

  const patch = (partial: Partial<TestimonialSectionProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  const setItems = (next: TestimonialItem[]) => {
    patch({
      items: next,
      quote: undefined,
      author: undefined,
      role: undefined,
    });
  };

  const updateItem = (index: number, field: keyof TestimonialItem, value: string) => {
    const next = items.map((it, i) => (i === index ? { ...it, [field]: value } : it));
    setItems(next);
  };

  const addItem = () => setItems([...items, { quote: "", author: "", role: "" }]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : undefined;
  const imageAlt = typeof raw.imageAlt === "string" ? raw.imageAlt : undefined;
  const imageCredit = typeof raw.imageCredit === "string" ? raw.imageCredit : undefined;
  const imageAlign = coerceSectionImageAlign(raw.imageAlign);

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Testimonials</p>
      <div className="space-y-4 border-t border-zinc-200 pt-2">
        <p className="text-[10px] uppercase text-zinc-500">Quotes</p>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-2 space-y-2">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-zinc-500">Quote</span>
              <textarea
                value={item.quote}
                onChange={(e) => updateItem(i, "quote", e.target.value)}
                rows={3}
                className="w-full resize-y rounded border border-zinc-300 px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase text-zinc-500">Name</span>
                <input
                  value={item.author}
                  onChange={(e) => updateItem(i, "author", e.target.value)}
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase text-zinc-500">Role</span>
                <input
                  value={item.role}
                  onChange={(e) => updateItem(i, "role", e.target.value)}
                  className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={items.length <= 1}
              onClick={() => removeItem(i)}
              className="text-[10px] font-medium text-zinc-600 hover:text-red-600 disabled:opacity-30"
            >
              Remove testimonial
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-xs font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]">
          + Add testimonial
        </button>
      </div>
      <SectionImageFields
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        imageCredit={imageCredit}
        imageAlign={imageAlign}
        onPatch={(partial) => patch(partial as Partial<TestimonialSectionProps>)}
        onRequestPexels={onRequestPexels}
      />
    </div>
  );
}
