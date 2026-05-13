"use client";

import type { HomeTemplateItem } from "@/lib/homepage-templates";
import type { SiteTemplateId } from "@/lib/site-templates";
import { HomeTemplatePreview } from "@/components/landing/HomeTemplatePreview";

export function BuilderTemplateGallery({
  items,
  onChooseTemplate,
}: {
  items: HomeTemplateItem[];
  onChooseTemplate: (id: SiteTemplateId) => void;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isLive = item.status === "live" && item.siteTemplateId;
        return (
          <article
            key={item.id}
            className={`flex flex-col rounded-2xl border p-6 shadow-lg shadow-zinc-400/20 ${
              isLive ? "border-zinc-300/90 bg-white/95" : "border-dashed border-zinc-400 bg-white/80"
            }`}
          >
            <div className={!isLive ? "opacity-90" : undefined}>
              <HomeTemplatePreview item={item} />
            </div>
            <h2 className="mt-5 text-lg font-bold text-zinc-900">{item.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{item.description}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">
              {item.audienceLabel}
            </p>
            {isLive && item.siteTemplateId ? (
              <button
                type="button"
                onClick={() => onChooseTemplate(item.siteTemplateId!)}
                className="mt-6 w-full rounded-xl bg-[var(--fusion-builder-accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--fusion-builder-accent-hover)]"
              >
                Use template
              </button>
            ) : (
              <p
                className="mt-6 w-full cursor-not-allowed rounded-xl border border-zinc-300 bg-zinc-100 py-3 text-center text-sm font-semibold text-zinc-500"
                role="status"
              >
                Template coming soon
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
