"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { PexelsSearchPhoto } from "@/lib/pexels-types";
import type { UnsplashSearchResult } from "@/lib/unsplash-types";

type PexelsImagePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: {
    imageUrl: string;
    imageAlt: string;
    imageCredit: string;
  }) => void;
  initialQuery?: string;
};

type PexelsJson = { photos?: PexelsSearchPhoto[]; error?: string };
type UnsplashJson = { results?: UnsplashSearchResult[]; error?: string };
type AiGenJson = { url?: string; revisedPrompt?: string; error?: string };

type StockRow = {
  key: string;
  thumb: string;
  imageUrl: string;
  imageAlt: string;
  imageCredit: string;
};

type Source = "pexels" | "unsplash" | "ai";

export function PexelsImagePicker({
  open,
  onClose,
  onSelect,
  initialQuery = "modern architecture interior",
}: PexelsImagePickerProps) {
  const titleId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [source, setSource] = useState<Source>("pexels");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<StockRow[]>([]);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<{ url: string; alt: string } | null>(null);

  const runSearch = useCallback(async (q: string, src: Exclude<Source, "ai">) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      if (src === "pexels") {
        const u = new URL("/api/pexels/search", window.location.origin);
        u.searchParams.set("query", trimmed);
        u.searchParams.set("per_page", "18");
        u.searchParams.set("orientation", "landscape");
        const res = await fetch(u.toString());
        const data = (await res.json()) as PexelsJson;
        if (!res.ok) {
          setError(data.error ?? "Search failed");
          setRows([]);
          return;
        }
        const photos = data.photos ?? [];
        setRows(
          photos.map((photo) => ({
            key: `pexels-${photo.id}`,
            thumb: photo.src.medium,
            imageUrl: photo.src.large2x || photo.src.large,
            imageAlt: photo.alt || "Photo",
            imageCredit: `Photo by ${photo.photographer} on Pexels`,
          }))
        );
        if (!photos.length) setError("No photos found. Try a different search.");
        return;
      }

      const u = new URL("/api/unsplash/search", window.location.origin);
      u.searchParams.set("query", trimmed);
      u.searchParams.set("per_page", "18");
      u.searchParams.set("orientation", "landscape");
      const res = await fetch(u.toString());
      const data = (await res.json()) as UnsplashJson;
      if (!res.ok) {
        setError(data.error ?? "Unsplash search failed");
        setRows([]);
        return;
      }
      const results = data.results ?? [];
      setRows(
        results.map((r) => ({
          key: `unsplash-${r.id}`,
          thumb: r.urls.thumb,
          imageUrl: r.urls.regular,
          imageAlt: r.alt_description || "Photo",
          imageCredit: `Photo by ${r.user.name} on Unsplash`,
        }))
      );
      if (!results.length) setError("No photos found. Try a different search.");
    } catch {
      setError("Network error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setSource("pexels");
    setAiPreview(null);
    setAiPrompt("");
    setError(null);
    void runSearch(initialQuery, "pexels");
  }, [open, initialQuery, runSearch]);

  const switchSource = (next: Source) => {
    setError(null);
    setAiPreview(null);
    setSource(next);
    if (next === "pexels" || next === "unsplash") {
      void runSearch(query.trim() || initialQuery, next);
    } else {
      setRows([]);
      setLoading(false);
    }
  };

  const runAiGenerate = async () => {
    const p = aiPrompt.trim();
    if (!p) {
      setError("Describe the image you want");
      return;
    }
    setAiLoading(true);
    setError(null);
    setAiPreview(null);
    try {
      const res = await fetch("/api/ai-image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      const data = (await res.json()) as AiGenJson;
      if (!res.ok) {
        setError(data.error ?? "Could not generate image");
        return;
      }
      if (!data.url) {
        setError("No image returned");
        return;
      }
      const alt = (data.revisedPrompt ?? p).slice(0, 200);
      setAiPreview({ url: data.url, alt });
    } catch {
      setError("Network error");
    } finally {
      setAiLoading(false);
    }
  };

  if (!open) return null;

  const applyAiSelection = () => {
    if (!aiPreview) return;
    onSelect({
      imageUrl: aiPreview.url,
      imageAlt: aiPreview.alt,
      imageCredit: "AI-generated image (OpenAI GPT Image)",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-200 px-4 py-3 sm:px-5">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
            Choose an image
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {source === "ai"
              ? "Describe a scene; we call OpenAI image generation (GPT Image; uses your server API key, billed by OpenAI)."
              : "Pexels and Unsplash: credit is stored on the section. Keys live in "}
            {source !== "ai" ? (
              <code className="rounded bg-zinc-100 px-1 text-[10px] text-zinc-700">.env.local</code>
            ) : null}
            {source !== "ai" ? "." : null}
          </p>
          <div className="mt-3 flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => switchSource("pexels")}
              className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition sm:px-3 ${
                source === "pexels" ? "bg-[var(--fusion-builder-accent)] text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Pexels
            </button>
            <button
              type="button"
              onClick={() => switchSource("unsplash")}
              className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition sm:px-3 ${
                source === "unsplash" ? "bg-[var(--fusion-builder-accent)] text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Unsplash
            </button>
            <button
              type="button"
              onClick={() => switchSource("ai")}
              className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition sm:px-3 ${
                source === "ai" ? "bg-[var(--fusion-builder-accent)] text-white" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Create with AI
            </button>
          </div>
        </div>

        {source === "ai" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-b border-zinc-200 p-3 sm:p-4">
            <label className="block text-xs font-medium text-zinc-700">
              Prompt
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. modern Australian townhouses at golden hour, architectural photography, no text"
                className="mt-1 w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
              />
            </label>
            <button
              type="button"
              onClick={() => void runAiGenerate()}
              disabled={aiLoading}
              className="mt-3 rounded-xl bg-[var(--fusion-builder-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)] disabled:opacity-50"
            >
              {aiLoading ? "Generating…" : "Generate image"}
            </button>
            {error && source === "ai" ? <p className="mt-2 text-sm text-amber-800">{error}</p> : null}
            {aiPreview ? (
              <div className="mt-4">
                <p className="mb-2 text-xs text-zinc-500">
                  Tap the image below or choose <strong className="text-zinc-700">Use this image</strong> to add it to the
                  section.
                </p>
                <button
                  type="button"
                  onClick={applyAiSelection}
                  className="group w-full overflow-hidden rounded-xl border-2 border-zinc-200 text-left outline-none ring-[var(--fusion-builder-accent)]/0 transition hover:border-[var(--fusion-builder-accent)]/55 focus-visible:ring-2 focus-visible:ring-[var(--fusion-builder-accent)]/45"
                >
                  <img
                    src={aiPreview.url}
                    alt=""
                    className="max-h-72 w-full object-cover"
                  />
                  <span className="sr-only">Use this generated image</span>
                </button>
                <button
                  type="button"
                  onClick={applyAiSelection}
                  className="mt-3 w-full rounded-xl bg-[var(--fusion-builder-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)]"
                >
                  Use this image
                </button>
                <p className="mt-2 text-[10px] text-zinc-500">
                  OpenAI image links can expire; for long-lived production pages, plan to re-host the file or regenerate.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <form
            className="flex gap-2 border-b border-zinc-200 p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch(query, source);
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. luxury home, city skyline, family…"
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded-xl bg-[var(--fusion-builder-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)] disabled:opacity-50"
            >
              {loading ? "…" : "Search"}
            </button>
          </form>
        )}

        {source !== "ai" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {error ? <p className="mb-3 text-sm text-amber-800">{error}</p> : null}
            {loading && !rows.length ? (
              <p className="text-sm text-zinc-500">Loading…</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {rows.map((row) => (
                  <li key={row.key}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect({
                          imageUrl: row.imageUrl,
                          imageAlt: row.imageAlt,
                          imageCredit: row.imageCredit,
                        });
                      }}
                      className="group relative w-full overflow-hidden rounded-xl border border-zinc-200 ring-[var(--fusion-builder-accent)]/0 transition hover:ring-2 hover:ring-[var(--fusion-builder-accent)]/45"
                    >
                      <img src={row.thumb} alt="" className="aspect-[4/3] w-full object-cover" />
                      <span className="sr-only">Select this image</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className="border-t border-zinc-200 p-3 sm:flex sm:justify-end sm:px-4 sm:py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
