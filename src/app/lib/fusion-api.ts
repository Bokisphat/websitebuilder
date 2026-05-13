import { headers } from "next/headers";

export type { FusionProperty } from "./fusion-property";
import type { FusionProperty } from "./fusion-property";
import { loadManualListingsFromDataFile } from "./load-manual-listings-file";
import { propertiesFromApiJson } from "./parse-properties-response";

async function getInternalApiPropertiesUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}/api/properties`;

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (base) return `${base}/api/properties`;

  return "http://localhost:3000/api/properties";
}

export async function getFeaturedProperties(): Promise<FusionProperty[]> {
  const url = await getInternalApiPropertiesUrl();
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("[fusion-api] /api/properties failed:", res.status);
    return [];
  }

  const data: unknown = await res.json();
  return propertiesFromApiJson(data);
}

export async function getPropertyBySlug(slug: string): Promise<FusionProperty | null> {
  const properties = await getFeaturedProperties();
  const manualFile = loadManualListingsFromDataFile();
  let segment = slug;
  try {
    segment = decodeURIComponent(slug);
  } catch {
    /* use raw */
  }
  const match = (list: FusionProperty[]) =>
    list.find((p) => p.slug === slug || p.slug === segment) ||
    list.find((p) => p.projectId === slug || p.projectId === segment) ||
    null;
  return match(properties) || match(manualFile);
}
