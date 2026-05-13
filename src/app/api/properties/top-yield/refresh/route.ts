import {
  mergeAllProjectPages,
} from "../../../../lib/fusion-full-catalog-merge";
import {
  FUSION_LISTINGS_PAGE_SIZE_MAX,
  getFusionListingsAggregateMaxPages,
  getFusionServerConfig,
  resolveFusionPropertiesListUrlPaginated,
} from "../../../../lib/fusion-env";
import {
  buildTopYieldPicksFromMergedRows,
  DEFAULT_TOP_YIELD_PICKS_COUNT,
  writeTopYieldPicksFile,
} from "../../../../lib/top-yield-picks-cache";

/**
 * Scans the full Fusion catalogue (batched), ranks by rent yield, writes `data/top-yield-picks.json`.
 * On serverless hosts without persistent disk, commit the generated file after running locally — or mount storage.
 */
export const maxDuration = 300;

function authorizeRefresh(request: Request): boolean {
  const secret = process.env.TOP_YIELD_REFRESH_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }
  const header = request.headers.get("x-top-yield-refresh-secret")?.trim();
  const url = new URL(request.url);
  const q = url.searchParams.get("secret")?.trim();
  return header === secret || q === secret;
}

type RefreshBody = {
  capPages?: number;
  pickCount?: number;
  minRentYieldPercent?: number | null;
};

export async function POST(request: Request) {
  if (!authorizeRefresh(request)) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: RefreshBody = {};
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = (await request.json()) as RefreshBody;
    }
  } catch {
    body = {};
  }

  const capPages = Math.min(
    500,
    Math.max(
      1,
      typeof body.capPages === "number" && Number.isFinite(body.capPages)
        ? Math.floor(body.capPages)
        : getFusionListingsAggregateMaxPages(),
    ),
  );

  const pickCount = Math.min(
    50,
    Math.max(
      1,
      typeof body.pickCount === "number" && Number.isFinite(body.pickCount)
        ? Math.floor(body.pickCount)
        : Number.parseInt(process.env.TOP_YIELD_PICKS_COUNT || "", 10) || DEFAULT_TOP_YIELD_PICKS_COUNT,
    ),
  );

  let minRentYieldPercent: number | null =
    typeof body.minRentYieldPercent === "number" && Number.isFinite(body.minRentYieldPercent)
      ? Math.min(100, Math.max(0, body.minRentYieldPercent))
      : body.minRentYieldPercent === null
        ? null
        : 5;

  const config = getFusionServerConfig();
  if (!config) {
    return Response.json(
      { success: false, error: "FUSION_API_KEY or FUSION_API_URL is not set" },
      { status: 503 },
    );
  }

  const probeUrl = resolveFusionPropertiesListUrlPaginated(FUSION_LISTINGS_PAGE_SIZE_MAX, 0);
  if (!probeUrl) {
    return Response.json(
      {
        success: false,
        error:
          "Fusion properties URL is not configured (set FUSION_API_PROPERTIES_URL or FUSION_HOST_URL + FUSION_API_KEY + FUSION_API_URL + FUSION_SUBSCRIBER)",
      },
      { status: 503 },
    );
  }

  const { mergedRows, pagesFetched, forbid403 } = await mergeAllProjectPages(
    config,
    capPages,
    "[api/properties/top-yield/refresh]",
  );

  if (forbid403) {
    return Response.json(
      {
        success: false,
        error:
          "Fusion CRM returned 403 Unauthorized. Re-copy FUSION_API_KEY from Fusion, and ensure FUSION_API_URL matches an authorized origin exactly.",
        upstreamUrl: probeUrl,
        headersUsed: { "API-URL": config.apiUrl },
      },
      { status: 403 },
    );
  }

  const payload = buildTopYieldPicksFromMergedRows(mergedRows, {
    pickCount,
    minRentYieldPercent,
    capPages,
    pagesFetched,
  });

  await writeTopYieldPicksFile(payload);

  return Response.json({
    success: true,
    cache: {
      updatedAt: payload.updatedAt,
      capPages: payload.capPages,
      pagesFetched: payload.pagesFetched,
      totalProjectsConsidered: payload.totalProjectsConsidered,
      minRentYieldPercent: payload.minRentYieldPercent,
      pickCount: payload.pickCount,
      writtenPath: "data/top-yield-picks.json",
    },
  });
}
