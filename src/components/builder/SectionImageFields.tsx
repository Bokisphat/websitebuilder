"use client";

import { coerceSectionImageAlign, type SectionImageAlign } from "@/components/sections/OptionalSectionImage";

type SectionImageFieldsProps = {
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPatch: (partial: Record<string, unknown>) => void;
  onRequestPexels: () => void;
};

/** Shared image alt/credit + library buttons for builder section editors. */
export function SectionImageFields({
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPatch,
  onRequestPexels,
}: SectionImageFieldsProps) {
  const align = coerceSectionImageAlign(imageAlign) ?? "center";

  return (
    <div className="space-y-2 border-t border-zinc-200 pt-2">
      <p className="text-[10px] uppercase text-zinc-500">Image (optional)</p>
      {imageUrl ? (
        <div className="flex gap-2">
          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-300">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() =>
                onPatch({
                  imageUrl: undefined,
                  imageAlt: undefined,
                  imageCredit: undefined,
                  imageAlign: undefined,
                })
              }
              className="text-xs font-medium text-[var(--fusion-builder-accent)] hover:text-[var(--fusion-builder-accent-hover)]"
            >
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-zinc-500">No image — optional visual for this section.</p>
      )}
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Image description (accessibility)</span>
        <input
          value={imageAlt ?? ""}
          onChange={(e) => onPatch({ imageAlt: e.target.value || undefined })}
          onBlur={(e) => onPatch({ imageAlt: e.target.value.trim() || undefined })}
          placeholder="Describe the photo"
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Photo credit (optional)</span>
        <input
          value={imageCredit ?? ""}
          onChange={(e) => onPatch({ imageCredit: e.target.value || undefined })}
          onBlur={(e) => onPatch({ imageCredit: e.target.value.trim() || undefined })}
          placeholder="e.g. Photo by … on Pexels"
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Image alignment</span>
        <select
          value={align}
          onChange={(e) => {
            const v = e.target.value as SectionImageAlign;
            onPatch({ imageAlign: v === "center" ? undefined : v });
          }}
          className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        >
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequestPexels}
          className="rounded-lg bg-[var(--fusion-builder-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--fusion-builder-accent-hover)]"
        >
          Choose image
        </button>
        {imageUrl ? (
          <button
            type="button"
            onClick={onRequestPexels}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 hover:bg-zinc-100"
          >
            Change image
          </button>
        ) : null}
      </div>
      <p className="text-[10px] text-zinc-600">Or click the image area in the live preview.</p>
    </div>
  );
}
