import type { SectionConfig } from "./site-model";

export const SECTION_TYPE_OPTIONS = [
  { type: "hero" as const, label: "Hero" },
  { type: "featuredListings" as const, label: "Featured Listings" },
  { type: "leadForm" as const, label: "Lead Form" },
  { type: "sessionInterest" as const, label: "Session interest (discovery / Zoom)" },
  { type: "textImage" as const, label: "Text + Image" },
  { type: "videoEmbed" as const, label: "Video" },
  { type: "testimonial" as const, label: "Testimonials" },
  { type: "smsf" as const, label: "SMSF" },
  { type: "dualKey" as const, label: "Dual Key" },
  { type: "investorStrategy" as const, label: "Investor Strategy" },
];

export type BuilderSectionType = (typeof SECTION_TYPE_OPTIONS)[number]["type"];

function newSectionId(): string {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlankSection(type: BuilderSectionType): SectionConfig {
  const id = newSectionId();
  switch (type) {
    case "hero":
      return {
        id,
        type: "hero",
        props: {
          headline: "New headline",
          subheadline: "Add a supporting line here.",
          ctaLabel: "Learn more",
          ctaHref: "#",
        },
      };
    case "featuredListings":
      return {
        id,
        type: "featuredListings",
        props: { title: "Featured listings" },
      };
    case "leadForm":
      return {
        id,
        type: "leadForm",
        props: {
          title: "Get in touch",
          description: "We will respond shortly.",
          buttonLabel: "Submit",
        },
      };
    case "sessionInterest":
      return {
        id,
        type: "sessionInterest",
        props: {
          title: "Register your interest",
          description:
            "Choose whether you’d like a short discovery call or a live Zoom — we’ll follow up to arrange a time.",
          anchorId: "session-interest",
          optionPhoneLabel: "20 min discovery phone call",
          optionZoomLabel: "Live Zoom session",
          buttonLabel: "Send my preference",
        },
      };
    case "textImage":
      return {
        id,
        type: "textImage",
        props: {
          title: "Section title",
          body: "Replace this copy with your message.",
          imageSide: "right",
          imageLabel: "Image",
        },
      };
    case "videoEmbed":
      return {
        id,
        type: "videoEmbed",
        props: {
          title: "",
          body: "",
          videoUrl: "",
        },
      };
    case "testimonial":
      return {
        id,
        type: "testimonial",
        props: {
          items: [
            {
              quote: "Short testimonial goes here.",
              author: "Client name",
              role: "Investor",
            },
          ],
        },
      };
    case "smsf":
      return {
        id,
        type: "smsf",
        props: {
          title: "SMSF considerations",
          body: "Outline how you support trustees through structure, lending, and compliance conversations.",
          points: ["Liquidity after settlement", "Arm’s-length lease", "Independent SMSF advice"],
        },
      };
    case "dualKey":
      return {
        id,
        type: "dualKey",
        props: {
          title: "Dual-key snapshot",
          body: "Explain how two incomes from one title can suit your buyer profile.",
          bullets: ["Separate tenancies", "Local tenant demand", "Yield vs single let"],
        },
      };
    case "investorStrategy":
      return {
        id,
        type: "investorStrategy",
        props: {
          title: "Investor approach",
          intro: "How you help clients compare opportunities without hype.",
          bullets: ["Cashflow bands", "Risk flags you watch", "Next step in your process"],
        },
      };
  }
}
