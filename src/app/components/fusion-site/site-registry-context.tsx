"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FusionSite } from "@/app/lib/fusion-site-model";
import { duplicateSite as duplicateSiteModel, generateSite } from "@/app/lib/site-generator";
import type { SiteConfig } from "@/app/lib/site-config";
import { loadSitesFromStorage, saveSitesToStorage } from "@/app/lib/site-storage";

type SiteRegistryValue = {
  sites: FusionSite[];
  hydrated: boolean;
  addGeneratedSite: () => FusionSite;
  duplicateSiteById: (siteId: string) => FusionSite | null;
  upsertSite: (site: FusionSite) => void;
  updateSiteBranding: (siteId: string, patch: Partial<SiteConfig>) => void;
  removeSite: (siteId: string) => void;
  getSite: (siteId: string) => FusionSite | undefined;
};

const SiteRegistryContext = createContext<SiteRegistryValue | null>(null);

export function SiteRegistryProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<FusionSite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadSitesFromStorage();
    if (stored?.length) {
      setSites(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSitesToStorage(sites);
  }, [sites, hydrated]);

  const upsertSite = useCallback((site: FusionSite) => {
    setSites((prev) => {
      const i = prev.findIndex((s) => s.id === site.id);
      if (i === -1) return [...prev, site];
      const next = [...prev];
      next[i] = site;
      return next;
    });
  }, []);

  const updateSiteBranding = useCallback((siteId: string, patch: Partial<SiteConfig>) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id !== siteId) return s;
        const branding = { ...s.branding, ...patch };
        const keys = Object.keys(patch) as (keyof SiteConfig)[];
        if (keys.every((k) => branding[k] === s.branding[k])) {
          return s;
        }
        return { ...s, branding };
      }),
    );
  }, []);

  const removeSite = useCallback((siteId: string) => {
    setSites((prev) => prev.filter((s) => s.id !== siteId));
  }, []);

  const getSite = useCallback(
    (siteId: string) => sites.find((s) => s.id === siteId),
    [sites],
  );

  const addGeneratedSite = useCallback(() => {
    const site = generateSite();
    setSites((prev) => [...prev, site]);
    return site;
  }, []);

  const duplicateSiteById = useCallback(
    (siteId: string) => {
      const original = sites.find((s) => s.id === siteId);
      if (!original) return null;
      const copy = duplicateSiteModel(original);
      setSites((prev) => [...prev, copy]);
      return copy;
    },
    [sites],
  );

  const value = useMemo(
    () => ({
      sites,
      hydrated,
      addGeneratedSite,
      duplicateSiteById,
      upsertSite,
      updateSiteBranding,
      removeSite,
      getSite,
    }),
    [sites, hydrated, addGeneratedSite, duplicateSiteById, upsertSite, updateSiteBranding, removeSite, getSite],
  );

  return <SiteRegistryContext.Provider value={value}>{children}</SiteRegistryContext.Provider>;
}

export function useSiteRegistry() {
  const ctx = useContext(SiteRegistryContext);
  if (!ctx) {
    throw new Error("useSiteRegistry must be used within SiteRegistryProvider");
  }
  return ctx;
}

export function useOptionalSiteRegistry(): SiteRegistryValue | null {
  return useContext(SiteRegistryContext);
}
