"use client";

import type { SmsfExplainerSectionConfig } from "@/app/lib/section-config";

export function SmsfExplainerSection({ section }: { section: SmsfExplainerSectionConfig }) {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold text-white">{section.title}</h2>
            <p className="mt-4 leading-relaxed text-zinc-400">{section.body}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">At a glance</p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {section.highlights.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: "var(--site-secondary)" }}>✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
