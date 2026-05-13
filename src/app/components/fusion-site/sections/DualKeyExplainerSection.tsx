"use client";

import type { DualKeyExplainerSectionConfig } from "@/app/lib/section-config";

export function DualKeyExplainerSection({ section }: { section: DualKeyExplainerSectionConfig }) {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-zinc-900/40 p-8 sm:p-12">
        <h2 className="text-3xl font-bold text-white">{section.title}</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">{section.body}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {section.points.map((p, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-black/30 p-4 text-sm text-zinc-300">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
