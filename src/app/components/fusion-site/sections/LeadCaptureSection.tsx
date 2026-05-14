"use client";

import { useState } from "react";
import type { LeadCaptureSectionConfig } from "@/app/lib/section-config";
import { BrandedButton } from "../BrandedButton";

export function LeadCaptureSection({ section }: { section: LeadCaptureSectionConfig }) {
  const [sent, setSent] = useState(false);

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-xl shadow-black/30">
        <h2 className="text-2xl font-bold text-white">{section.title}</h2>
        {section.subtitle ? <p className="mt-2 text-sm text-zinc-400">{section.subtitle}</p> : null}

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="Name">
            <input
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none ring-0 focus:border-[var(--site-primary)]"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-[var(--site-primary)]"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-[var(--site-primary)]"
            />
          </Field>
          <Field label="Message">
            <textarea
              rows={4}
              className="w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-[var(--site-primary)]"
            />
          </Field>
          <BrandedButton type="submit" variant="primary" className="w-full">
            {section.buttonLabel}
          </BrandedButton>
        </form>

        {sent ? (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-zinc-100">
            Thanks — this is a demo form; nothing was sent.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
