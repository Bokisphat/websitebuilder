import type { SitePreviewNavItem } from "@/components/site/SitePreviewHeaderRow";

/** When set on branding, a "Referral Partners" item is appended to the preview header nav. */
export function appendReferralPartnersNavItem(
  items: SitePreviewNavItem[],
  referralPartnersUrl: string | undefined,
): SitePreviewNavItem[] {
  const trimmed = referralPartnersUrl?.trim();
  if (!trimmed) return items;
  return [
    ...items,
    {
      id: "referral-partners",
      label: "Referral Partners",
      href: trimmed,
      active: false,
    },
  ];
}
