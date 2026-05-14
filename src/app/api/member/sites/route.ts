import { randomUUID } from "crypto";
import { getFusionSubscriberIdFromRequest } from "@/lib/member-sites/auth";
import { getMemberSitesMaxDefault } from "@/lib/member-sites/env";
import {
  countSitesForSubscriber,
  getMaxSitesForSubscriber,
  insertSite,
  isMemberSitesDatabaseConfigured,
  listSitesForSubscriber,
} from "@/lib/member-sites/repo";
import { createSite } from "@/lib/site-generator";
import { isSiteTemplateId, withSiteConfigDefaults } from "@/lib/site-model";
import { SITE_TEMPLATE_BUILDERS } from "@/lib/site-templates";

function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

/** POST body: { name?: string, templateId?: keyof SITE_TEMPLATE_BUILDERS } */
export async function GET(req: Request) {
  try {
    if (!isMemberSitesDatabaseConfigured()) {
      return jsonError(503, "Database is not configured (set POSTGRES_URL, DATABASE_URL, or Neon Storage env from Vercel)");
    }

    const subscriberId = getFusionSubscriberIdFromRequest(req);
    if (!subscriberId) {
      return jsonError(
        401,
        "Missing Fusion subscriber. Send header X-Fusion-Subscriber-Id, or set MEMBER_SITES_DEV_SUBSCRIBER for local dev only.",
      );
    }

    const items = await listSitesForSubscriber(subscriberId);
    if (items === null) {
      return jsonError(503, "Could not load sites");
    }

    const maxSites = (await getMaxSitesForSubscriber(subscriberId)) ?? getMemberSitesMaxDefault();
    return Response.json({ sites: items, maxSites, subscriberId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/member/sites GET]", e);
    return jsonError(500, msg, dbErrorHint(msg));
  }
}

function dbErrorHint(message: string): { hint?: string } {
  const m = message.toLowerCase();
  if (m.includes("does not exist") || m.includes("relation") || m.includes("member_saved_sites")) {
    return { hint: "In Neon: run the full script from scripts/member-sites-schema.sql (SQL Editor), then retry." };
  }
  return {};
}

export async function POST(req: Request) {
  try {
    if (!isMemberSitesDatabaseConfigured()) {
      return jsonError(503, "Database is not configured (set POSTGRES_URL, DATABASE_URL, or Neon Storage env from Vercel)");
    }

    const subscriberId = getFusionSubscriberIdFromRequest(req);
    if (!subscriberId) {
      return jsonError(401, "Missing Fusion subscriber. Send header X-Fusion-Subscriber-Id.");
    }

    const maxSites = (await getMaxSitesForSubscriber(subscriberId)) ?? getMemberSitesMaxDefault();
    const count = (await countSitesForSubscriber(subscriberId)) ?? 0;
    if (count >= maxSites) {
      return jsonError(403, "Site limit reached for this member", {
        maxSites,
        hint: "Raise max_sites in member_site_quotas for this subscriber_id, or increase MEMBER_SITES_MAX default.",
      });
    }

    let body: { name?: unknown; templateId?: unknown };
    try {
      body = (await req.json()) as { name?: unknown; templateId?: unknown };
    } catch {
      return jsonError(400, "Invalid JSON body");
    }

    const nameRaw = typeof body.name === "string" ? body.name.trim() : "";
    const name = nameRaw || "New site";
    const tid = typeof body.templateId === "string" ? body.templateId : undefined;

    let site;
    if (tid && isSiteTemplateId(tid)) {
      site = SITE_TEMPLATE_BUILDERS[tid].build();
    } else {
      site = createSite(name);
    }

    const siteId = randomUUID();
    const config = withSiteConfigDefaults({
      ...site,
      id: siteId,
      name,
      branding: { ...site.branding, siteName: name },
      publishStatus: "draft",
    });

    const inserted = await insertSite(subscriberId, siteId, name, config);
    if (!inserted) {
      return jsonError(503, "Could not create site");
    }

    return Response.json({ id: inserted.id, name, config }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/member/sites POST]", e);
    return jsonError(500, msg, dbErrorHint(msg));
  }
}
