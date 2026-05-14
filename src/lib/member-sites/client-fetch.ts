/**
 * Browser-side headers for member APIs. Fusion should eventually set `X-Fusion-Subscriber-Id`
 * via same-origin session or parent-frame handoff — not via public env vars.
 *
 * Manual entry: subscriber id is stored in localStorage (this device only) until Laravel integration.
 * `NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID` is a fallback when nothing is stored.
 */

const STORAGE_KEY = "fusion-sites:manual-subscriber-id";

export function getManualSubscriberId(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY)?.trim();
  return v && /^\d+$/.test(v) ? v : null;
}

/** Save Fusion member / subscriber id (digits only). Clears if empty. */
export function setManualSubscriberId(id: string): void {
  if (typeof window === "undefined") return;
  const t = id.trim();
  if (!t) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  if (/^\d+$/.test(t)) localStorage.setItem(STORAGE_KEY, t);
}

export function clearManualSubscriberId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function memberSitesClientHeaders(): HeadersInit {
  const manual = typeof window !== "undefined" ? getManualSubscriberId() : null;
  if (manual) return { "X-Fusion-Subscriber-Id": manual };

  const id = process.env.NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID?.trim();
  if (id && /^\d+$/.test(id)) {
    return { "X-Fusion-Subscriber-Id": id };
  }
  return {};
}
