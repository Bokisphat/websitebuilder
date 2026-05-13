import type { Metadata } from "next";
import { MarketingHome } from "@/components/landing/MarketingHome";

export const metadata: Metadata = {
  title: "Fusion Sites — Property website builder",
  description:
    "Build informative new-property transaction websites with themes, demographic targeting, and API-filtered listings for property professionals.",
};

export default function Home() {
  return <MarketingHome />;
}
