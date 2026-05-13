import type { FusionProperty } from "./fusion-property";
import { normalizeYieldToPercentPoints, parseYieldStringToPercentPoints } from "./property-yield-sort";

function readString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v === undefined || v === null) continue;
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatAudPrice(raw: string): string {
  const n = Number.parseFloat(raw.replace(/,/g, ""));
  if (Number.isNaN(n)) return raw;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Fusion projects: prefer `min_price`, else `avg_price`, as AUD. */
function formatPriceFusion(r: Record<string, unknown>): string {
  const min = readString(r, ["min_price"]).trim();
  const avg = readString(r, ["avg_price"]).trim();
  if (min) return formatAudPrice(min);
  if (avg) return formatAudPrice(avg);
  return "—";
}

/** Best-effort long text from common Fusion / CMS field names. */
function readLongestDescription(r: Record<string, unknown>): string {
  const keys = [
    "description",
    "summary",
    "excerpt",
    "overview",
    "details",
    "long_description",
    "marketing_copy",
    "marketing_description",
    "project_description",
    "body",
    "blurb",
    "intro",
    "subtitle",
  ];
  let best = "";
  for (const k of keys) {
    const v = readString(r, [k]).trim();
    if (v.length > best.length) best = v;
  }
  return best;
}

/** Ordered gallery URLs from Fusion (deduped). */
function collectImageUrlsFusion(r: Record<string, unknown>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (raw: string) => {
    const t = raw.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  };
  const direct = readString(r, ["first_image_url"]).trim();
  if (direct) add(direct);
  const urls = r.image_urls;
  if (Array.isArray(urls)) {
    for (const u of urls) {
      if (typeof u === "string") add(u);
    }
  }
  return out;
}

function readOptionalMetric(r: Record<string, unknown>, keys: string[]): string | undefined {
  const v = readString(r, keys).trim();
  return v || undefined;
}

/** `full_address`, else `suburb` + `state`. */
function locationFusion(r: Record<string, unknown>): string {
  const full = readString(r, ["full_address"]).trim().replace(/\s+/g, " ");
  if (full) return full;
  const suburb = readString(r, ["suburb"]).trim();
  const state = readString(r, ["state"]).trim();
  const joined = [suburb, state].filter(Boolean).join(", ");
  return joined || "—";
}

/** Numeric / string keys Fusion (and similar feeds) may use for gross or rental yield. */
const YIELD_NUMERIC_KEYS = [
  "avg_rent_yield",
  "gross_yield",
  "rent_yield",
  "yield_percentage",
  "gross_return_yield",
  "gross_rental_yield",
  "rental_yield",
  "rental_return",
  "investment_yield",
  "net_yield",
  "yield_percent",
  "project_yield",
  "rent_yield_percent",
  "expected_rent_yield",
  "estimated_yield",
  "rental_yield_display",
  "yield_display",
  "rent_yield_display",
  "gross_yield_display",
  "marketing_yield",
];

function readRentYieldPercent(r: Record<string, unknown>): number | undefined {
  for (const k of YIELD_NUMERIC_KEYS) {
    const v = r[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      const n = normalizeYieldToPercentPoints(v);
      if (n !== undefined && n > 0) return n;
    }
  }
  for (const k of YIELD_NUMERIC_KEYS) {
    const raw = readString(r, [k]).trim();
    if (!raw) continue;
    const n = parseYieldStringToPercentPoints(raw);
    if (n !== undefined && n > 0) return n;
  }
  return undefined;
}

function formatAvgRentYield(r: Record<string, unknown>): string {
  const pct = readRentYieldPercent(r);
  if (pct !== undefined) {
    const rounded = Number.isInteger(pct) ? String(pct) : pct.toFixed(2).replace(/\.?0+$/, "");
    return `${rounded}% p.a.`;
  }
  const y = readString(
    r,
    [
      ...YIELD_NUMERIC_KEYS,
      "yield",
      "rental_yield_label",
      "yield_label",
      "rent_yield_label",
    ],
  ).trim();
  if (!y) return "—";
  if (y.includes("%")) return y;
  return `${y}% p.a.`;
}

export function extractListingRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const key of ["data", "properties", "projects", "results", "listings", "items", "records"]) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

/** Collects strings Fusion may use for dwelling / product type (not only `pt_title`). */
function collectTypeSearchFragments(r: Record<string, unknown>): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t) out.push(t);
  };

  const scalarKeys = [
    "pt_title",
    "pt_name",
    "pt_slug",
    "property_type",
    "property_type_name",
    "property_type_label",
    "house_type",
    "dwelling_type",
    "development_type",
    "product_type",
    "project_type",
    "category",
    "categories_label",
    "subtype",
    "sub_type",
    "listing_type",
    "investment_type",
    "package_type",
    "build_type",
    "stock_type",
    "project_name",
    "categories",
    "project_category",
    "dwelling_category",
    "ptype",
    "p_type",
  ];
  for (const k of scalarKeys) {
    push(readString(r, [k]));
  }

  const slugParts = readString(r, ["slug", "url_slug", "permalink_slug"]).trim();
  if (slugParts) push(slugParts.replace(/[-_]+/g, " "));

  const maybeArrays = [r.tags, r.labels, r.features, r.property_types, r.types, r.categories] as unknown[];
  for (const arr of maybeArrays) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (typeof item === "string") push(item);
      else if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        push(readString(o, ["name", "title", "label", "slug"]));
      }
    }
  }

  const nested = r.property_type;
  if (nested && typeof nested === "object") {
    const o = nested as Record<string, unknown>;
    push(readString(o, ["name", "title", "label", "pt_title", "slug"]));
  }

  const extraScalars = [
    "dwelling_style",
    "product_name",
    "stock_name",
    "development_name",
    "building_type",
    "construction_type",
    "style",
    "model",
    "tier",
  ];
  for (const k of extraScalars) {
    push(readString(r, [k]));
  }

  return out;
}

function typeSearchTextFromRow(r: Record<string, unknown>, displayType: string): string | undefined {
  const fragments = collectTypeSearchFragments(r);
  const seen = new Set<string>();
  const dedup: string[] = [];
  for (const f of fragments) {
    const key = f.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(f);
  }
  if (displayType && displayType !== "—") {
    const k = displayType.toLowerCase();
    if (!seen.has(k)) dedup.unshift(displayType);
  }
  const joined = dedup.join(" | ");
  return joined.trim() || undefined;
}

const DEEP_KEY_SKIP =
  /password|token|secret|api_key|authorization|bearer|base64|email|phone|mobile|latitude|longitude|first_image_url|image_urls|image_url$/i;

function collectDeepSearchStrings(
  val: unknown,
  depth: number,
  out: Set<string>,
  maxDepth: number,
  maxStrings: number,
): void {
  if (out.size >= maxStrings || depth > maxDepth) return;
  if (typeof val === "string") {
    const t = val.trim();
    if (t.length >= 2 && t.length <= 280) out.add(t);
    return;
  }
  if (typeof val === "number" && Number.isFinite(val)) {
    const t = String(val);
    if (t.length <= 16) out.add(t);
    return;
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      collectDeepSearchStrings(item, depth + 1, out, maxDepth, maxStrings);
      if (out.size >= maxStrings) return;
    }
    return;
  }
  if (val && typeof val === "object") {
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (DEEP_KEY_SKIP.test(k)) continue;
      collectDeepSearchStrings(v, depth + 1, out, maxDepth, maxStrings);
      if (out.size >= maxStrings) return;
    }
  }
}

/** Shallow known fields + recursive short strings (nested CRM objects) for type filters and search. */
function buildTypeSearchText(r: Record<string, unknown>, displayType: string): string | undefined {
  const shallow = typeSearchTextFromRow(r, displayType);
  const deep = new Set<string>();
  collectDeepSearchStrings(r, 0, deep, 6, 100);
  const ordered: string[] = [];
  const seen = new Set<string>();
  if (shallow) {
    for (const part of shallow.split(" | ")) {
      const k = part.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        ordered.push(part);
      }
    }
  }
  for (const d of deep) {
    const k = d.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    ordered.push(d);
  }
  const joined = ordered.join(" | ");
  return joined.trim().slice(0, 12000) || undefined;
}

export function mapRowToFusionProperty(row: unknown, index: number): FusionProperty | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;

  const titleRaw = readString(r, ["title"]).trim();
  const title = titleRaw || `Listing ${index + 1}`;

  const urlSlugOnly = readString(r, ["slug", "url_slug", "permalink_slug"]).trim();
  const fusionId = readString(r, ["id", "project_id", "listing_id", "uuid"]).trim();

  let slug = urlSlugOnly || fusionId;
  if (!slug) slug = slugify(title);
  if (!slug) slug = `property-${index + 1}`;

  const location = locationFusion(r);
  const price = formatPriceFusion(r);
  const yieldVal = formatAvgRentYield(r);
  const typeRaw = readString(r, ["pt_title"]).trim();
  const type = typeRaw || "—";

  const description = readLongestDescription(r);

  const imageUrls = collectImageUrlsFusion(r);

  const id = fusionId || `${slug}-${index}`;

  const out: FusionProperty = {
    id,
    slug,
    title,
    location,
    price,
    yield: yieldVal,
    type,
    description,
  };
  const rentYieldNum = readRentYieldPercent(r);
  if (rentYieldNum !== undefined) out.rentYieldPercent = rentYieldNum;
  const typeHints = buildTypeSearchText(r, type);
  if (typeHints) out.typeSearchText = typeHints;
  if (fusionId) out.projectId = fusionId;
  if (imageUrls.length) {
    out.imageUrls = imageUrls;
    out.image = imageUrls[0];
  }

  const beds = readOptionalMetric(r, ["bedrooms", "beds", "bed"]);
  const baths = readOptionalMetric(r, ["bathrooms", "baths", "bath"]);
  const garage = readOptionalMetric(r, ["garage", "car_spaces", "parking", "cars"]);
  if (beds) out.bedrooms = beds;
  if (baths) out.bathrooms = baths;
  if (garage) out.garage = garage;

  return out;
}

export function mapFusionPayloadToProperties(payload: unknown): FusionProperty[] {
  const rows = extractListingRows(payload);
  const out: FusionProperty[] = [];
  for (let i = 0; i < rows.length; i++) {
    const mapped = mapRowToFusionProperty(rows[i], i);
    if (mapped) out.push(mapped);
  }
  return out;
}
