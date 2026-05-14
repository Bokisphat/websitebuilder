/**
 * Browser-side headers for member APIs. Fusion should eventually set `X-Fusion-Subscriber-Id`
 * via same-origin session or parent-frame handoff — not via public env vars.
 *
 * `NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID` is only for demos when Laravel integration is absent.
 */
export function memberSitesClientHeaders(): HeadersInit {
  const id = process.env.NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID?.trim();
  if (id && /^\d+$/.test(id)) {
    return { "X-Fusion-Subscriber-Id": id };
  }
  return {};
}
