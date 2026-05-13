"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseVideoUrl,
  vimeoEmbedSrc,
  youtubeEmbedSrc,
  youtubeThumbnailUrl,
} from "@/lib/parse-video-url";

export type VideoEmbedProps = {
  title?: string;
  body?: string;
  /** YouTube/Vimeo/watch URL or direct HTTPS .mp4 / .webm */
  videoUrl: string;
  /** Optional poster; overrides YouTube thumbnail; required for custom look on direct files if no auto thumb */
  thumbnailUrl?: string;
};

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      <polygon points="32,26 56,40 32,54" fill="white" />
    </svg>
  );
}

export function VideoEmbed({
  title = "",
  body = "",
  videoUrl = "",
  thumbnailUrl,
}: Partial<VideoEmbedProps> & { videoUrl?: string }) {
  const parsed = useMemo(() => parseVideoUrl(videoUrl ?? ""), [videoUrl]);
  const [playing, setPlaying] = useState(false);
  const [vimeoThumb, setVimeoThumb] = useState<string | null>(null);

  useEffect(() => {
    setPlaying(false);
  }, [videoUrl]);

  useEffect(() => {
    if (parsed.kind !== "vimeo") {
      setVimeoThumb(null);
      return;
    }
    let cancelled = false;
    const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(parsed.sourceUrl)}`;
    fetch(oembed)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { thumbnail_url?: string } | null) => {
        if (!cancelled && json?.thumbnail_url) setVimeoThumb(json.thumbnail_url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [parsed]);

  const thumb =
    thumbnailUrl?.trim() ||
    (parsed.kind === "youtube" ? youtubeThumbnailUrl(parsed.id) : null) ||
    vimeoThumb ||
    null;

  const label = title?.trim() || "Play video";

  if (parsed.kind === "invalid" && !(videoUrl ?? "").trim()) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-10">
        {(title ?? "").trim() ? (
          <h2 className="text-xl font-semibold tracking-tight text-[var(--fs-heading)] md:text-2xl">{title}</h2>
        ) : null}
        {(body ?? "").trim() ? (
          <p className="mt-3 whitespace-pre-wrap text-[var(--fs-muted)] leading-relaxed">{body}</p>
        ) : null}
        <div className="mt-6 flex aspect-video items-center justify-center rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-image-placeholder)]/60 text-center text-sm text-[var(--fs-muted)]">
          Add a video URL in the builder to preview.
        </div>
      </section>
    );
  }

  if (parsed.kind === "invalid") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-10">
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--fs-heading)]">
          {parsed.message}
        </p>
      </section>
    );
  }

  const player =
    parsed.kind === "youtube" ? (
      <iframe
        title={label}
        src={youtubeEmbedSrc(parsed.id)}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    ) : parsed.kind === "vimeo" ? (
      <iframe
        title={label}
        src={vimeoEmbedSrc(parsed.id)}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    ) : (
      // eslint-disable-next-line jsx-a11y/media-has-caption -- user-provided promo clip; captions depend on source file
      <video src={parsed.url} className="absolute inset-0 h-full w-full bg-black object-contain" controls autoPlay playsInline />
    );

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      {title.trim() ? (
        <h2 className="text-xl font-semibold tracking-tight text-[var(--fs-heading)] md:text-2xl">{title}</h2>
      ) : null}
      {body.trim() ? (
        <p className={`whitespace-pre-wrap text-[var(--fs-muted)] leading-relaxed ${title.trim() ? "mt-3" : ""}`}>{body}</p>
      ) : null}

      <div className={`relative w-full overflow-hidden rounded-2xl border border-[var(--fs-border)] bg-black/90 shadow-lg ${title.trim() || body.trim() ? "mt-8" : ""}`}>
        <div className="relative aspect-video w-full bg-[var(--fs-image-placeholder)]">
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative block h-full w-full text-left outline-none ring-[var(--brand-primary,#a78bfa)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fs-page-bg)]"
              aria-label={label}
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote poster from YouTube oEmbed CDN
                <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" aria-hidden />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                <PlayGlyph className="h-[4.25rem] w-[4.25rem] shrink-0 drop-shadow-lg transition-transform group-hover:scale-105 group-active:scale-95 sm:h-[5rem] sm:w-[5rem]" />
              </span>
            </button>
          ) : (
            player
          )}
        </div>
      </div>
    </section>
  );
}
