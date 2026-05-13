import { resolveBookingCtaHref } from "@/lib/booking-link";
import { resolveAdvisoryWealthHeroHref } from "@/lib/hero-cta-migrate";
import type { SectionConfig, SiteLayoutId } from "@/lib/site-model";
import { DualKeySection, type DualKeySectionProps } from "./DualKeySection";
import { FeaturedListings, type FeaturedListingsProps } from "./FeaturedListings";
import { HeroSection, type HeroSectionProps } from "./HeroSection";
import { InvestorStrategySection, type InvestorStrategySectionProps } from "./InvestorStrategySection";
import { LeadForm, type LeadFormProps } from "./LeadForm";
import { SessionInterestSection, type SessionInterestSectionProps } from "./SessionInterestSection";
import { SmsfSection, type SmsfSectionProps } from "./SmsfSection";
import { TestimonialSection, type TestimonialSectionProps } from "./TestimonialSection";
import { TextImage, type TextImageProps } from "./TextImage";
import { VideoEmbed, type VideoEmbedProps } from "./VideoEmbed";

export function RenderSection({
  section,
  bookingUrl,
  onPickStockImage,
  fusionTemplate = "custom",
}: {
  section: SectionConfig;
  bookingUrl?: string;
  /** Builder preview: opens stock image picker for any section that supports an optional image. */
  onPickStockImage?: (sectionId: string) => void;
  /** Site layout preset — tweaks default hero typography/spacing; “custom” leaves baseline. */
  fusionTemplate?: SiteLayoutId;
}) {
  const pick = onPickStockImage ? () => onPickStockImage(section.id) : undefined;

  switch (section.type) {
    case "hero": {
      const hero = section.props as unknown as HeroSectionProps;
      const legacy = resolveAdvisoryWealthHeroHref(hero.ctaLabel, hero.ctaHref);
      const ctaHref = resolveBookingCtaHref(legacy, bookingUrl);
      return <HeroSection {...hero} ctaHref={ctaHref} fusionTemplate={fusionTemplate} onPickImage={pick} />;
    }
    case "featuredListings":
      return (
        <FeaturedListings
          {...(section.props as unknown as FeaturedListingsProps)}
          sectionId={section.id}
          fusionTemplate={fusionTemplate}
          onPickImage={pick}
        />
      );
    case "leadForm":
      return <LeadForm {...(section.props as unknown as LeadFormProps)} onPickImage={pick} />;
    case "sessionInterest":
      return <SessionInterestSection {...(section.props as unknown as SessionInterestSectionProps)} onPickImage={pick} />;
    case "textImage":
      return (
        <TextImage
          {...(section.props as unknown as TextImageProps)}
          onPickImage={pick}
        />
      );
    case "videoEmbed":
      return <VideoEmbed {...(section.props as unknown as VideoEmbedProps)} />;
    case "testimonial":
      return <TestimonialSection {...(section.props as unknown as TestimonialSectionProps)} onPickImage={pick} />;
    case "smsf":
      return <SmsfSection {...(section.props as unknown as SmsfSectionProps)} onPickImage={pick} />;
    case "dualKey":
      return <DualKeySection {...(section.props as unknown as DualKeySectionProps)} onPickImage={pick} />;
    case "investorStrategy":
      return <InvestorStrategySection {...(section.props as unknown as InvestorStrategySectionProps)} onPickImage={pick} />;
    default:
      return null;
  }
}
