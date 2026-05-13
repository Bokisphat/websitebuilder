"use client";

export type SectionImageAlign = "left" | "center" | "right";

export function coerceSectionImageAlign(raw: unknown): SectionImageAlign | undefined {
  if (raw === "left" || raw === "center" || raw === "right") return raw;
  return undefined;
}

function alignClass(align: SectionImageAlign): string {
  switch (align) {
    case "left":
      return "";
    case "right":
      return "ml-auto";
    case "center":
    default:
      return "mx-auto";
  }
}

export type OptionalSectionImageProps = {
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  /** Builder preview: opens stock image picker when clicking placeholder or image. */
  onPickImage?: () => void;
  /** Minimum height for placeholder / image area */
  minHeightClass?: string;
  className?: string;
  /** Horizontal placement when width is constrained (e.g. max-w-3xl). Default center. */
  align?: SectionImageAlign;
};

/**
 * Decorative / explanatory image block shared across homepage sections (builder + published).
 */
export function OptionalSectionImage({
  imageUrl,
  imageAlt,
  imageCredit,
  onPickImage,
  minHeightClass = "min-h-[160px]",
  className = "",
  align = "center",
}: OptionalSectionImageProps) {
  const pickable = Boolean(onPickImage);
  const wrapCls = `flex w-full flex-col gap-2 ${alignClass(align)} ${className}`.trim();

  if (imageUrl) {
    return (
      <div className={wrapCls}>
        {pickable ? (
          <button
            type="button"
            onClick={onPickImage}
            className={`group relative w-full overflow-hidden rounded-2xl border border-[var(--fs-pick-border)] bg-[var(--fs-image-placeholder)]/80 text-left ring-2 ring-transparent transition hover:opacity-[0.98] focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 ${minHeightClass}`}
          >
            <img
              src={imageUrl}
              alt={imageAlt || "Section image"}
              className="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition [background:var(--fs-hover-overlay)] group-hover:opacity-100 group-focus-visible:opacity-100" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition [background:var(--fs-badge-bg)] group-hover:opacity-100 group-focus-visible:opacity-100">
                Change image
              </span>
            </span>
          </button>
        ) : (
          <figure className={`overflow-hidden rounded-2xl border border-[var(--fs-border)] ${minHeightClass}`}>
            <img
              src={imageUrl}
              alt={imageAlt || "Section image"}
              className="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
            {imageCredit ? (
              <figcaption className="mt-2 text-center text-xs text-[var(--fs-subtle)]">{imageCredit}</figcaption>
            ) : null}
          </figure>
        )}
        {imageCredit && pickable ? <p className="text-center text-xs text-[var(--fs-subtle)]">{imageCredit}</p> : null}
      </div>
    );
  }

  if (!pickable) return null;

  return (
    <div className={wrapCls}>
      <button
        type="button"
        onClick={onPickImage}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--fs-pick-border)] bg-[var(--fs-card)]/50 px-4 py-6 text-sm text-[var(--fs-muted)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${minHeightClass}`}
      >
        <span className="text-center">
          <span className="block font-semibold" style={{ color: "var(--brand-primary, #a78bfa)" }}>
            Add an image
          </span>
          <span className="mt-1 block text-xs text-[var(--fs-subtle)]">Choose from the library in the sidebar</span>
        </span>
      </button>
    </div>
  );
}
