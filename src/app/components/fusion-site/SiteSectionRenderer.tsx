"use client";

import type { FusionSite } from "@/app/lib/fusion-site-model";
import type { SectionConfig } from "@/app/lib/section-config";
import {
  DualKeyExplainerSection,
  FeaturedListingsSection,
  HeroSection,
  InvestorStrategySection,
  LeadCaptureSection,
  SmsfExplainerSection,
  TestimonialSection,
  TextImageSection,
} from "./sections";

export function SiteSectionRenderer({ site, section }: { site: FusionSite; section: SectionConfig }) {
  switch (section.kind) {
    case "hero":
      return <HeroSection section={section} branding={site.branding} />;
    case "featuredListings":
      return <FeaturedListingsSection section={section} siteId={site.id} />;
    case "leadCapture":
      return <LeadCaptureSection section={section} />;
    case "testimonial":
      return <TestimonialSection section={section} />;
    case "textImage":
      return <TextImageSection section={section} />;
    case "investorStrategy":
      return <InvestorStrategySection section={section} />;
    case "smsfExplainer":
      return <SmsfExplainerSection section={section} />;
    case "dualKeyExplainer":
      return <DualKeyExplainerSection section={section} />;
  }
}
