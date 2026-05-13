"use client";

import { anchorPropsForExternalBooking } from "@/lib/booking-link";
import { getHeroVisualPreset } from "@/lib/hero-template-visuals";
import type { SiteLayoutId } from "@/lib/site-model";
import type { MouseEvent } from "react";
import { OptionalSectionImage, type SectionImageAlign } from "./OptionalSectionImage";

export type HeroSectionProps = {
  headline: string;
  subheadline?: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageAlign?: SectionImageAlign;
  onPickImage?: () => void;
  /**
   * Full-bleed backdrop behind headline (editable URL). When set, text switches to light-on-image
   * with a darkening overlay for readability.
   */
  backdropImageUrl?: string;
  backdropImageAlt?: string;
  /** 0–100: black overlay opacity on top of the backdrop (default 55 when an image is set). */
  backdropOverlayStrength?: number;
  /**
   * Which layout preset this site was built from — drives default typography and spacing (still editable via hero props).
   */
  fusionTemplate?: SiteLayoutId;
  /**
   * `agencyPortal` = split layout with optional “featured listing” card and strategy chips
   * (consultancy + listings sites). Default remains centered single column.
   */
  variant?: "default" | "agencyPortal";
  spotlightLabel?: string;
  spotlightTitle?: string;
  spotlightPrice?: string;
  spotlightLocation?: string;
  spotlightBeds?: string;
  spotlightBaths?: string;
  spotlightCars?: string;
  /** Short labels shown as pills under the hero (e.g. FIRB, SMSF, Metro). */
  strategyTags?: string[];
};

function scrollToHashAnchor(e: MouseEvent<HTMLAnchorElement>, href: string) {
  const h = href.trim();
  if (!h.startsWith("#") || h.length <= 1) return;
  const id = decodeURIComponent(h.slice(1));
  let el = document.getElementById(id);
  if (!el && typeof CSS !== "undefined" && "escape" in CSS) {
    try {
      el = document.querySelector(`#${CSS.escape(id)}`);
    } catch {
      el = null;
    }
  }
  if (el instanceof HTMLElement) {
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function cn(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function HeroSection({
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  imageUrl,
  imageAlt,
  imageCredit,
  imageAlign,
  onPickImage,
  backdropImageUrl,
  backdropImageAlt,
  backdropOverlayStrength,
  fusionTemplate = "custom",
  variant = "default",
  spotlightLabel,
  spotlightTitle,
  spotlightPrice,
  spotlightLocation,
  spotlightBeds,
  spotlightBaths,
  spotlightCars,
  strategyTags,
}: HeroSectionProps) {
  const linkExtra = anchorPropsForExternalBooking(ctaHref);
  const v = getHeroVisualPreset(fusionTemplate);
  const backdropUrl = backdropImageUrl?.trim();
  const hasBackdrop = Boolean(backdropUrl);
  let overlayPct =
    typeof backdropOverlayStrength === "number" && !Number.isNaN(backdropOverlayStrength)
      ? backdropOverlayStrength
      : hasBackdrop
        ? 55
        : 0;
  overlayPct = Math.min(85, Math.max(0, overlayPct));

  const ctaBase =
    "inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90";
  const titleColor = hasBackdrop ? "text-white" : "text-[var(--fs-heading)]";
  const subColor = hasBackdrop ? "text-white/85" : "text-[var(--fs-muted)]";
  const tagClass = hasBackdrop
    ? "rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
    : "rounded-full border border-[var(--fs-border)] bg-[var(--fs-band)] px-3 py-1.5 text-xs font-medium text-[var(--fs-muted)]";

  const cardShell = hasBackdrop
    ? "rounded-2xl border border-white/25 bg-white/95 p-6 text-zinc-900 shadow-2xl shadow-black/25 backdrop-blur-sm"
    : cn("rounded-2xl border border-[var(--fs-border)] p-6 shadow-[var(--fs-shadow)]");

  const sectionShell = cn(
    "relative overflow-hidden border-b border-[var(--fs-border)]",
    variant === "agencyPortal" ? cn(v.section, v.agencySectionExtra) : v.section,
  );

  const innerPad = variant === "agencyPortal" ? v.agencyPadding : v.padding;

  const backdropBlock =
    hasBackdrop && backdropUrl ? (
      <>
        <img
          src={backdropUrl}
          alt={backdropImageAlt ?? ""}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayPct / 100 }}
          aria-hidden
        />
      </>
    ) : (
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--fs-hero-from)] to-[var(--fs-hero-to)]"
        aria-hidden
      />
    );

  if (variant === "agencyPortal") {
    const hasSpotlight = Boolean(spotlightTitle?.trim());
    const tags = (strategyTags ?? []).map((t) => t.trim()).filter(Boolean);
    const cardHeading = hasBackdrop ? "text-zinc-900" : "text-[var(--fs-heading)]";
    const cardMuted = hasBackdrop ? "text-zinc-600" : "text-[var(--fs-muted)]";
    const cardPrice = hasBackdrop ? "text-zinc-900" : "text-[var(--fs-heading)]";
    const cardBorder = hasBackdrop ? "border-zinc-200" : "border-[var(--fs-border)]";
    const statLabelClass = hasBackdrop ? "text-zinc-500" : "text-[var(--fs-subtle)]";
    const statValueClass = hasBackdrop ? "font-semibold text-zinc-900" : "font-semibold text-[var(--fs-heading)]";
    const stat = (label: string, value: string | undefined) =>
      value ? (
        <div key={label}>
          <dt className={cn("text-xs", statLabelClass)}>{label}</dt>
          <dd className={statValueClass}>{value}</dd>
        </div>
      ) : null;

    return (
      <section className={sectionShell}>
        {backdropBlock}
        <div className={cn("relative z-10 px-6", innerPad)}>
          <div className="mx-auto w-full max-w-[var(--fs-content-max,72rem)]">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="text-center lg:col-span-7 lg:text-left">
                <h1 className={cn("whitespace-pre-line", v.agencyTitle, titleColor)}>{headline}</h1>
                {subheadline ? <p className={cn(v.agencySubtitle, subColor)}>{subheadline}</p> : null}
                <a
                  href={ctaHref}
                  {...linkExtra}
                  onClick={(e) => scrollToHashAnchor(e, ctaHref)}
                  className={cn("mt-8", ctaBase, v.cta)}
                  style={{ backgroundColor: "var(--brand-primary, #a78bfa)" }}
                >
                  {ctaLabel}
                </a>
                {(imageUrl || onPickImage) && (
                  <div className="mt-8 lg:mt-10">
                    <OptionalSectionImage
                      imageUrl={imageUrl}
                      imageAlt={imageAlt}
                      imageCredit={imageCredit}
                      onPickImage={onPickImage}
                      align={imageAlign}
                      minHeightClass="min-h-[140px]"
                    />
                  </div>
                )}
              </div>
              {hasSpotlight ? (
                <div className="lg:col-span-5">
                  <div className={cardShell} style={hasBackdrop ? undefined : { background: "var(--fs-card)" }}>
                    {spotlightLabel ? (
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                        {spotlightLabel}
                      </p>
                    ) : null}
                    <h2 className={cn("mt-2 text-xl font-bold leading-snug", cardHeading)}>{spotlightTitle}</h2>
                    {spotlightPrice ? (
                      <p className={cn("mt-3 text-2xl font-semibold tabular-nums", cardPrice)}>{spotlightPrice}</p>
                    ) : null}
                    {spotlightLocation ? <p className={cn("mt-2 text-sm", cardMuted)}>{spotlightLocation}</p> : null}
                    {spotlightBeds || spotlightBaths || spotlightCars ? (
                      <dl className={cn("mt-6 flex flex-wrap justify-center gap-x-10 gap-y-2 border-t pt-4 text-sm lg:justify-start", cardBorder)}>
                        {stat("Beds", spotlightBeds)}
                        {stat("Baths", spotlightBaths)}
                        {stat("Car", spotlightCars)}
                      </dl>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            {tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap justify-center gap-2 lg:justify-start">
                {tags.map((tag) => (
                  <span key={tag} className={tagClass}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionShell}>
      {backdropBlock}
      <div className={cn("relative z-10 px-6", innerPad)}>
        <div className={v.innerDefault}>
          <h1 className={cn("whitespace-pre-line", v.title, titleColor)}>{headline}</h1>
          {subheadline ? <p className={cn(v.subtitle, subColor)}>{subheadline}</p> : null}
          <a
            href={ctaHref}
            {...linkExtra}
            onClick={(e) => scrollToHashAnchor(e, ctaHref)}
            className={cn("mt-8", ctaBase, v.cta)}
            style={{ backgroundColor: "var(--brand-primary, #a78bfa)" }}
          >
            {ctaLabel}
          </a>
          {(imageUrl || onPickImage) && (
            <div className="mt-10">
              <OptionalSectionImage
                imageUrl={imageUrl}
                imageAlt={imageAlt}
                imageCredit={imageCredit}
                onPickImage={onPickImage}
                align={imageAlign}
                minHeightClass="min-h-[140px]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
