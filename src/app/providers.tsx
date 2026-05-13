"use client";

import type { ReactNode } from "react";
import { SiteRegistryProvider } from "./components/fusion-site/site-registry-context";

export function Providers({ children }: { children: ReactNode }) {
  return <SiteRegistryProvider>{children}</SiteRegistryProvider>;
}
