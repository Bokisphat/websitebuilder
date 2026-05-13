"use client";

import { VideoEmbed } from "@/components/sections/VideoEmbed";
import { parseVideoUrl } from "@/lib/parse-video-url";

function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

type Props = {
  url: string;
  label?: string;
};

/**
 * Page-level video: embeds YouTube, Vimeo, or direct media; other http(s) URLs render as an outbound “Watch video” link
 * (e.g. Nextcloud public share pages).
 */
export function PageLinkedVideo({ url, label }: Props) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const parsed = parseVideoUrl(trimmed);
  const title = label?.trim() || "Video";

  if (parsed.kind !== "invalid") {
    return <VideoEmbed videoUrl={trimmed} title={title} body="" />;
  }

  if (!isSafeHttpUrl(trimmed)) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-6">
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--fs-heading)]">
          Enter a valid http(s) link to your hosted video.
        </p>
      </section>
    );
  }

  const openLabel = label?.trim() || "Watch video";
  let host = "";
  try {
    host = new URL(trimmed).hostname.replace(/^www\./, "");
  } catch {
    /* noop */
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-8">
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--fs-border)] bg-[var(--fs-card)] px-5 py-3 text-sm font-semibold text-[var(--fs-heading)] shadow-sm transition hover:opacity-95"
      >
        {openLabel}
        <span aria-hidden className="text-[var(--fs-muted)]">
          ↗
        </span>
      </a>
      {host ? (
        <p className="mt-2 text-xs text-[var(--fs-muted)]">Opens in a new tab · {host}</p>
      ) : null}
    </section>
  );
}
