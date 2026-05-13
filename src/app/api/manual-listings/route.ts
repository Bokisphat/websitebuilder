import fs from "fs";
import path from "path";
import { normalizeManualListingsFromUnknown } from "@/app/lib/manual-listings";
import type { FusionProperty } from "@/app/lib/fusion-property";

const REL_PATH = ["data", "manual-listings.json"];

function canWrite(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.MANUAL_LISTINGS_ALLOW_WRITE === "true" ||
    process.env.MANUAL_LISTINGS_ALLOW_WRITE === "1"
  );
}

function readExisting(): FusionProperty[] {
  try {
    const p = path.join(process.cwd(), ...REL_PATH);
    if (!fs.existsSync(p)) return [];
    return normalizeManualListingsFromUnknown(JSON.parse(fs.readFileSync(p, "utf8")));
  } catch {
    return [];
  }
}

function mergeBySlug(existing: FusionProperty[], incoming: FusionProperty[]): FusionProperty[] {
  const map = new Map<string, FusionProperty>();
  for (const e of existing) map.set(e.slug, e);
  for (const row of incoming) map.set(row.slug, row);
  return Array.from(map.values());
}

/**
 * POST `{ "listings": [...], "replaceAll"?: boolean }`
 * Writes `data/manual-listings.json` so `/property/[slug]` can resolve uploaded stock.
 */
export async function POST(request: Request) {
  if (!canWrite()) {
    return Response.json(
      {
        success: false,
        error:
          "Writing manual listings is only allowed in development, or when MANUAL_LISTINGS_ALLOW_WRITE=true in production.",
      },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const o = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  const incoming = normalizeManualListingsFromUnknown(o?.listings);
  if (incoming.length === 0) {
    return Response.json({ success: false, error: "No valid listings in body.listings" }, { status: 400 });
  }

  const replaceAll = o?.replaceAll === true;
  const next = replaceAll ? incoming : mergeBySlug(readExisting(), incoming);

  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(process.cwd(), ...REL_PATH);
  fs.writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return Response.json({ success: true, count: next.length, path: "data/manual-listings.json" });
}
