"use client";

import { useState } from "react";
import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type LeadFormProps = {
  title: string;
  description?: string;
  buttonLabel: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
  /** Scroll target for /contact#enquiry etc. */
  anchorId?: string;
};

export function LeadForm({
  title,
  description,
  buttonLabel,
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPickImage,
  anchorId,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section id={anchorId || undefined} className="scroll-mt-28 px-6 py-16">
      <div className="mx-auto max-w-lg">
        {(imageUrl || onPickImage) && (
          <div className="mb-8">
            <OptionalSectionImage
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              imageCredit={imageCredit}
              onPickImage={onPickImage}
              align={imageAlign}
            />
          </div>
        )}
        <div className="rounded-2xl border border-[var(--fs-border)] bg-[var(--fs-card)] p-8">
        <h2 className="text-xl font-bold text-[var(--fs-heading)]">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[var(--fs-muted)]">{description}</p> : null}
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = { name, email, phone };
            console.log("[LeadForm demo submit]", payload);
            setDone(true);
          }}
        >
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            autoComplete="name"
            className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-4 py-3 text-sm text-[var(--fs-text)] outline-none focus:border-violet-500/50"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-4 py-3 text-sm text-[var(--fs-text)] outline-none focus:border-violet-500/50"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            autoComplete="tel"
            className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-4 py-3 text-sm text-[var(--fs-text)] outline-none focus:border-violet-500/50"
          />
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--brand-primary, #a78bfa)" }}
          >
            {buttonLabel}
          </button>
        </form>
        {done ? (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
            Thanks — we&apos;ll be in touch. (Demo: your details were logged to the browser console only.)
          </p>
        ) : null}
        </div>
      </div>
    </section>
  );
}
