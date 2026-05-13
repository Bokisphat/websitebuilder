/** Unsplash search API `results[]` item — https://unsplash.com/documentation#search-photos */
export type UnsplashSearchResult = {
  id: string;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
};
