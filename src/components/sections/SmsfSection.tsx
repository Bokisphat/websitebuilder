import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type SmsfSectionProps = {
  title: string;
  body: string;
  /** Extra explanatory copy — shown after the image when set, or after the intro if there is no image. */
  extendedBody?: string;
  points: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
};

export function SmsfSection({
  title,
  body,
  extendedBody,
  points,
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPickImage,
}: SmsfSectionProps) {
  return (
    <section className="border-y border-[var(--fs-border)] bg-[var(--fs-band)] px-6 py-16">
      <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--fs-heading)]">{title}</h2>
            <p className="leading-relaxed text-[var(--fs-muted)]">{body}</p>
            {(imageUrl || onPickImage) && (
              <OptionalSectionImage
                imageUrl={imageUrl}
                imageAlt={imageAlt}
                imageCredit={imageCredit}
                onPickImage={onPickImage}
                align={imageAlign}
              />
            )}
            {extendedBody ? (
              <p className="leading-relaxed text-[var(--fs-muted)]">{extendedBody}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-inset)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fs-subtle)]">Checklist</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--fs-text)]">
              {points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: "var(--brand-secondary, #34d399)" }}>✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
