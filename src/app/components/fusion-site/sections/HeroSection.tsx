"use client";

import type { HeroSectionConfig } from "@/app/lib/section-config";
import type { SiteConfig } from "@/app/lib/site-config";
import { BrandedLinkButton } from "../BrandedButton";

function resolveHref(href: string, branding: SiteConfig): string {
  if (href === "tel:") {
    return `tel:${branding.phone.replace(/\s/g, "")}`;
  }
  return href;
}

export function HeroSection({
  section,
  branding,
}: {
  section: HeroSectionConfig;
  branding: SiteConfig;
}) {
  return (
    <section className="border-b border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="whitespace-pre-line text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {section.headline}
        </h1>
        {section.subheadline ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">{section.subheadline}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <BrandedLinkButton href={resolveHref(section.ctaHref, branding)} variant="primary">
            {section.ctaLabel}
          </BrandedLinkButton>
          {section.secondaryCtaLabel && section.secondaryCtaHref ? (
            <BrandedLinkButton href={resolveHref(section.secondaryCtaHref, branding)} variant="ghost">
              {section.secondaryCtaLabel}
            </BrandedLinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
