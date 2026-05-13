/** Mirrors Pexels search API `photos[]` item — see https://www.pexels.com/api/documentation/#photos-search */
export type PexelsSearchPhoto = {
  id: number;
  width: number;
  height: number;
  src: {
    medium: string;
    large: string;
    large2x: string;
    original: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
};
