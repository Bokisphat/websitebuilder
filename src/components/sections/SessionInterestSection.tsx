"use client";

import { useState } from "react";
import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type SessionInterestSectionProps = {
  title: string;
  description?: string;
  /** In-page anchor for hero CTAs, e.g. #session-interest */
  anchorId?: string;
  optionPhoneLabel: string;
  optionZoomLabel: string;
  buttonLabel: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
};

export function SessionInterestSection({
  title,
  description,
  anchorId = "session-interest",
  optionPhoneLabel,
  optionZoomLabel,
  buttonLabel,
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPickImage,
}: SessionInterestSectionProps) {
  const [preference, setPreference] = useState<"phone" | "zoom" | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const idBase = anchorId.replace(/[^a-zA-Z0-9_-]/g, "") || "session-interest";

  return (
    <section id={anchorId} className="scroll-mt-28 px-6 py-16">
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

        {!done ? (
          <form
            className="mt-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!preference) return;
              const payload = {
                sessionPreference: preference,
                preferenceLabel:
                  preference === "phone"
                    ? optionPhoneLabel
                    : preference === "zoom"
                      ? optionZoomLabel
                      : preference,
                name,
                email,
                phone,
              };
              console.log("[SessionInterest demo submit]", payload);
              setDone(true);
            }}
          >
            <fieldset>
              <legend className="mb-3 block text-sm font-medium text-[var(--fs-heading)]">
                How would you like to connect?
              </legend>
              <div className="space-y-2">
                <label
                  htmlFor={`${idBase}-phone`}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    preference === "phone"
                      ? "border-violet-500/60 bg-violet-500/10 text-[var(--fs-heading)]"
                      : "border-[var(--fs-border)] text-[var(--fs-muted)] hover:border-white/20"
                  }`}
                >
                  <input
                    id={`${idBase}-phone`}
                    type="radio"
                    name="sessionPreference"
                    value="phone"
                    checked={preference === "phone"}
                    onChange={() => setPreference("phone")}
                    className="mt-0.5 h-4 w-4 shrink-0 border-[var(--fs-border)] text-violet-500 focus:ring-violet-500/50"
                  />
                  <span>{optionPhoneLabel}</span>
                </label>
                <label
                  htmlFor={`${idBase}-zoom`}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    preference === "zoom"
                      ? "border-violet-500/60 bg-violet-500/10 text-[var(--fs-heading)]"
                      : "border-[var(--fs-border)] text-[var(--fs-muted)] hover:border-white/20"
                  }`}
                >
                  <input
                    id={`${idBase}-zoom`}
                    type="radio"
                    name="sessionPreference"
                    value="zoom"
                    checked={preference === "zoom"}
                    onChange={() => setPreference("zoom")}
                    className="mt-0.5 h-4 w-4 shrink-0 border-[var(--fs-border)] text-violet-500 focus:ring-violet-500/50"
                  />
                  <span>{optionZoomLabel}</span>
                </label>
              </div>
            </fieldset>

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
              placeholder="Phone (optional)"
              autoComplete="tel"
              className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-input-bg)] px-4 py-3 text-sm text-[var(--fs-text)] outline-none focus:border-violet-500/50"
            />
            <button
              type="submit"
              disabled={!preference}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--brand-primary, #a78bfa)" }}
            >
              {buttonLabel}
            </button>
          </form>
        ) : (
          <p className="mt-6 rounded-lg border border-emerald-600/25 bg-emerald-500/10 px-4 py-3 text-sm text-[var(--fs-heading)]">
            Thanks — we&apos;ll reply within one business day to confirm your preference and organise a time. (Demo: request
            was logged to the browser console only.)
          </p>
        )}
        </div>
      </div>
    </section>
  );
}
