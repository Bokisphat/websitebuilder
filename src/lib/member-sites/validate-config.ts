import type { SiteConfig } from "@/lib/site-model";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Minimal structural check so arbitrary JSON cannot be stored as a “site”. */
export function parseSiteConfigBody(v: unknown): SiteConfig | null {
  if (!isRecord(v)) return null;
  if (typeof v.id !== "string" || typeof v.name !== "string") return null;
  if (!isRecord(v.branding)) return null;
  if (typeof v.branding.siteName !== "string") return null;
  if (!Array.isArray(v.pages)) return null;
  if (v.publishStatus !== undefined && v.publishStatus !== "draft" && v.publishStatus !== "published") {
    return null;
  }
  return v as SiteConfig;
}
