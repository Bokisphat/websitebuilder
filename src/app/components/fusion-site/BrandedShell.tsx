"use client";

import Link from "next/link";
import type { FusionSite } from "@/app/lib/fusion-site-model";
import type { SitePageId } from "@/app/lib/section-config";
import type { SiteConfig } from "@/app/lib/site-config";

function brandingVars(b: SiteConfig): React.CSSProperties {
  return {
    ["--site-primary" as string]: b.primaryColor,
    ["--site-secondary" as string]: b.secondaryColor,
    ["--site-muted" as string]: b.secondaryColor,
  };
}

export function BrandedShell({
  site,
  active,
  children,
}: {
  site: FusionSite;
  active: SitePageId;
  children: React.ReactNode;
}) {
  const { branding } = site;
  const base = `/site/${site.id}`;

  const nav = [
    { id: "home" as const, href: base, label: "Home" },
    { id: "listings" as const, href: `${base}/listings`, label: "Listings" },
    { id: "about" as const, href: `${base}/about`, label: "About" },
    { id: "contact" as const, href: `${base}/contact`, label: "Contact" },
  ];

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={brandingVars(branding)}
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href={base} className="flex items-center gap-3">
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoUrl}
                alt={branding.siteName}
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span
                className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-zinc-950"
                style={{ backgroundColor: "var(--site-primary)" }}
              >
                {branding.siteName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-lg font-semibold tracking-tight" style={{ color: "var(--site-primary)" }}>
                {branding.siteName}
              </p>
              <p className="max-w-xs truncate text-xs text-zinc-500">{branding.tagline}</p>
            </div>
          </Link>

          <nav className="flex flex-wrap gap-1 sm:gap-2">
            {nav.map((item) => {
              const isOn = active === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isOn ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                  style={isOn ? { color: "var(--site-secondary)" } : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} {branding.siteName}</p>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <a href={`tel:${branding.phone.replace(/\s/g, "")}`} className="hover:text-white transition">
              {branding.phone}
            </a>
            <a href={`mailto:${branding.email}`} className="hover:text-white transition">
              {branding.email}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
