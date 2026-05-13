import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type DualKeySectionProps = {
  title: string;
  body: string;
  bullets: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
};

export function DualKeySection({
  title,
  body,
  bullets,
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPickImage,
}: DualKeySectionProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)] rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-card)] p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-[var(--fs-heading)]">{title}</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--fs-muted)]">{body}</p>
        <div className="mt-8">
          <OptionalSectionImage
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            imageCredit={imageCredit}
            onPickImage={onPickImage}
            align={imageAlign}
            className="max-w-2xl"
          />
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="rounded-xl border border-[var(--fs-border-soft)] bg-[var(--fs-bullet-canvas)] px-4 py-3 text-sm text-[var(--fs-text)]"
            >
              <span className="mr-2 font-bold" style={{ color: "var(--brand-primary, #a78bfa)" }}>
                {i + 1}.
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
