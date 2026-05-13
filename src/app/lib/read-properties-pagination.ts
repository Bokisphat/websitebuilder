export type PropertiesPaginationMeta = {
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export function readPropertiesPagination(json: unknown): PropertiesPaginationMeta | null {
  if (!json || typeof json !== "object" || !("pagination" in json)) return null;
  const p = (json as { pagination: unknown }).pagination;
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  const page = typeof o.page === "number" && o.page >= 1 ? o.page : 1;
  const pageSize = typeof o.pageSize === "number" && o.pageSize >= 1 ? o.pageSize : 20;
  const hasMore = Boolean(o.hasMore);
  return { page, pageSize, hasMore };
}
