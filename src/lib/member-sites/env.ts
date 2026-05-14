/** Default max sites per subscriber when no row exists in `member_site_quotas`. */
export function getMemberSitesMaxDefault(): number {
  const raw = process.env.MEMBER_SITES_MAX?.trim();
  const n = raw ? parseInt(raw, 10) : 6;
  if (!Number.isFinite(n) || n < 1) return 6;
  if (n > 500) return 500;
  return n;
}
