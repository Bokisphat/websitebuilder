"use client";

import type { TextImageSectionConfig } from "@/app/lib/section-config";

export function TextImageSection({ section }: { section: TextImageSectionConfig }) {
  const imageFirst = section.imageSide === "left";
  const block = (
    <div className="flex min-h-[220px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-zinc-800/80 p-8 text-center text-sm text-zinc-500">
      {section.imageLabel ?? "Image"}
    </div>
  );
  const copy = (
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-white">{section.title}</h2>
      <p className="mt-4 leading-relaxed text-zinc-400">{section.body}</p>
    </div>
  );

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center">
        {imageFirst ? (
          <>
            {block}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {block}
          </>
        )}
      </div>
    </section>
  );
}
