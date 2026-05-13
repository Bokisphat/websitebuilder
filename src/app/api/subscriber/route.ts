import { getFusionHostUrl } from "../../lib/fusion-env";

export async function GET() {
  const apiKey = process.env.FUSION_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "FUSION_API_KEY is not set", status: null, rawText: null },
      { status: 503 },
    );
  }

  const base = getFusionHostUrl();
  const url = `${base}/api/fusion/wordpress-websites/subscriber-detail/${encodeURIComponent(apiKey)}`;

  const upstream = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const rawText = await upstream.text();

  return Response.json({
    status: upstream.status,
    rawText,
  });
}
