import type { ReactNode } from "react";
import { SiteMemberLayout } from "./SiteMemberLayout";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteMemberLayout>{children}</SiteMemberLayout>;
}
