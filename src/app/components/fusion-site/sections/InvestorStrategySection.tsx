"use client";

import type { InvestorStrategySectionConfig } from "@/app/lib/section-config";

export function InvestorStrategySection({ section }: { section: InvestorStrategySectionConfig }) {
  return (
    <section className="border-y border-white/10 bg-zinc-900/30 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-white">{section.title}</h2>
        <p className="mt-4 max-w-2xl text-zinc-400">{section.intro}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {section.bullets.map((b, i) => (
            <li
              key={i}
              className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-sm leading-relaxed text-zinc-300"
            >
              <span className="mr-2 font-bold" style={{ color: "var(--site-primary)" }}>
                {i + 1}.
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
