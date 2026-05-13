export type TextImageProps = {
  title: string;
  body: string;
  imageSide?: "left" | "right";
  imageLabel?: string;
  /** Set from the builder (e.g. Pexels) or any HTTPS image URL. */
  imageUrl?: string;
  imageAlt?: string;
  /** e.g. "Photo by John Doe on Pexels" — optional attribution. */
  imageCredit?: string;
  /** Builder only: opens the stock image picker when the image area is clicked. */
  onPickImage?: () => void;
};

export function TextImage({
  title,
  body,
  imageSide = "right",
  imageLabel = "Image",
  imageUrl,
  imageAlt,
  imageCredit,
  onPickImage,
}: TextImageProps) {
  const pickable = Boolean(onPickImage);

  const imageBlock = imageUrl ? (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      {pickable ? (
        <button
          type="button"
          onClick={onPickImage}
          className="group relative min-h-[200px] w-full flex-1 overflow-hidden rounded-2xl border border-[var(--fs-pick-border)] bg-[var(--fs-image-placeholder)]/80 text-left ring-2 ring-transparent transition hover:opacity-[0.98] focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
        >
          <img
            src={imageUrl}
            alt={imageAlt || imageLabel || "Section image"}
            className="h-full w-full min-h-[200px] object-cover"
            loading="lazy"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-transparent transition [background:var(--fs-hover-overlay)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition [background:var(--fs-badge-bg)] group-hover:opacity-100 group-focus-visible:opacity-100">
              Change image
            </span>
          </span>
        </button>
      ) : (
        <div className="relative min-h-[200px] w-full flex-1 overflow-hidden rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-image-placeholder)]/80">
          <img
            src={imageUrl}
            alt={imageAlt || imageLabel || "Section image"}
            className="h-full w-full min-h-[200px] object-cover"
            loading="lazy"
          />
        </div>
      )}
      {imageCredit ? <p className="text-center text-xs text-[var(--fs-subtle)]">{imageCredit}</p> : null}
    </div>
  ) : pickable ? (
    <button
      type="button"
      onClick={onPickImage}
      className="flex min-h-[200px] w-full min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--fs-pick-border)] bg-[var(--fs-card)]/50 px-4 text-sm text-[var(--fs-muted)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
    >
      <span className="text-center">
        <span className="block font-semibold" style={{ color: "var(--brand-primary, #a78bfa)" }}>
          Click to choose an image
        </span>
        <span className="mt-1 block text-xs text-[var(--fs-subtle)]">Pexels, Unsplash, or create with AI from the image library</span>
      </span>
      <span className="rounded-md border border-[var(--fs-border)] bg-[var(--fs-elevated)]/80 px-2 py-0.5 text-xs text-[var(--fs-faint)]">
        Placeholder: {imageLabel}
      </span>
    </button>
  ) : (
    <div className="flex min-h-[200px] flex-1 items-center justify-center rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-image-placeholder)]/80 text-sm text-[var(--fs-subtle)]">
      {imageLabel}
    </div>
  );
  const textBlock = (
    <div className="flex-1">
      <h2 className="text-2xl font-bold text-[var(--fs-heading)]">{title}</h2>
      <p className="mt-4 leading-relaxed text-[var(--fs-muted)]">{body}</p>
    </div>
  );

  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex w-full max-w-[var(--fs-content-max,72rem)] flex-col gap-10 md:flex-row md:items-center">
        {imageSide === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </section>
  );
}
