import Link from "next/link";
import { HOMEPAGE_TEMPLATE_ITEMS } from "@/lib/homepage-templates";
import { HomeTemplatePreview } from "./HomeTemplatePreview";

export function HomeTemplateGrid() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {HOMEPAGE_TEMPLATE_ITEMS.map((item) => {
        const isLive = item.status === "live" && item.siteTemplateId;
        return (
          <article
            key={item.id}
            className={`flex flex-col rounded-2xl border p-6 shadow-lg shadow-zinc-400/15 ${
              isLive
                ? "border-zinc-300/90 bg-white"
                : "border-dashed border-zinc-400 bg-white/70"
            }`}
          >
            <div className={!isLive ? "opacity-90" : undefined}>
              <HomeTemplatePreview item={item} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-zinc-900">{item.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{item.description}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[#E89142]">{item.audienceLabel}</p>
            {isLive ? (
              <Link
                href={`/builder?template=${item.siteTemplateId}`}
                className="mt-6 block w-full rounded-xl bg-[#E89142] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#d48238]"
              >
                Use this template
              </Link>
            ) : (
              <p
                className="mt-6 w-full cursor-not-allowed rounded-xl border border-zinc-300 bg-zinc-100 py-3 text-center text-sm font-semibold text-zinc-500"
                role="status"
                aria-label={`${item.name} template coming soon`}
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
