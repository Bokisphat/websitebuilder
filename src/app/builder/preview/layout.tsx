import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full-page preview",
  description: "Responsive preview of your site from the builder",
  robots: { index: false, follow: false },
};

export default function BuilderPreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
