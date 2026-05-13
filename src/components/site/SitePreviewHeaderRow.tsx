"use client";

import Link from "next/link";
import { normalizeLogoSizePercent, type BrandingConfig } from "@/lib/site-model";

export type SitePreviewNavItem = {
  id: string;
  label: string;
  href: string;
  active: boolean;
  /** Builder canvas: switch page in-place without navigating to `/builder/preview`. */
  onActivate?: () => void;
};

/**
 * Brand bar used in builder preview and full-page preview: logo or lettermark + optional site title + publish badge.
 * Optional nav matches member-site chrome (multi-page preview).
 */
export function SitePreviewHeaderRow({
  branding,
  publishStatus,
  siteDocumentName,
  navItems,
  navPresentation = "pills",
}: {
  branding: BrandingConfig;
  publishStatus: "draft" | "published";
  /** Builder-only: internal site record name next to the badge */
  siteDocumentName?: string;
  /** Links to builder preview pages (full-page) or in-place page switching (embedded) */
  navItems?: SitePreviewNavItem[];
  /** Real Estate Theme 1 uses a single-line, pipe-separated bar. */
  navPresentation?: "pills" | "inline-separated";
}) {
  const logo = branding.logo?.trim();
  const title = (branding.siteName ?? "").trim() || "Your site";
  const initial = title.slice(0, 1).toUpperCase() || "S";
  const pct = normalizeLogoSizePercent(branding.logoSizePercent);
  const boxPx = Math.round(32 * (pct / 100));
  const maxLogoW = Math.round(200 * (pct / 100));

  const pillCls = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
      on
        ? "border border-[var(--fs-border)] bg-[var(--fs-border-soft)] text-[var(--fs-heading)]"
        : "text-[var(--fs-muted)] hover:bg-[var(--fs-border-soft)] hover:text-[var(--fs-heading)]"
    }`;

  const inlineCls = (on: boolean) =>
    `shrink-0 rounded-md px-1 py-0.5 text-sm font-semibold transition ${
      on
        ? "text-[var(--fs-heading)]"
        : "text-[var(--fs-muted)] hover:text-[var(--fs-heading)]"
    }`;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={`${title} logo`}
            className="w-auto shrink-0 object-contain"
            style={{ height: boxPx, maxWidth: maxLogoW }}
          />
        ) : (
          <>
            <span
              className="grid shrink-0 place-items-center rounded-md font-bold text-white"
              style={{
                backgroundColor: branding.primaryColor,
                width: boxPx,
                height: boxPx,
                fontSize: Math.max(10, Math.round(12 * (pct / 100))),
              }}
            >
              {initial}
            </span>
            <span className="truncate text-sm font-semibold text-[var(--fs-heading)]">{title}</span>
          </>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-end">
        {navItems && navItems.length > 0 ? (
          <nav
            className={
              navPresentation === "inline-separated"
                ? "flex max-w-full flex-nowrap items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:mr-1 [&::-webkit-scrollbar]:hidden"
                : "flex flex-wrap gap-1 sm:mr-1"
            }
            aria-label="Site pages"
          >
            {navItems.map((item, i) => {
              const on = item.active;
              const style = on ? { color: "var(--brand-secondary, var(--fs-heading))" } : undefined;
              const cls = navPresentation === "inline-separated" ? inlineCls(on) : pillCls(on);

              const node =
                item.onActivate != null ? (
                  <button type="button" className={cls} style={style} onClick={item.onActivate}>
                    {item.label}
                  </button>
                ) : (
                  <Link href={item.href} className={cls} style={style}>
                    {item.label}
                  </Link>
                );

              if (navPresentation === "inline-separated") {
                return (
                  <span key={item.id} className="flex shrink-0 items-center">
                    {i > 0 ? (
                      <span className="select-none px-1.5 text-sm text-[var(--fs-muted)]" aria-hidden>
                        |
                      </span>
                    ) : null}
                    {node}
                  </span>
                );
              }

              return (
                <span key={item.id} className="inline-flex">
                  {node}
                </span>
              );
            })}
          </nav>
        ) : null}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              publishStatus === "published" ? "bg-emerald-500/25 text-emerald-200" : "bg-amber-500/20 text-amber-100"
            }`}
          >
            {publishStatus}
          </span>
          {siteDocumentName ? (
            <span className="hidden text-xs text-[var(--fs-subtle)] sm:inline">{siteDocumentName}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
