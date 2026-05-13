import { readTopYieldPicksFile } from "../../../lib/top-yield-picks-cache";

/** Public read of precomputed top-yield strip (instant once `data/top-yield-picks.json` exists). */
export async function GET() {
  const file = await readTopYieldPicksFile();
  if (!file || file.picks.length === 0) {
    return Response.json(
      {
        success: false,
        error: "No cached top-yield picks yet. POST /api/properties/top-yield/refresh to rebuild.",
        data: [],
        cache: null,
      },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data: file.picks,
    cache: {
      updatedAt: file.updatedAt,
      capPages: file.capPages,
      pagesFetched: file.pagesFetched,
      totalProjectsConsidered: file.totalProjectsConsidered,
      minRentYieldPercent: file.minRentYieldPercent,
      pickCount: file.pickCount,
    },
  });
}
