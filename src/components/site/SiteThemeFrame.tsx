"use client";

import type { CSSProperties, ReactNode } from "react";
import type { SiteConfig, SiteColorScheme } from "@/lib/site-model";
import { withBrandingDefaults, withSiteConfigDefaults } from "@/lib/site-model";

const SCHEME_CLASS: Record<SiteColorScheme, string> = {
  dark: "fusion-site--dark",
  light: "fusion-site--light",
  midnight: "fusion-site--midnight",
  charcoal: "fusion-site--charcoal",
  warm: "fusion-site--warm",
  contrast: "fusion-site--contrast",
  cool: "fusion-site--cool",
  sage: "fusion-site--sage",
};

const CONTENT_MAX: Record<"narrow" | "default" | "wide", string> = {
  narrow: "56rem",
  default: "72rem",
  wide: "min(80rem, 100% - 2rem)",
};

type SiteThemeFrameProps = {
  site: SiteConfig;
  children: ReactNode;
  className?: string;
};

/**
 * Applies color scheme + content width to member-site and builder previews.
 * All section components use CSS variables (see globals.css .fusion-site).
 */
export function SiteThemeFrame({ site, children, className = "" }: SiteThemeFrameProps) {
  const b = withBrandingDefaults(site.branding);
  const themeClass = SCHEME_CLASS[b.colorScheme] ?? "fusion-site--dark";
  const layoutId = withSiteConfigDefaults(site).templateId;
  return (
    <div
      className={`fusion-site w-full min-w-0 min-h-0 ${themeClass} ${className}`}
      data-color-scheme={b.colorScheme}
      data-fusion-template={layoutId}
      style={
        {
          ["--brand-primary" as string]: b.primaryColor,
          ["--brand-secondary" as string]: b.secondaryColor,
          ["--fs-content-max" as string]: CONTENT_MAX[b.contentWidth],
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
