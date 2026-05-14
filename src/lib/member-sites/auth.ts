/**
 * Resolves the Fusion subscriber (member) id for member-site APIs.
 *
 * Integration (Fusion / Laravel): send header `X-Fusion-Subscriber-Id: <id>` on every request
 * (server-side proxy or BFF preferred). Do not rely on `NEXT_PUBLIC_*` in production.
 *
 * Local dev: header optional if `MEMBER_SITES_DEV_SUBSCRIBER` or `FUSION_SUBSCRIBER` is set.
 */
export function getFusionSubscriberIdFromRequest(req: Request): string | null {
  const header = req.headers.get("x-fusion-subscriber-id")?.trim();
  if (header && /^\d+$/.test(header)) return header;

  if (process.env.NODE_ENV !== "production") {
    const dev = process.env.MEMBER_SITES_DEV_SUBSCRIBER?.trim();
    if (dev && /^\d+$/.test(dev)) return dev;
    const fusion = process.env.FUSION_SUBSCRIBER?.trim();
    if (fusion && /^\d+$/.test(fusion)) return fusion;
  }

  return null;
}
