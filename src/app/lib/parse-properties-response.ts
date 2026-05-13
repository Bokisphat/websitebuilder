import type { FusionProperty } from "./fusion-property";
import { mapFusionPayloadToProperties } from "./map-fusion-properties";

/** Parses `/api/properties` JSON (`{ success, data }` or legacy array). */
export function propertiesFromApiJson(json: unknown): FusionProperty[] {
  if (json && typeof json === "object" && "success" in json) {
    const o = json as { success?: boolean; data?: unknown };
    if (o.success === true && o.data !== undefined) {
      return mapFusionPayloadToProperties(o.data);
    }
    return [];
  }
  if (Array.isArray(json)) return mapFusionPayloadToProperties(json);
  return [];
}
