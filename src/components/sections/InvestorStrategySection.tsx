import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type InvestorStrategySectionProps = {
  title: string;
  intro: string;
  bullets: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
};

export function InvestorStrategySection({
  title,
  intro,
  bullets,
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPickImage,
}: InvestorStrategySectionProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)]">
        <h2 className="text-2xl font-bold text-[var(--fs-heading)]">{title}</h2>
        <p className="mt-4 max-w-2xl text-[var(--fs-muted)]">{intro}</p>
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
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-card)] p-5 text-sm leading-relaxed text-[var(--fs-text)]"
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
