import type { FusionSite } from "./fusion-site-model";

export const FUSION_SITES_STORAGE_KEY = "fusion-sites-registry-v1";

export function loadSitesFromStorage(): FusionSite[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FUSION_SITES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as FusionSite[];
  } catch {
    return null;
  }
}

export function saveSitesToStorage(sites: FusionSite[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FUSION_SITES_STORAGE_KEY, JSON.stringify(sites));
  } catch {
    /* quota or private mode */
  }
}
