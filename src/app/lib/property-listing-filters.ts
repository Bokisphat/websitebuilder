import type { FusionProperty } from "./fusion-property";
import {
  listingMatchesTextQuery,
  propertyMatchesTypeCategory,
} from "./property-type-categories";

export function listingMatchesFilters(listing: FusionProperty, query: string, typeCategoryId: string): boolean {
  if (!propertyMatchesTypeCategory(listing, typeCategoryId)) return false;
  return listingMatchesTextQuery(listing, query);
}

export function filterFusionProperties(
  listings: FusionProperty[],
  query: string,
  typeCategoryId: string,
): FusionProperty[] {
  return listings.filter((p) => listingMatchesFilters(p, query, typeCategoryId));
}
