"use client";

import { useParams } from "next/navigation";
import { SiteSectionRenderer } from "@/app/components/fusion-site/SiteSectionRenderer";
import { useSiteRegistry } from "@/app/components/fusion-site/site-registry-context";
import type { SitePageId } from "@/app/lib/section-config";

export function SiteSections({ pageId }: { pageId: SitePageId }) {
  const params = useParams();
  const siteId = params.siteId as string;
  const { getSite, hydrated } = useSiteRegistry();
  const site = getSite(siteId);

  if (!hydrated || !site) {
    return null;
  }

  const sections = site.pages[pageId];

  return (
    <div>
      {sections.map((section, index) => (
        <SiteSectionRenderer key={`${section.kind}-${index}`} site={site} section={section} />
      ))}
    </div>
  );
}
