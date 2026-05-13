"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PropertyImageGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const n = images.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0) return n - 1;
        if (next >= n) return 0;
        return next;
      });
    },
    [n],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (n <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    [go, n],
  );

  if (n === 0) return null;

  const current = images[index] ?? images[0];

  return (
    <div className="mb-10 space-y-4">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        role="region"
        aria-roledescription="carousel"
        aria-label="Property photos"
        tabIndex={n > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="" className="h-full w-full object-cover" />

        {n > 1 ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
            <button
              type="button"
              aria-label="Previous image"
              className="pointer-events-auto absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="pointer-events-auto absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
              onClick={() => go(1)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {n}
            </div>
          </>
        ) : null}
      </div>

      {n > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin]">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`Show image ${i + 1} of ${n}`}
              aria-current={i === index}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === index ? "ring-white" : "ring-white/10 opacity-70 hover:opacity-100"
              }`}
              onClick={() => setIndex(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

    </div>
  );
}
