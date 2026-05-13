"use client";

import type { TestimonialSectionConfig } from "@/app/lib/section-config";

export function TestimonialSection({ section }: { section: TestimonialSectionConfig }) {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-10 text-center">
        <p className="text-lg leading-relaxed text-zinc-200">&ldquo;{section.quote}&rdquo;</p>
        <div className="mt-8">
          <p className="font-semibold text-white">{section.name}</p>
          <p className="text-sm text-zinc-500">{section.role}</p>
        </div>
      </div>
    </section>
  );
}
