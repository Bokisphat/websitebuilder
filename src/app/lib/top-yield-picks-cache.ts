import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { FusionProperty } from "./fusion-property";
import { mapFusionPayloadToProperties } from "./map-fusion-properties";
import {
  numericRentYieldForSort,
  sortPropertiesByRentYieldDesc,
} from "./property-yield-sort";

export const DEFAULT_TOP_YIELD_PICKS_COUNT = 6;

export type TopYieldPicksFile = {
  updatedAt: string;
  capPages: number;
  pagesFetched: number;
  totalProjectsConsidered: number;
  minRentYieldPercent: number | null;
  pickCount: number;
  picks: FusionProperty[];
};

export function getTopYieldPicksFilePath(): string {
  return path.join(process.cwd(), "data", "top-yield-picks.json");
}

export async function readTopYieldPicksFile(): Promise<TopYieldPicksFile | null> {
  try {
    const raw = await readFile(getTopYieldPicksFilePath(), "utf8");
    const parsed = JSON.parse(raw) as TopYieldPicksFile;
    if (!parsed || !Array.isArray(parsed.picks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeTopYieldPicksFile(payload: TopYieldPicksFile): Promise<void> {
  const dir = path.dirname(getTopYieldPicksFilePath());
  await mkdir(dir, { recursive: true });
  await writeFile(getTopYieldPicksFilePath(), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function buildTopYieldPicksFromMergedRows(
  mergedRows: unknown[],
  opts: {
    pickCount: number;
    minRentYieldPercent: number | null;
    capPages: number;
    pagesFetched: number;
  },
): TopYieldPicksFile {
  const mapped = mapFusionPayloadToProperties(mergedRows);
  const sorted = sortPropertiesByRentYieldDesc(mapped);
  const neg = Number.NEGATIVE_INFINITY;

  let pool = sorted;
  if (opts.minRentYieldPercent != null && Number.isFinite(opts.minRentYieldPercent)) {
    const floor = opts.minRentYieldPercent;
    pool = sorted.filter((p) => {
      const y = numericRentYieldForSort(p);
      return y !== neg && y >= floor;
    });
  }

  const picks = pool.slice(0, Math.max(1, opts.pickCount));

  return {
    updatedAt: new Date().toISOString(),
    capPages: opts.capPages,
    pagesFetched: opts.pagesFetched,
    totalProjectsConsidered: mapped.length,
    minRentYieldPercent: opts.minRentYieldPercent,
    pickCount: opts.pickCount,
    picks,
  };
}
