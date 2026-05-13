import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
};

export type TestimonialSectionProps = {
  /** Multiple testimonials (preferred). */
  items?: TestimonialItem[];
  /** Legacy single testimonial — merged into `items` when `items` is absent. */
  quote?: string;
  author?: string;
  role?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
};

function normalizeItems(props: TestimonialSectionProps): TestimonialItem[] {
  if (props.items && props.items.length > 0) {
    return props.items.map((it) => ({
      quote: typeof it.quote === "string" ? it.quote : "",
      author: typeof it.author === "string" ? it.author : "",
      role: typeof it.role === "string" ? it.role : "",
    }));
  }
  return [
    {
      quote: props.quote ?? "",
      author: props.author ?? "",
      role: props.role ?? "",
    },
  ];
}

export function TestimonialSection(props: TestimonialSectionProps) {
  const items = normalizeItems(props);
  const { imageUrl, imageAlt, imageCredit, onPickImage } = props;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)]">
        <OptionalSectionImage
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          imageCredit={imageCredit}
          onPickImage={onPickImage}
          align={props.imageAlign}
          className="mb-10 max-w-3xl"
        />
        <div className="grid gap-8 md:grid-cols-2">
          {items.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-card)] p-8 text-center md:text-left"
            >
              <p className="text-lg leading-relaxed text-[var(--fs-text)]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6">
                <p className="font-semibold text-[var(--fs-heading)]">{t.author}</p>
                <p className="text-sm text-[var(--fs-subtle)]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
