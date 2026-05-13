import { getFusionServerConfig } from "../../../lib/fusion-env";
import { fusionAuthHeaders } from "../../../lib/fusion-upstream";
import {
  applyDefaultSubscriberSearchParams,
  mapFusionBffSegmentsToUpstreamPath,
} from "../../../lib/fusion-bff-path";

function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path: segments = [] } = await ctx.params;
  const upstreamPath = mapFusionBffSegmentsToUpstreamPath(segments);
  if (!upstreamPath) {
    return jsonError(404, "Unknown Fusion resource", {
      hint: "Try /api/fusion/projects, /api/fusion/lots, /api/fusion/states, …",
    });
  }

  const config = getFusionServerConfig();
  if (!config) {
    return jsonError(503, "Fusion is not configured (set FUSION_API_KEY and FUSION_API_URL)");
  }

  const url = new URL(req.url);
  const sp = applyDefaultSubscriberSearchParams(upstreamPath, url.searchParams);
  const qs = sp.toString();
  const pathAndQuery = `/api/fusion/${upstreamPath}${qs ? `?${qs}` : ""}`;

  const upstream = await fetch(`${config.hostUrl}${pathAndQuery}`, {
    method: "GET",
    headers: fusionAuthHeaders(config),
    cache: "no-store",
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path: segments = [] } = await ctx.params;
  if (segments.length !== 1 || segments[0] !== "leads") {
    return jsonError(404, "POST is only supported at /api/fusion/leads");
  }

  const config = getFusionServerConfig();
  if (!config) {
    return jsonError(503, "Fusion is not configured (set FUSION_API_KEY and FUSION_API_URL)");
  }

  const contentType = req.headers.get("content-type") ?? "";
  const body = await req.arrayBuffer();

  const upstream = await fetch(`${config.hostUrl}/api/fusion/leads`, {
    method: "POST",
    headers: {
      ...fusionAuthHeaders(config),
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
