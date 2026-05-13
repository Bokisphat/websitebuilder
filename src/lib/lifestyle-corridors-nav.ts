import type { SitePreviewNavItem } from "@/components/site/SitePreviewHeaderRow";

function previewHref(pageId: string, hash?: string): string {
  const h = hash ? `#${hash}` : "";
  return pageId === "home" ? `/builder/preview${h}` : `/builder/preview?page=${encodeURIComponent(pageId)}${h}`;
}

/** Primary nav for Real Estate Theme 1–3 (`lifestyleCorridors`, `realEstateTheme2`, `realEstateTheme3`): one row, consumer + site pages. */
export function buildLifestyleCorridorsNavItems(
  currentPageId: string,
  mode: "fullPage" | "embedded",
  embeddedGo?: (pageId: string) => void,
): SitePreviewNavItem[] {
  const rows: Array<{
    label: string;
    targetPage: string;
    hash?: string;
    active: boolean;
  }> = [
    { label: "Home", targetPage: "home", active: currentPageId === "home" },
    { label: "Buy", targetPage: "listings", active: currentPageId === "listings" },
    { label: "Rent", targetPage: "contact", hash: "enquiry", active: false },
    { label: "Sell", targetPage: "contact", hash: "enquiry", active: false },
    { label: "New Listings", targetPage: "listings", active: currentPageId === "listings" },
    { label: "About", targetPage: "about", active: currentPageId === "about" },
    { label: "Contact", targetPage: "contact", active: currentPageId === "contact" },
  ];

  return rows.map((r, i) => {
    const href = previewHref(r.targetPage, r.hash);
    const id = `lifestyle-nav-${r.label.toLowerCase().replace(/\s+/g, "-")}-${i}`;
    if (mode === "fullPage") {
      return { id, label: r.label, href, active: r.active };
    }
    return {
      id,
      label: r.label,
      href,
      active: r.active,
      onActivate: () => embeddedGo?.(r.targetPage),
    };
  });
}
