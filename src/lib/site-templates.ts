import type { SectionConfig, SiteConfig, SiteColorScheme, SiteTemplateId } from "./site-model";
import { defaultPages, newSiteId } from "./site-generator";

export type { SiteTemplateId } from "./site-model";
export { SITE_TEMPLATE_IDS } from "./site-model";

function replaceHomeSections(pages: SiteConfig["pages"], sections: SectionConfig[]): SiteConfig["pages"] {
  return pages.map((p) => (p.id === "home" ? { ...p, sections } : p));
}

function replacePageSections(
  pages: SiteConfig["pages"],
  pageId: string,
  sections: SectionConfig[],
): SiteConfig["pages"] {
  return pages.map((p) => (p.id === pageId ? { ...p, sections } : p));
}

/** Thumbnail + card copy for the builder template gallery. */
export type BuilderTemplateCard = {
  id: SiteTemplateId;
  name: string;
  description: string;
  positioningAngle: string;
  previewPrimary: string;
  previewSecondary: string;
};

export const BUILDER_TEMPLATE_CARDS: BuilderTemplateCard[] = [
  {
    id: "advisory",
    name: "General wealth creation",
    description:
      "A full-funnel example: who you help, what you offer, how property fits wealth and retirement goals, and clear calls to action — all editable in the builder.",
    positioningAngle: "Long-term property wealth, explained clearly — strategy before stock.",
    previewPrimary: "#6366f1",
    previewSecondary: "#22d3ee",
  },
  {
    id: "smsfStrategy",
    name: "SMSF Property Strategy",
    description:
      "WT Capital–style SMSF property funnel: wealth-within-reach hero, Discovery → Research → Strategy journey, macro research pillars, social proof, listings, and book-a-strategy-call capture — with general-advice disclaimers.",
    positioningAngle: "Everyday trustees exploring property inside super — education, process, and qualified next steps.",
    previewPrimary: "#1e3a5f",
    previewSecondary: "#c9a74a",
  },
  {
    id: "highYield",
    name: "High Yield / Cash Flow Property",
    description:
      "Yield-first sites for investors who care about rental return, holding power, and income you can stress-test.",
    positioningAngle: "Cash flow, income, and stronger holding power.",
    previewPrimary: "#059669",
    previewSecondary: "#facc15",
  },
  {
    id: "positiveCashflow",
    name: "Positive cashflow agency",
    description:
      "Consultancy-style portal layout for dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA) — hero, featured stock, multi-tenancy education, specialist listings bands, and state-led discovery.",
    positioningAngle:
      "Positive cashflow through multi-income and specialist housing — dual occ to NDIS (SDA), with listings-forward flow.",
    previewPrimary: "#0f766e",
    previewSecondary: "#0e7490",
  },
  {
    id: "dualIncome",
    name: "Investment property portal",
    description:
      "Portal-style layout: warm canvas, gold and navy accents, category-led story, featured listings, and dual-income education — similar to leading Australian investment property sites.",
    positioningAngle: "High-yield, multi-income, and off-market style funnels for serious investors.",
    previewPrimary: "#c9a227",
    previewSecondary: "#1e40af",
  },
  {
    id: "lifestyleCorridors",
    name: "Real Estate Theme 1",
    description:
      "Bright, search-first layout inspired by major consumer real estate portals: large hero discovery, blue accent CTAs, listing-forward home page, and clear buying journey steps — ideal for lifestyle buyers and growth-corridor campaigns.",
    positioningAngle: "Browse-first experience with homes at the centre — education without clutter.",
    previewPrimary: "#2563eb",
    previewSecondary: "#0ea5e9",
  },
  {
    id: "ndisProperties",
    name: "NDIS Properties",
    description:
      "Specialist Disability Accommodation (SDA) and disability-housing journeys — design categories, subsidy context, checklist tone, and Fusion listings wired for investor due diligence.",
    positioningAngle: "NDIS / SDA acquisition sites with compliant copy and clear adviser hand-offs.",
    previewPrimary: "#0369a1",
    previewSecondary: "#7c3aed",
  },
  {
    id: "realEstateTheme2",
    name: "Real Estate Theme 2",
    description:
      "Inspired by established agency sites like Woodards — heritage trust tone, “connecting people with property”, buy / sell / rent journey, suburb insight, and appraisal-led CTAs on a deep green and gold canvas.",
    positioningAngle:
      "Melbourne-style full-service residential brand: network credibility, neighbourhood story, listing-first discovery.",
    previewPrimary: "#1a3a2f",
    previewSecondary: "#b8945a",
  },
  {
    id: "realEstateTheme3",
    name: "Real Estate Theme 3",
    description:
      "Inspired by Create Real Estate — premier partner positioning, aspirational “dream home” headline, clean executive palette, and the same Fusion listing workflow as other real estate themes.",
    positioningAngle: "Dream-home discovery with polished, partner-led copy and confident minimal branding.",
    previewPrimary: "#0f2744",
    previewSecondary: "#c9a227",
  },
  {
    id: "firstHomeBuyers",
    name: "First home buyers",
    description:
      "First Home Buyers Australia–style journeys: schemes and grants explained simply, deposit pathway, pre-approval context, starter listings from Fusion, and specialist support CTAs — patient, education-first.",
    positioningAngle: "New entrants who need trust and a clear plan before they inspect or offer.",
    previewPrimary: "#0284c7",
    previewSecondary: "#f97316",
  },
];

export function buildGeneralPropertyAdvisoryTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "v4-adv-hero",
      type: "hero",
      props: {
        headline: "Build long-term wealth through property — with a plan, not a pitch.",
        subheadline:
          "We help you align new builds and established opportunities with your income goals, tax context, and retirement timeline. National reach with stock short-listed to your strategy — not the other way around.",
        ctaLabel: "Book a wealth strategy session",
        ctaHref: "#session-interest",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Modern city skyline with glass office towers",
        backdropOverlayStrength: 58,
      },
    },
    {
      id: "v4-adv-session-interest",
      type: "sessionInterest",
      props: {
        title: "Register your interest",
        description:
          "Tell us whether you’d prefer a 20 minute discovery phone call or a live Zoom — we’ll follow up by email or phone to lock in a time.",
        anchorId: "session-interest",
        optionPhoneLabel: "20 min discovery phone call",
        optionZoomLabel: "Live Zoom session",
        buttonLabel: "Send my preference",
      },
    },
    {
      id: "v4-adv-trust",
      type: "textImage",
      props: {
        title: "Who we help",
        body:
          "First-time investors, time-poor professionals, growing families, and pre-retirees who want property to carry more of the load in a broader wealth plan. We focus on clarity: passive income, sensible leverage, and structures that make sense to discuss with your accountant — guided by a property advisor, not a sales-first agent.",
        imageSide: "right",
        imageLabel: "Clients",
      },
    },
    {
      id: "v4-adv-access",
      type: "textImage",
      props: {
        title: "What you get access to",
        body:
          "House and land, townhouses, apartments, dual occupancy, duplex, co-living, and opportunities that can suit SMSF rules where they fit your facts. Curated from a large national pipeline so you see options matched to budget, location, and risk — instead of wading through generic listing noise alone.",
        imageSide: "left",
        imageLabel: "Opportunities",
      },
    },
    {
      id: "v4-adv-listings",
      type: "featuredListings",
      props: { title: "Current opportunities from our network" },
    },
    {
      id: "v4-adv-strategy",
      type: "investorStrategy",
      props: {
        title: "Property in your wealth plan — in plain language",
        intro:
          "We untangle the moving parts: growth and income over time, holding and finance costs, depreciation where it applies, and when to loop in licensed advice for tax and super. You leave knowing what to stress-test before you commit — not a fog of jargon.",
        bullets: [
          "Scenarios for rates, rent, and vacancy you can actually relate to",
          "Portfolio thinking: the next buy vs the only buy",
          "Warm hand-offs to mortgage brokers, accountants, and planners when the detail matters",
        ],
      },
    },
    {
      id: "v4-adv-process",
      type: "textImage",
      props: {
        title: "Your path in four steps",
        body:
          "1) Strategy session — goals, constraints, and comfort with risk. 2) A shortlist built around your numbers. 3) Due diligence and purchase support. 4) Refine the plan as life stages and markets shift — we care about outcomes, not a single transaction.",
        imageSide: "right",
        imageLabel: "Process",
      },
    },
    {
      id: "v4-adv-lead-mid",
      type: "leadForm",
      props: {
        title: "Get property options matched to you",
        description:
          "Tell us what you are optimising for — first step on the ladder, the next hold, or retirement timing. We will follow up with tailored next steps; production sites connect enquiries to Fusion CRM.",
        buttonLabel: "Request options",
      },
    },
    {
      id: "v4-adv-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "No agent-speak — just strategy, shortlists, and numbers we could take to our accountant. The process felt calm and deliberate.",
            author: "Michael & Jen",
            role: "Investors, NSW",
          },
        ],
      },
    },
    {
      id: "v4-adv-authority",
      type: "textImage",
      props: {
        title: "Alongside your broker, accountant, and planner",
        body:
          "Property should sit inside a full financial picture. We often coordinate with the licensed professionals you already trust, while we own property strategy, stock fit, and execution. This site is built to turn serious visitors into qualified conversations.",
        imageSide: "left",
        imageLabel: "Network",
      },
    },
    {
      id: "v4-adv-lead-final",
      type: "leadForm",
      props: {
        title: "Book your wealth and property call",
        description:
          "Start with a structured conversation: income, time horizon, and how property can support the life you are building — before you look at a single plan or facade.",
        buttonLabel: "Book strategy session",
      },
    },
  ];

  return {
    id: newSiteId(),
    name: "General wealth creation",
    templateId: "advisory",
    publishStatus: "draft",
    branding: {
      siteName: "Wealth & Property Advisory",
      logo: "",
      primaryColor: "#2563eb",
      secondaryColor: "#0ea5e9",
      phone: "+61 7 3100 2200",
      email: "strategy@wealthexample.com.au",
      colorScheme: "cool",
      contentWidth: "narrow",
    },
    pages: replaceHomeSections(defaultPages(), homeSections),
  };
}

/** SMSF property preset patterned on [WT Capital](https://www.wtcapital.com.au/) — stages, research pillars, strategy calls. Demo brand only; not affiliated. */
export function buildSmsfPropertyStrategyTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "v4-smsf-hero",
      type: "hero",
      props: {
        headline: "Wealth within reach.",
        subheadline:
          "Your super can build more than you think. We help everyday Australians explore property inside a Self Managed Super Fund — with full support from first conversation through to settlement, alongside your licensed advisers.",
        ctaLabel: "Book a free strategy call",
        ctaHref: "#strategy-call",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "City skyline — long-term wealth and superannuation",
        backdropOverlayStrength: 58,
      },
    },
    {
      id: "v4-smsf-session",
      type: "sessionInterest",
      props: {
        title: "Start with a discovery session",
        description:
          "Tell us whether you’d like a phone call or a live video session — we’ll confirm what motivates you, your goals, and how property might fit inside super before anything else moves.",
        anchorId: "session-discovery",
        optionPhoneLabel: "Discovery phone call",
        optionZoomLabel: "Live video session",
        buttonLabel: "Send my preference",
      },
    },
    {
      id: "v4-smsf-trust",
      type: "smsf",
      props: {
        title: "Property and super — without the confusion",
        body:
          "Like leading SMSF property educators, we break the journey into clear stages. We’re not a substitute for your accountant or AFS licensee — we’re specialists who help trustees and their advisers line up strategy, property fit, and execution.",
        points: [
          "Understand concessional tax treatment and long-term compounding inside super — with your licensed adviser",
          "National inventory you can discuss with your team — not random portal scroll",
          "KPIs and property briefs so decisions stay deliberate, not emotional",
        ],
      },
    },
    {
      id: "v4-smsf-three-stages",
      type: "investorStrategy",
      props: {
        title: "Property investment — three clear stages",
        intro:
          "We simplify buying an investment property with an SMSF by breaking the journey into parts you can actually follow.",
        bullets: [
          "Discovery — we learn what drives you: goals, timeline, risk comfort, and what’s already inside your fund",
          "Research — together we shape an SMSF property strategy tailored to your facts (liquidity, contributions, borrowing if applicable)",
          "Strategy — we stress-test property briefs, yields, and growth assumptions so you and your advisers can act with clarity",
        ],
      },
    },
    {
      id: "v4-smsf-macro",
      type: "investorStrategy",
      props: {
        title: "Our research lens",
        intro:
          "Analysts weigh macro signals when narrowing markets — so property selection isn’t guesswork. Your licensed adviser still signs off on what suits your personal circumstances.",
        bullets: [
          "Population growth and demographics",
          "Infrastructure investment",
          "Employment statistics",
          "Rental yields",
          "Affordability",
          "Future housing supply",
        ],
      },
    },
    {
      id: "v4-smsf-access",
      type: "textImage",
      props: {
        title: "Property investment — Australia wide",
        body:
          "House and land, townhouses, apartments, and dual-income layouts where they suit fund strategy — short-listed to what your SMSF can realistically hold, with Fusion keeping listings and media current.",
        imageSide: "right",
        imageLabel: "Markets",
      },
    },
    {
      id: "v4-smsf-listings",
      type: "featuredListings",
      props: {
        title: "Opportunities to review with your adviser",
        anchorId: "listings",
      },
    },
    {
      id: "v4-smsf-lead-mid",
      type: "leadForm",
      props: {
        title: "Get in touch",
        description:
          "Request a property brief or ask a question about SMSF rules as they apply to you — production routes to Fusion CRM. This is not personal financial advice.",
        buttonLabel: "Submit enquiry",
      },
    },
    {
      id: "v4-smsf-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "The three-stage story made sense to my accountant and me — finally a site that didn’t skip discovery or pretend super property is one-size-fits-all.",
            author: "Greg H.",
            role: "SMSF trustee, Sydney",
          },
        ],
      },
    },
    {
      id: "v4-smsf-disclaimer",
      type: "textImage",
      props: {
        title: "Important information",
        body:
          "This communication is general in nature and does not constitute financial, tax, or superannuation advice. Consider your objectives and circumstances and consult a licensed financial adviser before making investment decisions. Property involves risk, including loss of capital. Any implied returns or examples on this demo site are illustrative only.",
        imageSide: "left",
        imageLabel: "Compliance",
      },
    },
    {
      id: "v4-smsf-lead-final",
      type: "leadForm",
      props: {
        title: "Book your free strategy call",
        description:
          "First name, contact details, and how you heard about us — we’ll respond to book a no-obligation strategy conversation. Demo form only in the builder.",
        buttonLabel: "Submit",
        anchorId: "strategy-call",
      },
    },
  ];

  return {
    id: newSiteId(),
    name: "SMSF Property Strategy",
    templateId: "smsfStrategy",
    publishStatus: "draft",
    branding: {
      siteName: "Summit SMSF Property",
      logo: "",
      primaryColor: "#1e3a5f",
      secondaryColor: "#c9a74a",
      phone: "+61 1300 000 176",
      email: "info@smsfproperty.example.com.au",
      colorScheme: "midnight",
      contentWidth: "default",
    },
    pages: replaceHomeSections(defaultPages(), homeSections),
  };
}

export function buildHighYieldCashFlowTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "v4-yield-hero",
      type: "hero",
      props: {
        headline: "Stronger cash flow. Clearer holding power.",
        subheadline:
          "Yield-led property for investors who want rental return you can model, vacancy risk you can see, and strategy-matched stock from a national pipeline — not random listings.",
        ctaLabel: "See yield opportunities",
        ctaHref: "#listings",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Model house and keys representing property investment",
        backdropOverlayStrength: 54,
      },
    },
    {
      id: "v4-yield-trust",
      type: "textImage",
      props: {
        title: "Built for income-focused investors",
        body:
          "If your plan depends on rent covering more of the holding cost, you need honest yield bands and tenant demand — not agent puff. We position as property advisors who stress-test cash flow before you inspect, and we connect leads back into Fusion CRM workflows.",
        imageSide: "right",
        imageLabel: "Yield",
      },
    },
    {
      id: "v4-yield-dual",
      type: "dualKey",
      props: {
        title: "Dual-key, duplex, and multi-income layouts",
        body:
          "When design matches local tenant pools, two incomes from one title can lift net yield and smooth vacancy — house and land, townhouses, apartments, duplex, and co-living angles where zoning and demand support it.",
        bullets: [
          "Comparable rents for each dwelling",
          "Holding cost vs rental income — plain numbers",
          "Exit liquidity when your strategy changes",
        ],
      },
    },
    {
      id: "v4-yield-access",
      type: "textImage",
      props: {
        title: "Australia-wide pipeline — strategy matched",
        body:
          "Access to thousands of new properties: dual occupancy, duplex, townhouses, apartments, and high-yield corridors — curated so income story and location line up with your brief.",
        imageSide: "left",
        imageLabel: "Pipeline",
      },
    },
    {
      id: "v4-yield-listings",
      type: "featuredListings",
      props: { title: "Income-led opportunities (live Fusion data)" },
    },
    {
      id: "v4-yield-strategy",
      type: "investorStrategy",
      props: {
        title: "What we model before you commit",
        intro:
          "Rental return bands, rate shocks, depreciation where relevant, and leverage that still leaves room to sleep — benefit-led, visual, and simple enough to act on.",
        bullets: [
          "Cash flow first — growth as a secondary lens where it fits",
          "Vacancy and letting scenarios you can understand quickly",
          "Portfolio fit vs your buffers — no brochure filler",
        ],
      },
    },
    {
      id: "v4-yield-process",
      type: "textImage",
      props: {
        title: "Four steps — less friction, more clarity",
        body:
          "Book a strategy session → get matched with yield-appropriate properties → secure with clear due diligence → refine your portfolio over time. Every page pushes toward enquiry or booking — conversion-first by design.",
        imageSide: "right",
        imageLabel: "Process",
      },
    },
    {
      id: "v4-yield-lead-mid",
      type: "leadForm",
      props: {
        title: "Get the income-focused shortlist",
        description: "Tell us your yield and location comfort — we’ll respond with next steps.",
        buttonLabel: "Email me options",
      },
    },
    {
      id: "v4-yield-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "We finally saw yield numbers that weren’t fantasy. The dual-key option stacked up on paper before we drove an hour to inspect.",
            author: "Alex T.",
            role: "Yield investor, QLD",
          },
        ],
      },
    },
    {
      id: "v4-yield-lead-final",
      type: "leadForm",
      props: {
        title: "Book a yield strategy session",
        description: "Cash flow, income, and holding power — locked in with a structured call.",
        buttonLabel: "Book session",
      },
    },
  ];

  return {
    id: newSiteId(),
    name: "High Yield / Cash Flow Property",
    templateId: "highYield",
    publishStatus: "draft",
    branding: {
      siteName: "Yield Property Advisory",
      logo: "",
      primaryColor: "#166534",
      secondaryColor: "#ca8a04",
      phone: "+61 400 777 888",
      email: "yield@property.example.com",
      colorScheme: "sage",
      contentWidth: "default",
    },
    pages: replaceHomeSections(defaultPages(), homeSections),
  };
}

/** Layout flow inspired by full-service property consultancies (featured hero, services, multi-band listings). */
export function buildPositiveCashflowAgencyTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "pcf-hero",
      type: "hero",
      props: {
        variant: "agencyPortal",
        headline: "Positive cashflow — dual occ, duplex, co-living & specialist housing.",
        subheadline:
          "We focus on dual occupancy, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA). Gross return, yield, vacancy, and tenant demand — stress-tested before you enquire.",
        ctaLabel: "Search listings",
        ctaHref: "#listings",
        spotlightLabel: "Featured opportunity",
        spotlightTitle: "Lot 1 — The Hills — Highgate Hill",
        spotlightPrice: "$1,625,000",
        spotlightLocation: "Highgate Hill, Brisbane, QLD 4101",
        spotlightBeds: "4",
        spotlightBaths: "2",
        spotlightCars: "2",
        strategyTags: [
          "Dual occ",
          "Dual key",
          "Dual living",
          "Duplex",
          "Co-living",
          "Rooming house",
          "NDIS / SDA",
        ],
        backdropImageUrl:
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Contemporary home exterior with clean lines",
        backdropOverlayStrength: 48,
      },
    },
    {
      id: "pcf-featured",
      type: "featuredListings",
      props: {
        title: "Strongest yields — dual-income & specialist layouts",
        anchorId: "listings",
        sortByRentYieldDesc: true,
        preferCachedTopYield: true,
        maxItems: 6,
        yieldRankingScanPages: 500,
        minRentYieldPercent: 5,
        sampleDisclaimer:
          "These six listings are the highest gross / rent yield picks from your Fusion catalogue (minimum 5% p.a.), refreshed on a schedule you control — not re-scanned on every page view. Commit or deploy `data/top-yield-picks.json` after running the refresh step so visitors see them instantly. Browse all listings for the full inventory.",
      },
    },
    {
      id: "pcf-session",
      type: "sessionInterest",
      props: {
        title: "Talk to a specialist",
        description:
          "Prefer a quick call or a live walkthrough? Tell us how to reach you — we’ll lock in a time to match opportunities to your brief.",
        anchorId: "session-interest",
        optionPhoneLabel: "Phone call",
        optionZoomLabel: "Live video session",
        buttonLabel: "Send my preference",
      },
    },
    {
      id: "pcf-consulting",
      type: "textImage",
      props: {
        title: "Consulting for multi-income & specialist housing",
        body:
          "Dual occupancy, dual key, and dual living designs; duplex and side-by-side pairs; co-living and rooming-house income; and NDIS Specialist Disability Accommodation (SDA) where the subsidy stack fits your brief. We stress-test zoning, tenancy mix, and exit before you commit.",
        imageSide: "right",
        imageLabel: "Consulting",
      },
    },
    {
      id: "pcf-services",
      type: "investorStrategy",
      props: {
        title: "How we support each deal",
        intro:
          "From dual occ and duplex through to rooming houses and NDIS (SDA) — feasibility, planning, approvals coordination, and project oversight so income assumptions meet reality.",
        bullets: [
          "Dual occ, dual key & dual living — design fit, covenant checks, and dual rent-line scenarios",
          "Duplex & multi-dwelling — subdivision pathway, holding cost, and lease-up sequencing",
          "Co-living & rooming houses — demand, licensing context, and operating complexity vs gross yield",
          "NDIS (SDA) — design category, participant demand signals, and adviser-ready next steps",
        ],
      },
    },
    {
      id: "pcf-states",
      type: "textImage",
      props: {
        title: "Discover listings by state",
        body:
          "Browse NSW, QLD, VIC, SA, WA, and the ACT for dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA) — filtered so strategy tags match the structure you are actually underwriting.",
        imageSide: "left",
        imageLabel: "Coverage",
      },
    },
    {
      id: "pcf-smsf",
      type: "smsf",
      props: {
        title: "NDIS (SDA) & disability housing investment",
        body:
          "Specialist Disability Accommodation pairs design categories, eligible tenants, and government funding inputs with long-dated income. We help you qualify opportunities and line up the right licensed advisers — we don’t substitute for plan management, legal, or tax advice.",
        points: [
          "Shortlists aligned to SDA design category, location, and builder pathway",
          "Plain-language demand and subsidy context before you model returns",
          "Clear hand-off to your specialist SDA, legal, and accounting team",
        ],
      },
    },
    {
      id: "pcf-smsf-list",
      type: "featuredListings",
      props: {
        title: "NDIS (SDA) opportunities from our network",
      },
    },
    {
      id: "pcf-coliving",
      type: "dualKey",
      props: {
        title: "Duplex, dual key, co-living & rooming houses",
        body:
          "Two rent lines from one title — or several from a compliant rooming-house or co-living layout — can lift gross yield when jobs, education, and infrastructure support tenant churn. We compare these structures alongside dual occ, dual living, and NDIS (SDA) so you don’t optimise one line item and miss the holding story.",
        bullets: [
          "Independent living zones vs shared facilities — how leases and outgoings behave",
          "Rooming-house and co-living — licensing, operations, and realistic vacancy",
          "Duplex and dual key — exit liquidity, appraisal method, and lender talking points",
        ],
      },
    },
    {
      id: "pcf-colist",
      type: "featuredListings",
      props: {
        title: "Co-living, rooming-house & dual-income picks",
      },
    },
    {
      id: "pcf-services-band",
      type: "textImage",
      props: {
        title: "Our services",
        body:
          "Acquisition and development consulting for dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA) — data-backed research and listings matched to the structure you are underwriting.",
        imageSide: "right",
        imageLabel: "Services",
      },
    },
    {
      id: "pcf-victory",
      type: "investorStrategy",
      props: {
        title: "What investors see before they enquire",
        intro:
          "Independent-style research cues, infrastructure and demographic context, and rental metrics — presented so you can compare apples to apples.",
        bullets: [
          "Gross return, yield, capital growth, and vacancy callouts where data exists",
          "Strategy tags: dual occ, dual key, dual living, duplex, co-living, rooming house, NDIS (SDA)",
          "Shortlists matched to budget, state, and income goals — not generic spam",
        ],
      },
    },
    {
      id: "pcf-lead-mid",
      type: "leadForm",
      props: {
        title: "Get a curated shortlist",
        description:
          "Share state, price band, yield comfort, and whether you want dual occ, duplex, co-living, rooming-house, or NDIS (SDA) stock — we reply with next steps. Production sites connect enquiries to Fusion CRM.",
        buttonLabel: "Request matches",
      },
    },
    {
      id: "pcf-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "Featured yield strip, NDIS (SDA) explainer, and duplex / co-living education — reads like a national desk but it’s our brand and pipeline.",
            author: "Sam K.",
            role: "Property investor, Brisbane",
          },
        ],
      },
    },
    {
      id: "pcf-lead-final",
      type: "leadForm",
      props: {
        title: "Call or enquire today",
        description: "Prefer the phone? Use the header number — or leave details and we’ll respond within one business day.",
        buttonLabel: "Enquire now",
      },
    },
  ];

  const listingsSections: SectionConfig[] = [
    {
      id: "pcf-list-hero",
      type: "hero",
      props: {
        headline: "Search property listings",
        subheadline:
          "Filter by location, rental return, and the structures we specialise in — dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA). By default we emphasise listings at 5% gross / yield or higher. Live data comes from your Fusion feed.",
        ctaLabel: "Call the team",
        ctaHref: "tel:1800508010",
      },
    },
    {
      id: "pcf-list-grid",
      type: "featuredListings",
      props: {
        title: "All active opportunities",
        anchorId: "listings",
        yieldBandFilter: {
          floorPercent: 5,
          defaultBand: "atLeast",
        },
        sampleDisclaimer:
          "We focus this site on positive cashflow through dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA). By default you’ll see listings with gross / rental return of at least 5% p.a. Use the rental return filter to browse under 5% or every listing on this page.",
      },
    },
    {
      id: "pcf-list-strategy",
      type: "investorStrategy",
      props: {
        title: "Invest with clarity",
        intro:
          "We combine listings with scenario-friendly numbers — so you’re not guessing about income, vacancy, or holding power on dual-income and specialist layouts.",
        bullets: [
          "Compare gross return bands across regions",
          "Dual occ, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA) in one workflow",
          "Trust or personal name — structure questions surfaced early with your licensed advisers",
        ],
      },
    },
    {
      id: "pcf-list-lead",
      type: "leadForm",
      props: {
        title: "Can’t find what you need?",
        description:
          "Ask for an off-market style shortlist matched to dual occ, duplex, co-living, rooming-house, or NDIS (SDA) goals.",
        buttonLabel: "Email me options",
      },
    },
  ];

  const aboutSections: SectionConfig[] = [
    {
      id: "pcf-about-intro",
      type: "textImage",
      props: {
        title: "About us",
        body:
          "We specialise in positive cashflow through dual occupancy, dual key, dual living, duplex, co-living, rooming houses, and NDIS (SDA) — for investors who want a consultancy partner, not a spray-and-pray listing dump.",
        imageSide: "right",
        imageLabel: "Team",
      },
    },
    {
      id: "pcf-about-research",
      type: "investorStrategy",
      props: {
        title: "Research & due diligence",
        intro:
          "We work with independent research inputs for area selection, demographics, infrastructure, and market checks — so strategy and listings align.",
        bullets: [
          "Suburb fundamentals and growth corridor context",
          "Tenant demand and vacancy indicators",
          "Transparent next steps with your broker, accountant, and planner",
        ],
      },
    },
    {
      id: "pcf-about-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "Finally a site that reads like a national consultancy — duplex, dual occ, NDIS (SDA), rooming houses — without losing our local voice.",
            author: "Elena M.",
            role: "Buyer's advocate, Sydney",
          },
        ],
      },
    },
  ];

  const contactSections: SectionConfig[] = [
    {
      id: "pcf-contact-hero",
      type: "hero",
      props: {
        headline: "Contact us",
        subheadline:
          "Need help choosing between dual occ, duplex, co-living, rooming-house, or NDIS (SDA) stock? We typically respond within one business day.",
        ctaLabel: "Call 1800 50 80 10",
        ctaHref: "tel:1800508010",
      },
    },
    {
      id: "pcf-contact-form",
      type: "leadForm",
      props: {
        title: "Send a message",
        description: "Demo form in the builder; production connects to your enquiry workflow.",
        buttonLabel: "Submit",
      },
    },
  ];

  let pages = defaultPages();
  pages = replacePageSections(pages, "home", homeSections);
  pages = replacePageSections(pages, "listings", listingsSections);
  pages = replacePageSections(pages, "about", aboutSections);
  pages = replacePageSections(pages, "contact", contactSections);

  return {
    id: newSiteId(),
    name: "Positive cashflow agency",
    templateId: "positiveCashflow",
    publishStatus: "draft",
    branding: {
      siteName: "Positive Cashflow Property",
      logo: "",
      primaryColor: "#0f766e",
      secondaryColor: "#0e7490",
      phone: "+61 1800 508 010",
      email: "hello@positivecashflow.example.com.au",
      colorScheme: "light",
      contentWidth: "wide",
    },
    pages,
  };
}

export function buildDualIncomeInvestmentPortalTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "dip-hero",
      type: "hero",
      props: {
        headline: "Australia’s trusted place to discover\nhigh-yielding investment property",
        subheadline:
          "Turnkey and new-build opportunities with gross return and yield in view — from co-living and dual key to duplex, dual occupancy, house & land, and SMSF-suitable stock. Built for investors who want clarity before they enquire.",
        ctaLabel: "Search listings",
        ctaHref: "#listings",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Sunlit open-plan interior with large windows",
        backdropOverlayStrength: 56,
      },
    },
    {
      id: "dip-categories",
      type: "textImage",
      props: {
        title: "High-yielding property types in one portal",
        body:
          "Explore co-living and rooming-house layouts, dual-key and dual occupancy designs, duplex and side-by-side pairs, terraces and townhouses, apartments, display stock, regional packages, rental-guarantee campaigns, NDIS / SDA, SMSF-friendly stock, and traditional house & land — each positioned for investor decisions, not owner-occupier fluff.",
        imageSide: "right",
        imageLabel: "Categories",
      },
    },
    {
      id: "dip-featured",
      type: "featuredListings",
      props: {
        title: "Featured properties",
        anchorId: "listings",
      },
    },
    {
      id: "dip-dual",
      type: "dualKey",
      props: {
        title: "Dual income, two rent lines, one strategy",
        body:
          "When layout, zoning, and tenant demand align, two incomes from one title can lift net yield and smooth vacancy — dual key, duplex, dual occupancy, and co-living angles where the numbers stack.",
        bullets: [
          "Comparable rents and gross yield for each dwelling or tenancy",
          "Holding cost vs income — plain scenarios before you inspect",
          "Exit and liquidity when your portfolio plan changes",
        ],
      },
    },
    {
      id: "dip-pipeline",
      type: "textImage",
      props: {
        title: "National pipeline, short-listed to your brief",
        body:
          "Access investor-grade stock across QLD, NSW, VIC, WA, SA, and growth corridors — filtered for yield bands, tenant profiles, and the structures that fit your lending and tax facts (always with your licensed advisers).",
        imageSide: "left",
        imageLabel: "Pipeline",
      },
    },
    {
      id: "dip-strategy",
      type: "investorStrategy",
      props: {
        title: "What we stress-test with you",
        intro:
          "Capital growth, vacancy, gross return, and yield — in language you can use with your broker and accountant. No hype; just the inputs serious investors expect before a holding decision.",
        bullets: [
          "Postcode vacancy and rental demand context",
          "Depreciation and turnkey scenarios where relevant",
          "Portfolio fit vs buffers — not a one-size brochure",
        ],
      },
    },
    {
      id: "dip-lead-mid",
      type: "leadForm",
      props: {
        title: "Get matched listings off-market style",
        description:
          "Tell us state, price band, and yield comfort — we’ll follow up with next steps. Production sites route enquiries to Fusion CRM.",
        buttonLabel: "Request matches",
      },
    },
    {
      id: "dip-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "Finally a portal tone that feels institutional — yield and vacancy upfront, and dual occupancy wasn’t mixed up with duplex. We booked a call the same day.",
            author: "Priya & Lee",
            role: "Investors, Sydney",
          },
        ],
      },
    },
    {
      id: "dip-lead-final",
      type: "leadForm",
      props: {
        title: "Talk to a property specialist",
        description: "Book a consultation or ask for a shortlist matched to your goals.",
        buttonLabel: "Enquire now",
      },
    },
  ];

  const listingsSections: SectionConfig[] = [
    {
      id: "dip-list-hero",
      type: "hero",
      props: {
        headline: "Search high-yielding\ninvestment listings",
        subheadline:
          "Refine by location, property type, and strategy. Live data comes from your Fusion feed; filters help investors scan faster.",
        ctaLabel: "Call the team",
        ctaHref: "tel:+611300000000",
      },
    },
    {
      id: "dip-list-grid",
      type: "featuredListings",
      props: {
        title: "All active opportunities",
        anchorId: "listings",
      },
    },
    {
      id: "dip-list-dual",
      type: "dualKey",
      props: {
        title: "Why dual-income layouts matter",
        body:
          "Separate leases, clearer rent reviews, and tenant pools that don’t overlap — when it fits the suburb, two income streams can outperform a single-tenant house on paper.",
        bullets: ["Independent living zones", "Vacancy spread across two tenancies", "Suited to corridor cities with jobs growth"],
      },
    },
    {
      id: "dip-list-lead",
      type: "leadForm",
      props: {
        title: "Can’t find what you need?",
        description: "Request a curated shortlist — we’ll align options to your numbers.",
        buttonLabel: "Email me options",
      },
    },
  ];

  const aboutSections: SectionConfig[] = [
    {
      id: "dip-about-story",
      type: "textImage",
      props: {
        title: "Why investors work with us",
        body:
          "Dedicated project pathway, independent rental assessments where available, turnkey and new-build quality, direct builder relationships, and tax-aware depreciation on new stock — aligned to how leading investment portals present value (without the noise).",
        imageSide: "right",
        imageLabel: "Team",
      },
    },
    {
      id: "dip-about-strategy",
      type: "investorStrategy",
      props: {
        title: "Institutional clarity, not agent puff",
        intro:
          "We’re not here to flood you with facades. You get scenario-friendly numbers, next steps with licensed partners, and listings matched to strategy.",
        bullets: [
          "SMSFs, trusts, and personal names — we flag structure questions early",
          "Regional and metro — both when the yield story is honest",
          "Every page pushes toward enquiry or booking",
        ],
      },
    },
    {
      id: "dip-about-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote: "The site reads like the majors — Featured blocks, categories, and yield callouts — but it’s our brand and our CRM.",
            author: "Marcus V.",
            role: "Buyer’s agent, Melbourne",
          },
        ],
      },
    },
  ];

  const contactSections: SectionConfig[] = [
    {
      id: "dip-contact-hero",
      type: "hero",
      props: {
        headline: "Have a question or want a consultation?",
        subheadline: "Leave your details — we typically respond within one business day.",
        ctaLabel: "Call us",
        ctaHref: "tel:+611300000000",
      },
    },
    {
      id: "dip-contact-form",
      type: "leadForm",
      props: {
        title: "Send a message",
        description: "Demo form in the builder; production connects to your enquiry workflow.",
        buttonLabel: "Submit",
      },
    },
  ];

  let pages = defaultPages();
  pages = replacePageSections(pages, "home", homeSections);
  pages = replacePageSections(pages, "listings", listingsSections);
  pages = replacePageSections(pages, "about", aboutSections);
  pages = replacePageSections(pages, "contact", contactSections);

  return {
    id: newSiteId(),
    name: "Investment property portal",
    templateId: "dualIncome",
    publishStatus: "draft",
    branding: {
      siteName: "Investment Property Portal",
      logo: "",
      primaryColor: "#b45309",
      secondaryColor: "#1e3a8a",
      phone: "+61 1300 000 000",
      email: "invest@propertyportal.example.com",
      colorScheme: "warm",
      contentWidth: "wide",
    },
    pages,
  };
}

export function buildNdisPropertiesTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "ndis-hero",
      type: "hero",
      props: {
        headline: "Invest in Specialist Disability Accommodation — with clarity.",
        subheadline:
          "SDA-approved designs, participant demand, and long-dated income in one view. We connect serious investors and mission-aligned buyers to Fusion-listed opportunities — then you confirm structure and compliance with your licensed advisers.",
        ctaLabel: "View SDA opportunities",
        ctaHref: "#listings",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Accessible contemporary home exterior",
        backdropOverlayStrength: 48,
      },
    },
    {
      id: "ndis-featured",
      type: "featuredListings",
      props: {
        title: "Featured SDA & disability housing",
        anchorId: "listings",
        hideListingFilters: true,
        maxItems: 6,
        showSampleDisclaimer: true,
        sampleDisclaimer:
          "Sample stock from your Fusion catalogue — tag or filter NDIS / SDA stock in production. Ask us for a shortlist matched to design category, location, and participant pipeline.",
      },
    },
    {
      id: "ndis-session",
      type: "sessionInterest",
      props: {
        title: "Talk to an SDA specialist",
        description:
          "Book a discovery call or video session — we’ll outline how opportunities fit your portfolio and when to involve plan managers, OTs, and silvers.",
        anchorId: "session-interest",
        optionPhoneLabel: "Phone call",
        optionZoomLabel: "Live video session",
        buttonLabel: "Send my preference",
      },
    },
    {
      id: "ndis-sda-checklist",
      type: "smsf",
      props: {
        title: "What serious SDA investors stress-test first",
        body:
          "Specialist Disability Accommodation sits at the intersection of housing, health policy, and specialist finance. We help you qualify the property story upfront — not replace legal, tax, or plan-management advice.",
        points: [
          "Design category, build quality, and location vs participant demand",
          "Lease structure, SIL / provider context, and arm’s-length discipline",
          "Funding settings and sensitivity work you’ll want modelled with qualified professionals",
        ],
      },
    },
    {
      id: "ndis-strategy",
      type: "investorStrategy",
      props: {
        title: "SDA design categories & yield levers",
        intro:
          "From improved liveability to high physical support — each category carries different construction norms, subsidies, and participant fit. We surface the listing metadata that matters for your underwriting pack.",
        bullets: [
          "Plain-language mapping from prospectus language to design category",
          "Holding cost and lease-up scenarios — without promising outcomes",
          "Introductions to partners who live in SDA compliance day-to-day",
        ],
      },
    },
    {
      id: "ndis-dual",
      type: "dualKey",
      props: {
        title: "Why SDA can sit alongside a broader cashflow portfolio",
        body:
          "Long-lease specialty housing can diversify income streams when matched to policy settings and participant need — we help you compare SDA opportunities to dual occ, co-living, or vanilla investment stock on the same Fusion feed.",
        bullets: [
          "Income profile vs multi-tenancy residential plays",
          "Capital intensity and exit liquidity — flagged early",
          "Portfolio fit when super, trust, or personal name is in play",
        ],
      },
    },
    {
      id: "ndis-second-list",
      type: "featuredListings",
      props: {
        title: "More disability housing from our network",
      },
    },
    {
      id: "ndis-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "Finally an SDA-leaning site that doesn’t over-promise subsidy — checklist, categories, and listings in one flow.",
            author: "Jordan T.",
            role: "Private investor, Melbourne",
          },
        ],
      },
    },
    {
      id: "ndis-lead",
      type: "leadForm",
      props: {
        title: "Request a participant-aligned shortlist",
        description: "Tell us design category, state, and ticket size — production connects to Fusion CRM.",
        buttonLabel: "Enquire now",
      },
    },
  ];

  const listingsSections: SectionConfig[] = [
    {
      id: "ndis-list-hero",
      type: "hero",
      props: {
        headline: "Search NDIS & SDA listings",
        subheadline:
          "Filter by location, yield, and property type. Live data comes from your Fusion feed; tag SDA stock so investors can find it quickly.",
        ctaLabel: "Call the team",
        ctaHref: "tel:+611800000000",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Property documents and keys",
        backdropOverlayStrength: 50,
      },
    },
    {
      id: "ndis-list-grid",
      type: "featuredListings",
      props: {
        title: "All active opportunities",
        anchorId: "listings",
        sampleDisclaimer: "Use Fusion filters and tags to highlight NDIS / SDA inventory for this audience.",
      },
    },
    {
      id: "ndis-list-lead",
      type: "leadForm",
      props: {
        title: "Need help shortlisting?",
        description: "We’ll align options to your design category and location brief.",
        buttonLabel: "Email me options",
      },
    },
  ];

  const aboutSections: SectionConfig[] = [
    {
      id: "ndis-about-intro",
      type: "textImage",
      props: {
        title: "About our SDA focus",
        body:
          "We work with investors, family offices, and builders who want disability housing done properly — sharp information, respectful tone, and listings that reflect real pipeline rather than brochure fantasy.",
        imageSide: "right",
        imageLabel: "Team",
      },
    },
    {
      id: "ndis-about-values",
      type: "investorStrategy",
      props: {
        title: "What guides us",
        intro: "Participant outcomes and investor diligence both matter — we don’t trade one off for the other.",
        bullets: [
          "Transparent limits on what we can say about demand and subsidies",
          "Early escalation to licensed advisers for structure and compliance",
          "Fusion-backed listings so availability stays defensible",
        ],
      },
    },
  ];

  const contactSections: SectionConfig[] = [
    {
      id: "ndis-contact-hero",
      type: "hero",
      props: {
        headline: "Contact us",
        subheadline:
          "Questions on a listing, design category, or adviser introduction? We typically respond within one business day.",
        ctaLabel: "Call now",
        ctaHref: "tel:+611800000000",
      },
    },
    {
      id: "ndis-contact-form",
      type: "leadForm",
      props: {
        title: "Send a message",
        description: "Demo form in the builder; production connects to your enquiry workflow.",
        buttonLabel: "Submit",
      },
    },
  ];

  let pages = defaultPages();
  pages = replacePageSections(pages, "home", homeSections);
  pages = replacePageSections(pages, "listings", listingsSections);
  pages = replacePageSections(pages, "about", aboutSections);
  pages = replacePageSections(pages, "contact", contactSections);

  return {
    id: newSiteId(),
    name: "NDIS Properties",
    templateId: "ndisProperties",
    publishStatus: "draft",
    branding: {
      siteName: "Clarity SDA Property",
      logo: "",
      primaryColor: "#0369a1",
      secondaryColor: "#7c3aed",
      phone: "+61 1800 000 000",
      email: "hello@claritysda.example.com.au",
      colorScheme: "light",
      contentWidth: "wide",
    },
    pages,
  };
}

type ConsumerRealEstatePortalSpec = {
  templateId: Extract<SiteTemplateId, "lifestyleCorridors" | "realEstateTheme2" | "realEstateTheme3">;
  configName: string;
  sectionPrefix: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  colorScheme: SiteColorScheme;
  homeHero: {
    headline: string;
    subheadline: string;
    backdropImageUrl: string;
    backdropImageAlt: string;
    backdropOverlayStrength: number;
  };
  picksDisclaimer: string;
  steps: { title: string; intro: string; bullets: [string, string, string] };
  trust: { title: string; body: string };
  testimonial: { quote: string; author: string; role: string };
  listHero: {
    headline: string;
    subheadline: string;
    backdropImageUrl: string;
    backdropImageAlt: string;
    backdropOverlayStrength: number;
  };
  listDisclaimer: string;
  aboutIntro: { title: string; body: string };
  aboutValues: { title: string; intro: string; bullets: [string, string, string] };
  contactHero: { headline: string; subheadline: string };
};

/** Consumer search-forward layout (Zillow-style). Themes 1–3 differ by palette, section ids, and demo copy. */
function buildConsumerRealEstatePortal(spec: ConsumerRealEstatePortalSpec): SiteConfig {
  const p = spec.sectionPrefix;
  const tel = `tel:${spec.phone.replace(/[^\d+]/g, "")}`;

  const homeSections: SectionConfig[] = [
    {
      id: `${p}-home-hero`,
      type: "hero",
      props: {
        headline: spec.homeHero.headline,
        subheadline: spec.homeHero.subheadline,
        ctaLabel: "See what’s for sale",
        ctaHref: "#listings",
        backdropImageUrl: spec.homeHero.backdropImageUrl,
        backdropImageAlt: spec.homeHero.backdropImageAlt,
        backdropOverlayStrength: spec.homeHero.backdropOverlayStrength,
      },
    },
    {
      id: `${p}-home-picks`,
      type: "featuredListings",
      props: {
        title: "Homes you may like",
        anchorId: "listings",
        hideListingFilters: true,
        maxItems: 6,
        showSampleDisclaimer: true,
        sampleDisclaimer: spec.picksDisclaimer,
      },
    },
    {
      id: `${p}-home-steps`,
      type: "investorStrategy",
      props: {
        title: spec.steps.title,
        intro: spec.steps.intro,
        bullets: [...spec.steps.bullets],
      },
    },
    {
      id: `${p}-home-trust`,
      type: "textImage",
      props: {
        title: spec.trust.title,
        body: spec.trust.body,
        imageSide: "right",
        imageLabel: "Neighbourhood",
      },
    },
    {
      id: `${p}-home-proof`,
      type: "testimonial",
      props: {
        items: [
          {
            quote: spec.testimonial.quote,
            author: spec.testimonial.author,
            role: spec.testimonial.role,
          },
        ],
      },
    },
    {
      id: `${p}-home-alerts`,
      type: "leadForm",
      props: {
        title: "Get new listing alerts",
        description:
          "Tell us your suburbs and price band — we’ll let you know when something similar hits the pipeline.",
        buttonLabel: "Notify me",
      },
    },
  ];

  const listingsSections: SectionConfig[] = [
    {
      id: `${p}-list-hero`,
      type: "hero",
      props: {
        headline: spec.listHero.headline,
        subheadline: spec.listHero.subheadline,
        ctaLabel: "Talk to an agent",
        ctaHref: tel,
        backdropImageUrl: spec.listHero.backdropImageUrl,
        backdropImageAlt: spec.listHero.backdropImageAlt,
        backdropOverlayStrength: spec.listHero.backdropOverlayStrength,
      },
    },
    {
      id: `${p}-list-grid`,
      type: "featuredListings",
      props: {
        title: "All homes for sale",
        anchorId: "listings",
        sampleDisclaimer: spec.listDisclaimer,
      },
    },
    {
      id: `${p}-list-lead`,
      type: "leadForm",
      props: {
        title: "Want a curated shortlist?",
        description: "Share your must-haves and we’ll come back with options that fit — no spam.",
        buttonLabel: "Email me options",
      },
    },
  ];

  const aboutSections: SectionConfig[] = [
    {
      id: `${p}-about-intro`,
      type: "textImage",
      props: {
        title: spec.aboutIntro.title,
        body: spec.aboutIntro.body,
        imageSide: "right",
        imageLabel: "Team",
      },
    },
    {
      id: `${p}-about-values`,
      type: "investorStrategy",
      props: {
        title: spec.aboutValues.title,
        intro: spec.aboutValues.intro,
        bullets: [...spec.aboutValues.bullets],
      },
    },
  ];

  const contactSections: SectionConfig[] = [
    {
      id: `${p}-contact-hero`,
      type: "hero",
      props: {
        headline: spec.contactHero.headline,
        subheadline: spec.contactHero.subheadline,
        ctaLabel: "Call now",
        ctaHref: tel,
      },
    },
    {
      id: `${p}-contact-form`,
      type: "leadForm",
      props: {
        title: "Send a message",
        description: "Demo form in the builder; production wires to your enquiry workflow.",
        buttonLabel: "Submit",
        anchorId: "enquiry",
      },
    },
  ];

  let pages = defaultPages();
  pages = replacePageSections(pages, "home", homeSections);
  pages = replacePageSections(pages, "listings", listingsSections);
  pages = replacePageSections(pages, "about", aboutSections);
  pages = replacePageSections(pages, "contact", contactSections);

  return {
    id: newSiteId(),
    name: spec.configName,
    templateId: spec.templateId,
    publishStatus: "draft",
    branding: {
      siteName: spec.siteName,
      logo: "",
      primaryColor: spec.primaryColor,
      secondaryColor: spec.secondaryColor,
      phone: spec.phone,
      email: spec.email,
      colorScheme: spec.colorScheme,
      contentWidth: "wide",
    },
    pages,
  };
}

export function buildLifestyleCorridorsPortalTemplate(): SiteConfig {
  return buildConsumerRealEstatePortal({
    templateId: "lifestyleCorridors",
    configName: "Real Estate Theme 1",
    sectionPrefix: "pex",
    siteName: "Horizon Homes",
    primaryColor: "#2563eb",
    secondaryColor: "#0ea5e9",
    phone: "+61 1800 000 000",
    email: "hello@horizonhomes.example.com.au",
    colorScheme: "light",
    homeHero: {
      headline: "Find a home you’ll love.",
      subheadline:
        "Browse new and established homes across growth corridors and lifestyle pockets. Search by location and property type — your live Fusion feed keeps photos, prices, and yield callouts fresh.",
      backdropImageUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
      backdropImageAlt: "Modern suburban home exterior with driveway and lawn",
      backdropOverlayStrength: 42,
    },
    picksDisclaimer:
      "A rotating sample from your catalogue — many more homes are available. Ask us for a shortlist matched to budget, schools, commute, or investment goals.",
    steps: {
      title: "How buying with us works",
      intro:
        "We keep the path predictable: explore online first, then talk to a human when you’re ready — no pressure tours, no mystery fees.",
      bullets: [
        "Search and save favourites from your Fusion-powered catalogue",
        "Book a call or inspection when a floor plan, catchment, or yield band fits your brief",
        "We coordinate paperwork introductions — lending, conveyancing, and tax questions go to licensed partners",
      ],
    },
    trust: {
      title: "Local insight, national inventory",
      body:
        "Whether you’re upsizing near better schools, relocating for work, or adding a growth-corridor asset, we combine on-the-ground context with access to stock you won’t see scattered across generic portals alone.",
    },
    testimonial: {
      quote:
        "The photos and price transparency upfront saved us weekends of guesswork. We shortlisted three homes from the site before we ever lined up an inspection.",
      author: "Priya K.",
      role: "Relocation buyer, Brisbane",
    },
    listHero: {
      headline: "Search all listings",
      subheadline:
        "Use filters to narrow price, type, and rental return. Every card opens full project detail — ideal for comparing yield, location, and holding costs side by side.",
      backdropImageUrl:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2400&q=80",
      backdropImageAlt: "House keys and small model home on desk",
      backdropOverlayStrength: 50,
    },
    listDisclaimer:
      "Listings sync from your Fusion API. Refine with search and filters — this page is your full active inventory view.",
    aboutIntro: {
      title: "About our team",
      body:
        "We’re property advisors who believe browsing should feel as confident as chatting at an open home. Our sites foreground the numbers and imagery investors and movers need — then we pick up the conversation when you’re ready.",
    },
    aboutValues: {
      title: "What guides us",
      intro: "Clear information, honest framing, and workflows that respect your time.",
      bullets: [
        "Fusion-backed data so pricing and yield cues stay current",
        "No bait-and-switch — if a stock doesn’t suit your facts, we say so early",
        "Partners for finance and legal when you need licensed advice beyond property selection",
      ],
    },
    contactHero: {
      headline: "Talk to us",
      subheadline:
        "Buying, renting, or selling — tell us what you need. Use the form below for rentals, appraisal requests, or general enquiries.",
    },
  });
}

/** Theme 2 — consumer portal patterned on sites like [Woodards](https://www.woodards.com.au/): trust, network, suburbs, buy/sell/rent. Demo names and colours only. */
export function buildRealEstateTheme2PortalTemplate(): SiteConfig {
  return buildConsumerRealEstatePortal({
    templateId: "realEstateTheme2",
    configName: "Real Estate Theme 2",
    sectionPrefix: "ret2",
    siteName: "Heritage Property Network",
    primaryColor: "#1a3a2f",
    secondaryColor: "#b8945a",
    phone: "+61 1800 741 020",
    email: "hello@heritageproperty.example.com.au",
    colorScheme: "warm",
    homeHero: {
      headline: "Connecting people with property.",
      subheadline:
        "We know people. We know property. Explore buy, rent, and sold stock across our office network — your live Fusion feed keeps imagery, pricing, and yield cues as current as your team.",
      backdropImageUrl:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80",
      backdropImageAlt: "Elegant family home facade with established garden",
      backdropOverlayStrength: 46,
    },
    picksDisclaimer:
      "A spotlight from your catalogue — like a market snapshot for the web. Many more homes sit behind search; ask for suburbs, school zones, or off-portal stock.",
    steps: {
      title: "Buy, sell, rent — with clarity",
      intro:
        "The same pathways serious agencies publish online: start with search, narrow with filters, then talk to the right desk when you’re ready.",
      bullets: [
        "Buy — shortlist from your Fusion-powered inventory with beds, baths, cars, price, and type in view",
        "Rent & sell — route enquiries and appraisal requests through contact so the right team responds fast",
        "Stay informed — listing alerts for movers who want the next match before it’s gone",
      ],
    },
    trust: {
      title: "Love your neighbourhood",
      body:
        "Suburb character, amenities, and commute reality matter as much as facade photos. We pair local insight with depth of stock — so buyers and investors aren’t guessing from a headline alone.",
    },
    testimonial: {
      quote:
        "It felt like the major agencies — connecting people with property — but every card was our pipeline from Fusion, not a stale PDF.",
      author: "Danielle M.",
      role: "Vendor & repeat buyer, Melbourne inner-east",
    },
    listHero: {
      headline: "Search our listings",
      subheadline:
        "Refine by price, property type, bedrooms, bathrooms, parking, and rental bands — then open full detail on every project you shortlist.",
      backdropImageUrl:
        "https://images.unsplash.com/photo-1605276376104-fed8709a6178?auto=format&fit=crop&w=2400&q=80",
      backdropImageAlt: "Contemporary kitchen and living space",
      backdropOverlayStrength: 48,
    },
    listDisclaimer:
      "Listings sync from your Fusion API — your authoritative source for what’s available today.",
    aboutIntro: {
      title: "Our network, your next move",
      body:
        "We’re structured like leading residential groups: local desks, shared standards, and negotiators who know their patch. This template carries that credibility online while your CRM keeps the truth in one place.",
    },
    aboutValues: {
      title: "What you can expect",
      intro: "Market-grade presentation without losing the human desk behind it.",
      bullets: [
        "Market-style filters and listing cards fed from Fusion — not duplicated spreadsheets",
        "Appraisal and leasing workflows encouraged through clear contact paths",
        "Integrity when stock doesn’t fit — we’d rather earn trust than chase a mismatch",
      ],
    },
    contactHero: {
      headline: "Talk to us",
      subheadline:
        "Request an appraisal, switch property managers, or ask about a listing — we’ll route your message to the right office.",
    },
  });
}

/** Theme 3 — premier partner / dream-home pattern like [Create Real Estate](https://www.createvic.com.au/). Demo names only. */
export function buildRealEstateTheme3PortalTemplate(): SiteConfig {
  return buildConsumerRealEstatePortal({
    templateId: "realEstateTheme3",
    configName: "Real Estate Theme 3",
    sectionPrefix: "ret3",
    siteName: "Premier Property Partners",
    primaryColor: "#0f2744",
    secondaryColor: "#c9a227",
    phone: "+61 1800 330 903",
    email: "hello@premierproperty.example.com.au",
    colorScheme: "light",
    homeHero: {
      headline: "Find your perfect dream home.",
      subheadline:
        "Your premier property partner — browse Fusion-backed listings with rich photography and clear detail, then lean on our team when you’re ready to inspect or negotiate.",
      backdropImageUrl:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=80",
      backdropImageAlt: "Striking modern residence at dusk",
      backdropOverlayStrength: 42,
    },
    picksDisclaimer:
      "Hand-picked homes from your catalogue — the start of the journey. Tell us your must-haves and we’ll match you to what’s coming next.",
    steps: {
      title: "A partnership, not a portal dead-end",
      intro:
        "Create Real Estate–style clarity: explore freely online, then work with advisers who champion your brief — first home, upsize, or investment.",
      bullets: [
        "Search and save what feels right — every detail syncs from your Fusion feed",
        "Book inspections or strategy calls when timing and numbers align",
        "Trusted introductions to finance and legal partners when you need independent advice",
      ],
    },
    trust: {
      title: "Unlocking possibilities, one property at a time",
      body:
        "Whether you’re chasing lifestyle, location, or yield, we combine aspirational presentation with honest data — so dream-home browsing still respects your budget and timeline.",
    },
    testimonial: {
      quote:
        "Premier tone on the page, zero lag on listings — exactly the partner vibe we wanted without maintaining a second database.",
      author: "Alex P.",
      role: "First-home buyer, Victoria",
    },
    listHero: {
      headline: "Meet your perfect property",
      subheadline:
        "Search the full collection — refine by location, price, type, and return so investors and owner-occupiers stay on the same page.",
      backdropImageUrl:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=2400&q=80",
      backdropImageAlt: "Architect-designed home exterior",
      backdropOverlayStrength: 48,
    },
    listDisclaimer: "Powered by Fusion — one source of truth for availability, media, and pricing.",
    aboutIntro: {
      title: "Premier property, personal service",
      body:
        "We built this experience for agencies that position as Victoria’s property partner: confident copy, disciplined presentation, and listing depth that mirrors how you operate day to day.",
    },
    aboutValues: {
      title: "How we partner with you",
      intro: "Dream-home ambition with executional rigour.",
      bullets: [
        "Listings and updates straight from Fusion — marketing matches what your team releases",
        "Straightforward next steps from browse to offer, without mystery fees",
        "Respect for your time — we surface what matters before the inspection queue",
      ],
    },
    contactHero: {
      headline: "Start the conversation",
      subheadline:
        "Buying, renting, or ready to sell — tell us what you’re looking for and we’ll respond with next steps.",
    },
  });
}

/** First home buyer journey patterned on [First Home Buyers Australia](https://fhba.com.au/) — education, schemes, and guided next steps. Demo brand only. */
export function buildFirstHomeBuyersTemplate(): SiteConfig {
  const homeSections: SectionConfig[] = [
    {
      id: "fhb-hero",
      type: "hero",
      props: {
        headline: "Your first home — with a plan that actually makes sense.",
        subheadline:
          "Grants, schemes, deposits, and pre-approval in plain language — then stock from your Fusion feed that could suit first-time buyers. We’re here to slow the noise down, not rush you toward a deal.",
        ctaLabel: "See starter homes",
        ctaHref: "#listings",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Keys and small wooden house model on table",
        backdropOverlayStrength: 52,
      },
    },
    {
      id: "fhb-session",
      type: "sessionInterest",
      props: {
        title: "Talk to a first home specialist",
        description:
          "Prefer a quick call or a video walkthrough of how schemes apply to you? Tell us how to reach you — we’ll lock in a time without pressure.",
        anchorId: "session-interest",
        optionPhoneLabel: "Phone chat",
        optionZoomLabel: "Video session",
        buttonLabel: "Send my preference",
      },
    },
    {
      id: "fhb-who",
      type: "textImage",
      props: {
        title: "Built for first-time buyers — not seasoned investors",
        body:
          "If you’re saving, researching schemes, or weighing family guarantor options, you deserve explanations that don’t assume you already speak ‘property’. We focus on eligibility, timelines, and honest trade-offs — and we loop in your broker or adviser when the conversation turns licensed.",
        imageSide: "right",
        imageLabel: "Buyers",
      },
    },
    {
      id: "fhb-schemes",
      type: "investorStrategy",
      props: {
        title: "Schemes, grants & your deposit — decoded",
        intro:
          "Rules and budgets change by state and situation — always confirm with official sources and your mortgage broker. We help you line up what to ask next, not replace government or lender advice.",
        bullets: [
          "What first home incentives might exist for your state and purchase type (new vs established)",
          "How deposit size, stamp duty, and LMI can change the monthly payment you feel",
          "When a family guarantor or savings plan fits — and when it doesn’t",
        ],
      },
    },
    {
      id: "fhb-path",
      type: "textImage",
      props: {
        title: "A simple path from “maybe” to keys",
        body:
          "1) Get saving and pre-approval clarity with your broker. 2) Understand which schemes you might access. 3) Shortlist homes that fit your ceiling — house & land, townhouse, or apartment. 4) Lean on us for inspections, contract timing, and referrals to conveyancers when you’re ready.",
        imageSide: "left",
        imageLabel: "Steps",
      },
    },
    {
      id: "fhb-listings",
      type: "featuredListings",
      props: {
        title: "Homes to shortlist while you learn",
        anchorId: "listings",
        hideListingFilters: true,
        maxItems: 6,
        showSampleDisclaimer: true,
        sampleDisclaimer:
          "Sample stock from your Fusion catalogue — filter for price bands and locations that match your pre-approval. Many more options exist off this page.",
      },
    },
    {
      id: "fhb-checklist",
      type: "investorStrategy",
      props: {
        title: "Before you fall in love with a facade",
        intro: "A few checks that save heartache later — especially when every open home feels urgent.",
        bullets: [
          "Cooling off, building reports, and strata searches — what to budget for and when",
          "Hidden costs: council rates, insurance, and moving — so the first mortgage bill isn’t a shock",
          "How to compare two properties when the price looks similar but the holding cost isn’t",
        ],
      },
    },
    {
      id: "fhb-proof",
      type: "testimonial",
      props: {
        items: [
          {
            quote:
              "We went from confused about grants to a shortlist we could afford — educational first, sales second, just how we needed.",
            author: "Sam & Riley",
            role: "First home buyers, Victoria",
          },
        ],
      },
    },
    {
      id: "fhb-lead",
      type: "leadForm",
      props: {
        title: "Get free first home guidance",
        description:
          "Tell us your state, budget comfort zone, and timeline — we’ll reply with next steps. Production sites connect enquiries to Fusion CRM.",
        buttonLabel: "Request help",
      },
    },
    {
      id: "fhb-partners",
      type: "textImage",
      props: {
        title: "We team up with your broker & conveyancer",
        body:
          "Property is one piece of the puzzle — credit, contracts, and tax questions belong with licensed professionals you choose. We make the property leg clearer so those conversations go faster.",
        imageSide: "right",
        imageLabel: "Partners",
      },
    },
    {
      id: "fhb-lead-final",
      type: "leadForm",
      props: {
        title: "Ready when you are",
        description: "Leave your email or phone — we respond within one business day.",
        buttonLabel: "Enquire now",
      },
    },
  ];

  const listingsSections: SectionConfig[] = [
    {
      id: "fhb-list-hero",
      type: "hero",
      props: {
        headline: "Search first-home friendly stock",
        subheadline:
          "Filter by price, location, and property type. Live listings sync from Fusion — ideal while you firm up borrowing power.",
        ctaLabel: "Talk to us",
        ctaHref: "tel:+611800000000",
        backdropImageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
        backdropImageAlt: "Affordable suburban home frontage",
        backdropOverlayStrength: 46,
      },
    },
    {
      id: "fhb-list-grid",
      type: "featuredListings",
      props: {
        title: "All current opportunities",
        anchorId: "listings",
        sampleDisclaimer:
          "Use price filters to stay within your pre-approval — your broker’s ceiling is the number that matters.",
      },
    },
    {
      id: "fhb-list-lead",
      type: "leadForm",
      props: {
        title: "Want a curated shortlist?",
        description: "Share your must-haves and we’ll match options to your first-home budget.",
        buttonLabel: "Email me options",
      },
    },
  ];

  const aboutSections: SectionConfig[] = [
    {
      id: "fhb-about-intro",
      type: "textImage",
      props: {
        title: "Why we focus on first buyers",
        body:
          "Everyone deserves a fair shot at ownership — without being buried in jargon. We built this template around the FHBA-style experience: clear education, transparent listings, and humans when you need them.",
        imageSide: "right",
        imageLabel: "Team",
      },
    },
    {
      id: "fhb-about-values",
      type: "investorStrategy",
      props: {
        title: "What won’t change here",
        intro: "Patient pace, plain speech, and respect for your budget.",
        bullets: [
          "No fake urgency — you choose when to escalate",
          "Schemes explained as “what to verify next”, not promises",
          "Fusion-backed data so what you see online matches what’s available",
        ],
      },
    },
  ];

  const contactSections: SectionConfig[] = [
    {
      id: "fhb-contact-hero",
      type: "hero",
      props: {
        headline: "Ask us anything",
        subheadline:
          "Grants, suburbs, or a specific listing — we typically respond within one business day.",
        ctaLabel: "Call",
        ctaHref: "tel:+611800000000",
      },
    },
    {
      id: "fhb-contact-form",
      type: "leadForm",
      props: {
        title: "Send a message",
        description: "Demo form in the builder; production connects to your enquiry workflow.",
        buttonLabel: "Submit",
      },
    },
  ];

  let pages = defaultPages();
  pages = replacePageSections(pages, "home", homeSections);
  pages = replacePageSections(pages, "listings", listingsSections);
  pages = replacePageSections(pages, "about", aboutSections);
  pages = replacePageSections(pages, "contact", contactSections);

  return {
    id: newSiteId(),
    name: "First home buyers",
    templateId: "firstHomeBuyers",
    publishStatus: "draft",
    branding: {
      siteName: "Australian First Home Pathway",
      logo: "",
      primaryColor: "#0284c7",
      secondaryColor: "#f97316",
      phone: "+61 1800 000 000",
      email: "hello@firsthomepathway.example.com.au",
      colorScheme: "light",
      contentWidth: "narrow",
    },
    pages,
  };
}

export const SITE_TEMPLATE_BUILDERS = {
  advisory: { label: BUILDER_TEMPLATE_CARDS[0].name, build: buildGeneralPropertyAdvisoryTemplate },
  smsfStrategy: { label: BUILDER_TEMPLATE_CARDS[1].name, build: buildSmsfPropertyStrategyTemplate },
  highYield: { label: BUILDER_TEMPLATE_CARDS[2].name, build: buildHighYieldCashFlowTemplate },
  positiveCashflow: { label: BUILDER_TEMPLATE_CARDS[3].name, build: buildPositiveCashflowAgencyTemplate },
  dualIncome: { label: BUILDER_TEMPLATE_CARDS[4].name, build: buildDualIncomeInvestmentPortalTemplate },
  lifestyleCorridors: { label: BUILDER_TEMPLATE_CARDS[5].name, build: buildLifestyleCorridorsPortalTemplate },
  ndisProperties: { label: BUILDER_TEMPLATE_CARDS[6].name, build: buildNdisPropertiesTemplate },
  realEstateTheme2: { label: BUILDER_TEMPLATE_CARDS[7].name, build: buildRealEstateTheme2PortalTemplate },
  realEstateTheme3: { label: BUILDER_TEMPLATE_CARDS[8].name, build: buildRealEstateTheme3PortalTemplate },
  firstHomeBuyers: { label: BUILDER_TEMPLATE_CARDS[9].name, build: buildFirstHomeBuyersTemplate },
} as const satisfies Record<
  SiteTemplateId,
  { label: string; build: () => SiteConfig }
>;
