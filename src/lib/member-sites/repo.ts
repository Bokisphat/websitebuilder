import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { SiteConfig } from "@/lib/site-model";
import { getMemberSitesMaxDefault } from "./env";

/** Neon on Vercel usually sets POSTGRES_URL; some wizards use a custom prefix (e.g. STORAGE_URL). */
export function getMemberSitesDatabaseUrl(): string | null {
  const candidates = [
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.STORAGE_POSTGRES_URL,
    process.env.STORAGE_URL,
  ];
  for (const raw of candidates) {
    const u = raw?.trim();
    if (u) return u;
  }
  return null;
}

function getSql(): NeonQueryFunction<false, false> | null {
  const url = getMemberSitesDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

export function isMemberSitesDatabaseConfigured(): boolean {
  return getMemberSitesDatabaseUrl() !== null;
}

export type MemberSiteRow = {
  id: string;
  subscriber_id: string;
  name: string;
  config: SiteConfig;
  publish_status: string;
  created_at: string;
  updated_at: string;
};

export type MemberSiteListItem = {
  id: string;
  name: string;
  publishStatus: string;
  updatedAt: string;
};

export async function getMaxSitesForSubscriber(subscriberId: string): Promise<number | null> {
  const sql = getSql();
  if (!sql) return null;
  const defaultMax = getMemberSitesMaxDefault();
  const rows = await sql`
    SELECT COALESCE(
      (SELECT max_sites FROM member_site_quotas WHERE subscriber_id = ${subscriberId}),
      ${defaultMax}
    ) AS max_sites
  `;
  const row = rows[0] as { max_sites: number } | undefined;
  return row ? Number(row.max_sites) : defaultMax;
}

export async function countSitesForSubscriber(subscriberId: string): Promise<number | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    SELECT COUNT(*)::int AS c FROM member_saved_sites WHERE subscriber_id = ${subscriberId}
  `;
  const row = rows[0] as { c: number } | undefined;
  return row?.c ?? 0;
}

export async function listSitesForSubscriber(subscriberId: string): Promise<MemberSiteListItem[] | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, publish_status, updated_at
    FROM member_saved_sites
    WHERE subscriber_id = ${subscriberId}
    ORDER BY updated_at DESC
  `;
  return (rows as { id: string; name: string; publish_status: string; updated_at: Date | string }[]).map((r) => ({
    id: r.id,
    name: r.name,
    publishStatus: r.publish_status,
    updatedAt: typeof r.updated_at === "string" ? r.updated_at : r.updated_at.toISOString(),
  }));
}

export async function getSiteForSubscriber(
  subscriberId: string,
  siteId: string,
): Promise<MemberSiteRow | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    SELECT id, subscriber_id, name, config, publish_status, created_at, updated_at
    FROM member_saved_sites
    WHERE id = CAST(${siteId} AS uuid) AND subscriber_id = ${subscriberId}
    LIMIT 1
  `;
  const row = rows[0] as
    | {
        id: string;
        subscriber_id: string;
        name: string;
        config: SiteConfig;
        publish_status: string;
        created_at: Date | string;
        updated_at: Date | string;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    subscriber_id: row.subscriber_id,
    name: row.name,
    config: row.config,
    publish_status: row.publish_status,
    created_at: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
    updated_at: typeof row.updated_at === "string" ? row.updated_at : row.updated_at.toISOString(),
  };
}

export async function insertSite(
  subscriberId: string,
  siteId: string,
  name: string,
  config: SiteConfig,
): Promise<{ id: string } | null> {
  const sql = getSql();
  if (!sql) return null;
  const publishStatus = config.publishStatus === "published" ? "published" : "draft";
  const configStr = JSON.stringify(config);
  const rows = await sql`
    INSERT INTO member_saved_sites (id, subscriber_id, name, config, publish_status)
    VALUES (
      CAST(${siteId} AS uuid),
      ${subscriberId},
      ${name},
      CAST(${configStr} AS jsonb),
      ${publishStatus}
    )
    RETURNING id
  `;
  const row = rows[0] as { id: string } | undefined;
  return row ? { id: row.id } : null;
}

export async function updateSiteForSubscriber(
  subscriberId: string,
  siteId: string,
  patch: { name?: string; config?: SiteConfig; publishStatus?: "draft" | "published" },
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  const existing = await getSiteForSubscriber(subscriberId, siteId);
  if (!existing) return false;

  let nextConfig = existing.config;
  if (patch.config) {
    nextConfig = { ...patch.config, id: siteId };
  }

  let nextName = existing.name;
  if (patch.name !== undefined) {
    const t = patch.name.trim();
    if (t) nextName = t;
  } else if (patch.config) {
    const t = nextConfig.name?.trim() || nextConfig.branding?.siteName?.trim();
    if (t) nextName = t;
  }
  const nextPublish =
    patch.publishStatus ??
    (nextConfig.publishStatus === "published" ? "published" : "draft");

  const configStr = JSON.stringify({ ...nextConfig, publishStatus: nextPublish });
  const pub = nextPublish === "published" ? "published" : "draft";

  await sql`
    UPDATE member_saved_sites
    SET
      name = ${nextName},
      config = CAST(${configStr} AS jsonb),
      publish_status = ${pub},
      updated_at = NOW()
    WHERE id = CAST(${siteId} AS uuid) AND subscriber_id = ${subscriberId}
  `;
  return true;
}
