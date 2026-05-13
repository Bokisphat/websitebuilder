"use client";

import { useState } from "react";
import type { VideoEmbedProps } from "@/components/sections/VideoEmbed";
import type { SiteConfig } from "@/lib/site-model";
import { patchPageSectionProps } from "@/lib/patch-page-section";

type AiGenJson = { url?: string; revisedPrompt?: string; error?: string };

type Props = {
  site: SiteConfig;
  pageId: string;
  sectionId: string;
  onChange: (next: SiteConfig) => void;
  props: Record<string, unknown>;
};

function readVideoProps(props: Record<string, unknown>): VideoEmbedProps {
  return {
    title: typeof props.title === "string" ? props.title : "",
    body: typeof props.body === "string" ? props.body : "",
    videoUrl: typeof props.videoUrl === "string" ? props.videoUrl : "",
    thumbnailUrl: typeof props.thumbnailUrl === "string" ? props.thumbnailUrl : undefined,
  };
}

export function BuilderVideoEmbedEditor({ site, pageId, sectionId, onChange, props: rawProps }: Props) {
  const p = readVideoProps(rawProps);
  const [aiThumbnailPrompt, setAiThumbnailPrompt] = useState("");
  const [aiThumbnailLoading, setAiThumbnailLoading] = useState(false);
  const [aiThumbnailError, setAiThumbnailError] = useState<string | null>(null);

  const patch = (partial: Partial<VideoEmbedProps>) => {
    onChange(patchPageSectionProps(site, pageId, sectionId, partial as Record<string, unknown>));
  };

  const runAiThumbnail = async () => {
    const userLine = aiThumbnailPrompt.trim();
    const inferred =
      p.title?.trim() ||
      (p.videoUrl.trim() ? "Property marketing video" : "Video thumbnail");
    const composed = userLine
      ? `${userLine}. Wide 16:9 composition suitable as an online video cover image, cinematic, photographic, no text or logos on the image.`
      : `${inferred}, wide 16:9 composition suitable as an online video cover image, cinematic, photographic, professional, no text or logos on the image.`;

    setAiThumbnailLoading(true);
    setAiThumbnailError(null);
    try {
      const res = await fetch("/api/ai-image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: composed }),
      });
      const data = (await res.json()) as AiGenJson;
      if (!res.ok) {
        setAiThumbnailError(data.error ?? "Could not generate image");
        return;
      }
      if (!data.url) {
        setAiThumbnailError("No image returned");
        return;
      }
      patch({ thumbnailUrl: data.url });
    } catch {
      setAiThumbnailError("Network error");
    } finally {
      setAiThumbnailLoading(false);
    }
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-[var(--fusion-builder-accent)]/25 bg-zinc-50/95 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--fusion-builder-accent)]">Video</p>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Title (optional)</span>
        <input
          value={p.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Supporting text (optional)</span>
        <textarea
          value={p.body}
          onChange={(e) => patch({ body: e.target.value })}
          rows={3}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Video link</span>
        <input
          type="url"
          inputMode="url"
          placeholder="YouTube, Vimeo, Nextcloud direct file link, or other https:// video URL"
          value={p.videoUrl}
          onChange={(e) => patch({ videoUrl: e.target.value })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Thumbnail / poster URL (optional)</span>
        <input
          type="url"
          inputMode="url"
          placeholder="HTTPS image URL — overrides YouTube poster; recommended for raw .mp4 links"
          value={p.thumbnailUrl ?? ""}
          onChange={(e) => patch({ thumbnailUrl: e.target.value || undefined })}
          onBlur={(e) => patch({ thumbnailUrl: e.target.value.trim() || undefined })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      <div className="rounded-lg border border-zinc-200 bg-white/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">AI thumbnail (optional)</p>
        <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
          Uses the same{" "}
          <code className="rounded bg-zinc-100 px-0.5 text-[9px] text-zinc-700">OPENAI_API_KEY</code> as{" "}
          <span className="text-zinc-600">Choose an image → Create with AI</span>. Leave the prompt blank to derive a
          description from your section title (or generic).
        </p>
        <label className="mt-2 block">
          <span className="mb-1 block text-[10px] uppercase text-zinc-500">Describe the cover image</span>
          <textarea
            value={aiThumbnailPrompt}
            onChange={(e) => setAiThumbnailPrompt(e.target.value)}
            rows={2}
            placeholder="e.g. Australian new-build townhouses at dusk, crane in background…"
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
          />
        </label>
        <button
          type="button"
          onClick={() => void runAiThumbnail()}
          disabled={aiThumbnailLoading}
          className="mt-2 w-full rounded-lg bg-[var(--fusion-builder-accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)] disabled:opacity-50"
        >
          {aiThumbnailLoading ? "Generating…" : "Generate thumbnail with AI"}
        </button>
        {aiThumbnailError ? (
          <p className="mt-2 text-[11px] text-amber-800">{aiThumbnailError}</p>
        ) : null}
        <p className="mt-2 text-[9px] text-zinc-500">
          Hosted image URLs from OpenAI can expire — re-host for long-lived production pages if needed.
        </p>
      </div>

      <p className="text-[10px] leading-relaxed text-zinc-500">
        Visitors see a poster with a play control; playback starts inline on click. Vimeo posters load from Vimeo when the
        link is pasted.
      </p>
    </div>
  );
}
