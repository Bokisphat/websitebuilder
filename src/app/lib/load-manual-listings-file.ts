import fs from "fs";
import path from "path";
import type { FusionProperty } from "./fusion-property";
import { normalizeManualListingsFromUnknown } from "./manual-listings";

const FILE = "manual-listings.json";

/**
 * Optional repo file `data/manual-listings.json` — merged into `/api/properties` resolution
 * and {@link getPropertyBySlug} so uploaded stock can open `/property/[slug]`.
 */
export function loadManualListingsFromDataFile(): FusionProperty[] {
  try {
    const p = path.join(process.cwd(), "data", FILE);
    if (!fs.existsSync(p)) return [];
    const raw = JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
    return normalizeManualListingsFromUnknown(raw);
  } catch {
    return [];
  }
}
