"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandedShell } from "@/app/components/fusion-site/BrandedShell";
import { useSiteRegistry } from "@/app/components/fusion-site/site-registry-context";
import type { SitePageId } from "@/app/lib/section-config";

function activePageFromPath(pathname: string, siteId: string): SitePageId {
  const base = `/site/${siteId}`;
  if (pathname === base || pathname === `${base}/`) return "home";
  if (pathname.startsWith(`${base}/listings`)) return "listings";
  if (pathname.startsWith(`${base}/about`)) return "about";
  if (pathname.startsWith(`${base}/contact`)) return "contact";
  return "home";
}

export function SiteMemberLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const siteId = params.siteId as string;
  const { getSite, hydrated } = useSiteRegistry();
  const site = getSite(siteId);
  const active = activePageFromPath(pathname, siteId);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading site…
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Site not found</h1>
        <p className="max-w-md text-zinc-400">
          This preview URL is not in your browser yet. Generate a site from the builder — demo sites are stored locally
          in your browser.
        </p>
        <Link
          href="/builder"
          className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition"
        >
          Open builder
        </Link>
      </div>
    );
  }

  return (
    <BrandedShell site={site} active={active}>
      {children}
    </BrandedShell>
  );
}
