/** Shown when POSTGRES_URL / DATABASE_URL / Neon vars are missing (local .env.local or Vercel env). */
export const MEMBER_SITES_DB_ENV_HINT =
  "Local: copy your Neon “connection string” into `.env.local` as POSTGRES_URL=... or DATABASE_URL=... (same DB as production is fine), then restart `npm run dev`. Hosted: set that variable in Vercel → Project → Environment Variables.";

/** Default max sites per subscriber when no row exists in `member_site_quotas`. */
export function getMemberSitesMaxDefault(): number {
  const raw = process.env.MEMBER_SITES_MAX?.trim();
  const n = raw ? parseInt(raw, 10) : 6;
  if (!Number.isFinite(n) || n < 1) return 6;
  if (n > 500) return 500;
  return n;
}
