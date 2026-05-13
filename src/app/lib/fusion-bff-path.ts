import { getFusionSubscriberId } from "./fusion-env";

const NUM = /^\d+$/;

/**
 * Maps `/api/fusion/...` segments to upstream path under `/api/fusion/` (no leading slash).
 * Returns null if the path is not allowed (SSRF-safe whitelist).
 */
export function mapFusionBffSegmentsToUpstreamPath(segments: string[]): string | null {
  if (segments.length === 0) return null;

  for (const s of segments) {
    if (!/^[a-zA-Z0-9_-]+$/.test(s)) return null;
  }

  const [a, b] = segments;

  if (segments.length === 1) {
    if (a === "states" || a === "projecttypes" || a === "suburbs" || a === "statuses") return a;
    if (a === "projects" || a === "lots" || a === "airtables") return a;
    return null;
  }

  if (segments.length === 2) {
    if (a === "projects" && b === "allPropertyCount") return "projects/allPropertyCount";
    if (a === "projects" && b === "propertiesMinMaxPrice") return "projects/propertiesMinMaxPrice";
    if (a === "projects" && NUM.test(b)) return `projects/${b}`;
    if (a === "lots" && NUM.test(b)) return `lots/${b}`;
  }

  return null;
}

/**
 * For member-scoped list endpoints, default `subscriber` from env when missing.
 */
export function applyDefaultSubscriberSearchParams(
  upstreamPath: string,
  incoming: URLSearchParams,
): URLSearchParams {
  const sp = new URLSearchParams(incoming.toString());
  const needsDefault =
    upstreamPath === "projects" ||
    upstreamPath === "lots" ||
    upstreamPath === "airtables" ||
    upstreamPath.startsWith("projects/") && NUM.test(upstreamPath.slice("projects/".length));

  if (needsDefault && !sp.has("subscriber")) {
    sp.set("subscriber", getFusionSubscriberId());
  }
  return sp;
}
