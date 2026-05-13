import type { FusionProperty } from "./fusion-property";

export const MANUAL_LISTINGS_MAX = 80;

/** Loose shape accepted from JSON upload / `data/manual-listings.json`. */
export type ManualListingInput = Partial<FusionProperty> & {
  title?: string;
};

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "listing";
}

function safeString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

/**
 * Normalises one row from JSON into {@link FusionProperty}.
 * Use for builder uploads and `data/manual-listings.json`.
 */
export function normalizeManualListingRow(raw: unknown, index: number): FusionProperty | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const title = safeString(o.title, "");
  if (!title) return null;

  const slugRaw = safeString(o.slug, "");
  const slug = slugRaw || slugify(title);
  const idRaw = safeString(o.id, "");
  const id = idRaw || `manual-${slug}-${index}`;

  const image = typeof o.image === "string" && o.image.trim() ? o.image.trim() : undefined;
  let imageUrls: string[] | undefined;
  if (Array.isArray(o.imageUrls)) {
    imageUrls = o.imageUrls
      .filter((u): u is string => typeof u === "string")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (imageUrls.length === 0) imageUrls = undefined;
  }

  let rentYieldPercent: number | undefined;
  const y = o.rentYieldPercent ?? o.avg_rent_yield;
  if (typeof y === "number" && Number.isFinite(y)) rentYieldPercent = y;
  else if (typeof y === "string") {
    const n = parseFloat(y.replace(/%/g, "").trim());
    if (Number.isFinite(n)) rentYieldPercent = n;
  }

  return {
    id,
    slug,
    projectId: typeof o.projectId === "string" && o.projectId.trim() ? o.projectId.trim() : `manual-${slug}`,
    title,
    location: safeString(o.location, "—"),
    price: safeString(o.price, "—"),
    yield: safeString(o.yield, safeString(o.avg_rent_yield as string, "—")),
    type: safeString(o.type, "Residential"),
    typeSearchText: typeof o.typeSearchText === "string" ? o.typeSearchText : undefined,
    description: safeString(o.description, ""),
    image: image ?? imageUrls?.[0],
    imageUrls,
    bedrooms: typeof o.bedrooms === "string" ? o.bedrooms : o.bedrooms != null ? String(o.bedrooms) : undefined,
    bathrooms: typeof o.bathrooms === "string" ? o.bathrooms : o.bathrooms != null ? String(o.bathrooms) : undefined,
    garage: typeof o.garage === "string" ? o.garage : o.garage != null ? String(o.garage) : undefined,
    rentYieldPercent,
  };
}

export function normalizeManualListingsFromUnknown(data: unknown): FusionProperty[] {
  if (!Array.isArray(data)) return [];
  const out: FusionProperty[] = [];
  for (let i = 0; i < data.length && out.length < MANUAL_LISTINGS_MAX; i++) {
    const row = normalizeManualListingRow(data[i], i);
    if (row) out.push(row);
  }
  return out;
}

export type ManualListingMode = "off" | "replace" | "prepend";

export function coerceManualListingMode(v: unknown): ManualListingMode {
  return v === "replace" || v === "prepend" ? v : "off";
}
