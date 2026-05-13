"use client";

import type { ReactNode } from "react";
import { RenderSection } from "@/components/sections/render-section";
import type { PageConfig, SiteLayoutId } from "@/lib/site-model";
import { PageLinkedVideo } from "./PageLinkedVideo";

export function SitePageSections({
  page,
  bookingUrl,
  onPickStockImage,
  fusionTemplate = "custom",
}: {
  page: PageConfig;
  bookingUrl?: string;
  onPickStockImage?: (sectionId: string) => void;
  fusionTemplate?: SiteLayoutId;
}) {
  const url = page.linkedVideoUrl?.trim();
  const label = page.linkedVideoLabel?.trim();
  const firstHeroIdx = page.sections.findIndex((s) => s.type === "hero");
  const insertAt = firstHeroIdx >= 0 ? firstHeroIdx + 1 : 0;

  const children: ReactNode[] = [];
  let inserted = false;

  for (let i = 0; i < page.sections.length; i++) {
    if (url && !inserted && i === insertAt) {
      children.push(<PageLinkedVideo key="_fusionPageVideo" url={url} label={label} />);
      inserted = true;
    }
    const s = page.sections[i];
    children.push(
      <RenderSection
        key={s.id}
        section={s}
        bookingUrl={bookingUrl}
        fusionTemplate={fusionTemplate}
        onPickStockImage={onPickStockImage}
      />,
    );
  }

  if (url && !inserted) {
    children.push(<PageLinkedVideo key="_fusionPageVideo" url={url} label={label} />);
  }

  return <>{children}</>;
}
