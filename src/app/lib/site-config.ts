export type SiteConfig = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  apiKey: string;
  subscriberId: string;
  siteUrl: string;
};

export const defaultSiteConfig: SiteConfig = {
  siteName: "Fusion Sites",
  tagline: "Build high-converting property websites connected to Fusion CRM.",
  logoUrl: "",
  primaryColor: "#ffffff",
  secondaryColor: "#a1a1aa",
  phone: "+61 400 000 000",
  email: "hello@example.com",
  apiKey: "",
  subscriberId: "",
  siteUrl: "https://yoursite.example.com",
};
