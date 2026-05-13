import { getFusionSubscriberId } from "../../lib/fusion-env";
import { fusionGetWithConfig } from "../../lib/fusion-upstream";

/** Dev-only sanity check: calls Fusion project list with real `API-KEY` / `API-URL` headers. */
export async function GET() {
  const upstream = await fusionGetWithConfig(
    `/api/fusion/projects?subscriber=${encodeURIComponent(getFusionSubscriberId())}&limit=2`,
  );

  if (!upstream) {
    return Response.json(
      { error: "FUSION_API_KEY or FUSION_API_URL is not set", status: null, rawText: null },
      { status: 503 },
    );
  }

  const rawText = await upstream.text();

  return Response.json({
    status: upstream.status,
    rawText,
  });
}
