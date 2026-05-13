import type { FusionProperty } from "./fusion-property";

/**
 * Interpret API values as percentage points (e.g. 7.25 = 7.25%).
 * Fusion sometimes sends fractional form (0.0725 = 7.25%).
 */
export function normalizeYieldToPercentPoints(n: number): number | undefined {
  if (!Number.isFinite(n)) return undefined;
  if (n > 0 && n <= 1) return n * 100;
  return n;
}

export function parseYieldStringToPercentPoints(raw: string): number | undefined {
  if (!raw?.trim()) return undefined;
  const s = raw.replace(/,/g, ".").trim();
  /** `5.04%`, `5,04 %` — marketing copy like "Rental Yield 5.04%%" still matches first % number. */
  const pct = s.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) {
    const n = Number.parseFloat(pct[1]);
    if (!Number.isNaN(n)) return normalizeYieldToPercentPoints(n);
  }
  const noPct = s.replace(/%/g, "").replace(/p\.a\./gi, "").trim();
  const leadingNum = Number.parseFloat(noPct);
  if (!Number.isNaN(leadingNum)) return normalizeYieldToPercentPoints(leadingNum);
  /** "Rental Yield 5.04" (no %) — parseFloat on full string fails, take trailing number. */
  const tail = noPct.match(/(\d+(?:\.\d+)?)\s*$/);
  if (tail) {
    const n = Number.parseFloat(tail[1]);
    if (!Number.isNaN(n)) return normalizeYieldToPercentPoints(n);
  }
  return undefined;
}

const NEG = Number.NEGATIVE_INFINITY;

/** Numeric yield (% points) for filtering/sorting — missing or invalid sorts last. */
export function numericRentYieldForSort(p: FusionProperty): number {
  if (typeof p.rentYieldPercent === "number" && Number.isFinite(p.rentYieldPercent)) {
    return p.rentYieldPercent;
  }
  const s = p.yield?.replace(/%/g, "").replace(/,/g, ".").replace(/p\.a\./gi, "").trim();
  if (!s || s === "—") return NEG;
  return parseYieldStringToPercentPoints(s) ?? NEG;
}

export function sortPropertiesByRentYieldDesc(list: FusionProperty[]): FusionProperty[] {
  return [...list].sort((a, b) => numericRentYieldForSort(b) - numericRentYieldForSort(a));
}
