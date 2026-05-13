import type { BrandingConfig, PageConfig, SectionConfig, SiteConfig } from "./site-model";
import { withBrandingDefaults, withSiteConfigDefaults, normalizeTemplateId } from "./site-model";

export function newSiteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `site_${Date.now()}`;
}

function defaultBranding(siteName: string): BrandingConfig {
  return {
    siteName,
    logo: "",
    primaryColor: "#a78bfa",
    secondaryColor: "#34d399",
    phone: "+61 400 000 000",
    email: "team@example.com",
    bookingUrl: "",
    referralPartnersUrl: "",
    colorScheme: "dark",
    contentWidth: "default",
  };
}

export function defaultPages(): PageConfig[] {
  const homeSections: SectionConfig[] = [
    {
      id: "home-hero",
      type: "hero",
      props: {
        headline: "Investment property, presented with clarity.",
        subheadline: "Curated listings, SMSF-aware guidance, and dual-key yield plays — without the noise.",
        ctaLabel: "View listings",
        ctaHref: "#listings",
      },
    },
    {
      id: "home-featured",
      type: "featuredListings",
      props: {
        title: "Featured listings",
      },
    },
    {
      id: "home-strategy",
      type: "investorStrategy",
      props: {
        title: "How we work with investors",
        intro:
          "You are time-poor and outcome-focused. We shortlist assets where tenant demand, yield, and exit liquidity line up — then we help you stress-test the numbers before you commit.",
        bullets: [
          "Scenario modelling: rates, vacancy, and rental growth bands",
          "Dual-key and granny-flat angles where zoning and demand support it",
          "Introductions to lending and tax partners when you need independent advice",
        ],
      },
    },
    {
      id: "home-dualkey",
      type: "dualKey",
      props: {
        title: "Why dual-key matters in this cycle",
        body: "Two income streams from one title can smooth vacancy risk and lift net yield when the layout matches local tenant demand — think healthcare shift workers, students, and young families sharing a suburb but not a lease.",
        bullets: [
          "Separate tenancy agreements and clearer rent reviews",
          "Independent living zones that appeal to unrelated tenants",
          "Corridor cities where population growth supports both dwellings",
        ],
      },
    },
    {
      id: "home-smsf",
      type: "smsf",
      props: {
        title: "Buying through your SMSF",
        body: "Self-managed super fund acquisitions have specific lending, structure, and compliance steps. We surface the right questions early — liquidity, contribution caps, and whether gearing fits your fund strategy — so conversations with your adviser stay productive.",
        points: [
          "Liquidity after settlement (contributions, pensions, LRBA if applicable)",
          "Arm’s-length rent and lease documentation",
          "Independent SMSF advice is essential — we are property specialists, not accountants",
        ],
      },
    },
    {
      id: "home-testimonial",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "We stopped wasting weekends on random listings. The shortlist was tight, the numbers were upfront, and the dual-key option actually made sense for our portfolio.",
            author: "Daniel R.",
            role: "SMSF trustee & IT contractor, Brisbane",
          },
        ],
      },
    },
    {
      id: "home-lead",
      type: "leadForm",
      props: {
        title: "Request the shortlist",
        description: "We reply within one business day. Mock form — nothing is sent.",
        buttonLabel: "Send",
      },
    },
  ];

  const listingsSections: SectionConfig[] = [
    {
      id: "listings-hero",
      type: "hero",
      props: {
        headline: "Current opportunities",
        subheadline: "Curated opportunities from Fusion CRM.",
        ctaLabel: "Contact",
        ctaHref: "#contact",
      },
    },
    {
      id: "listings-grid",
      type: "featuredListings",
      props: {
        title: "All listings",
      },
    },
  ];

  const aboutSections: SectionConfig[] = [
    {
      id: "about-text",
      type: "textImage",
      props: {
        title: "Structured sites for serious investors",
        body: "Fusion Sites focuses on high-converting layouts: clear headlines, proof, and a single obvious next step. No generic page builder noise.",
        imageSide: "right",
        imageLabel: "Team",
      },
    },
  ];

  const contactSections: SectionConfig[] = [
    {
      id: "contact-hero",
      type: "hero",
      props: {
        headline: "Talk to the team",
        subheadline: "Leave your details — demo form only.",
        ctaLabel: "Call",
        ctaHref: "tel:+61400000000",
      },
    },
    {
      id: "contact-form",
      type: "leadForm",
      props: {
        title: "Send a message",
        description: "This form does not submit anywhere in the demo.",
        buttonLabel: "Submit",
      },
    },
  ];

  return [
    { id: "home", name: "Homepage", sections: homeSections },
    { id: "listings", name: "Listings", sections: listingsSections },
    { id: "about", name: "About", sections: aboutSections },
    { id: "contact", name: "Contact", sections: contactSections },
  ];
}

export function createSite(name: string): SiteConfig {
  return {
    id: newSiteId(),
    name,
    templateId: "custom",
    branding: defaultBranding(name),
    pages: defaultPages(),
    publishStatus: "draft",
  };
}

/** Deep clone with a new id and “ Copy” appended to internal and display names. */
export function duplicateSiteConfig(site: SiteConfig): SiteConfig {
  const next = JSON.parse(JSON.stringify(site)) as SiteConfig;
  next.id = newSiteId();
  next.name = `${site.name} Copy`;
  next.branding = withBrandingDefaults({
    ...next.branding,
    siteName: `${site.branding.siteName} Copy`,
  });
  if (!next.publishStatus) next.publishStatus = "draft";
  next.templateId = normalizeTemplateId(next.templateId);
  return withSiteConfigDefaults(next);
}
