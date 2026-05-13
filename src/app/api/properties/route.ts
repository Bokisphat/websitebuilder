import {
  FUSION_LISTINGS_PAGE_SIZE_MAX,
  getFusionListingsAggregateMaxPages,
  getFusionServerConfig,
  resolveFusionPropertiesListUrl,
  resolveFusionPropertiesListUrlPaginated,
} from "../../lib/fusion-env";
import { fetchFusionUpstream, mergeAllProjectPages } from "../../lib/fusion-full-catalog-merge";
import { propertiesFromApiJson } from "../../lib/parse-properties-response";

/** Full-feed merge can run many upstream calls; allow long runs on serverless hosts that support it. */
export const maxDuration = 300;

const UPSTREAM_TEXT_MAX = 4000;

function headersUsedForLog(apiUrl: string): { "API-URL": string } {
  return { "API-URL": apiUrl };
}

export async function GET(request: Request) {
  let propertiesUrl: string | null = null;
  let apiUrl: string | null = null;

  const { searchParams } = new URL(request.url);
  const fetchAllMerged = searchParams.get("all") === "1";
  const capPagesRaw = parseInt(searchParams.get("capPages") || "", 10);
  const hasPageParam = searchParams.has("page");
  let usePagination = false;
  let pageNum = 1;
  let pageSize = FUSION_LISTINGS_PAGE_SIZE_MAX;

  if (hasPageParam) {
    usePagination = true;
    pageNum = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limRaw = parseInt(searchParams.get("limit") || String(FUSION_LISTINGS_PAGE_SIZE_MAX), 10);
    pageSize = Math.min(FUSION_LISTINGS_PAGE_SIZE_MAX, Math.max(1, limRaw || FUSION_LISTINGS_PAGE_SIZE_MAX));
  }

  try {
    const config = getFusionServerConfig();
    apiUrl = config?.apiUrl ?? null;

    if (!config) {
      return Response.json(
        {
          success: false,
          error: "FUSION_API_KEY or FUSION_API_URL is not set",
          upstreamStatus: null,
          upstreamText: null,
          upstreamUrl: null,
          headersUsed: null,
        },
        { status: 503 },
      );
    }

    if (fetchAllMerged) {
      const maxPages = Math.min(
        500,
        Math.max(1, Number.isFinite(capPagesRaw) ? capPagesRaw : getFusionListingsAggregateMaxPages()),
      );
      const probeUrl = resolveFusionPropertiesListUrlPaginated(FUSION_LISTINGS_PAGE_SIZE_MAX, 0);
      if (!probeUrl) {
        return Response.json(
          {
            success: false,
            error:
              "Fusion properties URL is not configured (set FUSION_API_PROPERTIES_URL or FUSION_HOST_URL + FUSION_API_KEY + FUSION_API_URL + FUSION_SUBSCRIBER)",
            upstreamStatus: null,
            upstreamText: null,
            upstreamUrl: null,
            headersUsed: null,
          },
          { status: 503 },
        );
      }

      const { mergedRows, pagesFetched, forbid403 } = await mergeAllProjectPages(
        config,
        maxPages,
        "[api/properties]",
      );

      if (forbid403) {
        return Response.json(
          {
            success: false,
            error:
              "Fusion CRM returned 403 Unauthorized. Re-copy FUSION_API_KEY from Fusion, and ensure FUSION_API_URL matches an authorized origin exactly.",
            upstreamStatus: 403,
            upstreamText: null,
            upstreamUrl: probeUrl,
            headersUsed: headersUsedForLog(config.apiUrl),
          },
          { status: 403 },
        );
      }

      return Response.json({
        success: true,
        data: mergedRows,
        pagination: {
          page: 1,
          pageSize: mergedRows.length,
          hasMore: false,
        },
        meta: {
          allPages: true,
          pagesFetched,
          capPages: maxPages,
        },
      });
    }

    propertiesUrl = usePagination
      ? resolveFusionPropertiesListUrlPaginated(pageSize, (pageNum - 1) * pageSize)
      : resolveFusionPropertiesListUrl();

    if (!propertiesUrl) {
      return Response.json(
        {
          success: false,
          error:
            "Fusion properties URL is not configured (set FUSION_API_PROPERTIES_URL or FUSION_HOST_URL + FUSION_API_KEY + FUSION_API_URL + FUSION_SUBSCRIBER)",
          upstreamStatus: null,
          upstreamText: null,
          upstreamUrl: null,
          headersUsed: null,
        },
        { status: 503 },
      );
    }

    const upstream = await fetchFusionUpstream(propertiesUrl, config);
    const text = await upstream.text();

    if (upstream.status === 403) {
      console.error("[api/properties] Fusion 403 Unauthorized", {
        upstreamUrl: propertiesUrl,
        bodyPreview: text.slice(0, UPSTREAM_TEXT_MAX),
      });
      return Response.json(
        {
          success: false,
          error:
            "Fusion CRM returned 403 Unauthorized. Re-copy FUSION_API_KEY from Fusion (typos are common), and ensure FUSION_API_URL matches an authorized origin exactly (API-KEY + API-URL headers).",
          upstreamStatus: 403,
          upstreamText: text.slice(0, UPSTREAM_TEXT_MAX),
          upstreamUrl: propertiesUrl,
          headersUsed: headersUsedForLog(config.apiUrl),
        },
        { status: 403 },
      );
    }

    if (!upstream.ok) {
      console.error("[api/properties] Fusion upstream failed", {
        status: upstream.status,
        upstreamUrl: propertiesUrl,
        bodyPreview: text.slice(0, 500),
      });
      return Response.json(
        {
          success: false,
          error: "Fusion upstream request failed",
          upstreamStatus: upstream.status,
          upstreamText: text.slice(0, UPSTREAM_TEXT_MAX),
          upstreamUrl: propertiesUrl,
          headersUsed: headersUsedForLog(config.apiUrl),
        },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      console.error("[api/properties] Upstream non-JSON", text.slice(0, 500));
      return Response.json(
        {
          success: false,
          error: "Fusion upstream returned non-JSON",
          upstreamStatus: upstream.status,
          upstreamText: text.slice(0, UPSTREAM_TEXT_MAX),
          upstreamUrl: propertiesUrl,
          headersUsed: headersUsedForLog(config.apiUrl),
        },
        { status: 502 },
      );
    }

    if (usePagination) {
      const items = propertiesFromApiJson({ success: true, data: parsed });
      return Response.json({
        success: true,
        data: parsed,
        pagination: {
          page: pageNum,
          pageSize,
          hasMore: items.length === pageSize,
        },
      });
    }

    return Response.json({ success: true, data: parsed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[api/properties] Exception", message);
    return Response.json(
      {
        success: false,
        error: "Failed to reach Fusion upstream",
        upstreamStatus: null,
        upstreamText: null,
        upstreamUrl: propertiesUrl,
        headersUsed: apiUrl ? headersUsedForLog(apiUrl) : null,
        detail: message,
      },
      { status: 500 },
    );
  }
}
