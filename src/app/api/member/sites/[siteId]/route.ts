import { getFusionSubscriberIdFromRequest } from "@/lib/member-sites/auth";
import { MEMBER_SITES_DB_ENV_HINT } from "@/lib/member-sites/env";
import {
  deleteSiteForSubscriber,
  getSiteForSubscriber,
  isMemberSitesDatabaseConfigured,
  updateSiteForSubscriber,
} from "@/lib/member-sites/repo";
import { parseSiteConfigBody } from "@/lib/member-sites/validate-config";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return Response.json({ error: message, ...extra }, { status });
}

export async function GET(req: Request, ctx: { params: Promise<{ siteId: string }> }) {
  if (!isMemberSitesDatabaseConfigured()) {
    return jsonError(503, "Database is not configured for member saved sites.", { hint: MEMBER_SITES_DB_ENV_HINT });
  }

  const { siteId } = await ctx.params;
  if (!UUID_RE.test(siteId)) {
    return jsonError(400, "Invalid site id");
  }

  const subscriberId = getFusionSubscriberIdFromRequest(req);
  if (!subscriberId) {
    return jsonError(
      401,
      "Missing Fusion subscriber. Send header X-Fusion-Subscriber-Id, or set MEMBER_SITES_DEV_SUBSCRIBER for local dev only.",
    );
  }

  const row = await getSiteForSubscriber(subscriberId, siteId);
  if (!row) {
    return jsonError(404, "Site not found");
  }

  return Response.json({
    id: row.id,
    name: row.name,
    publishStatus: row.publish_status,
    config: row.config,
    updatedAt: row.updated_at,
  });
}

export async function PUT(req: Request, ctx: { params: Promise<{ siteId: string }> }) {
  if (!isMemberSitesDatabaseConfigured()) {
    return jsonError(503, "Database is not configured for member saved sites.", { hint: MEMBER_SITES_DB_ENV_HINT });
  }

  const { siteId } = await ctx.params;
  if (!UUID_RE.test(siteId)) {
    return jsonError(400, "Invalid site id");
  }

  const subscriberId = getFusionSubscriberIdFromRequest(req);
  if (!subscriberId) {
    return jsonError(401, "Missing Fusion subscriber. Send header X-Fusion-Subscriber-Id.");
  }

  let body: { name?: unknown; config?: unknown; publishStatus?: unknown };
  try {
    body = (await req.json()) as { name?: unknown; config?: unknown; publishStatus?: unknown };
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const config = body.config !== undefined ? parseSiteConfigBody(body.config) : undefined;
  if (body.config !== undefined && !config) {
    return jsonError(400, "Invalid site config payload");
  }

  let publishStatus: "draft" | "published" | undefined;
  if (body.publishStatus === "draft" || body.publishStatus === "published") {
    publishStatus = body.publishStatus;
  } else if (body.publishStatus !== undefined) {
    return jsonError(400, "publishStatus must be draft or published");
  }

  if (name === undefined && config === undefined && publishStatus === undefined) {
    return jsonError(400, "Nothing to update — send name, config, and/or publishStatus");
  }

  const ok = await updateSiteForSubscriber(subscriberId, siteId, {
    ...(name !== undefined ? { name } : {}),
    ...(config ? { config } : {}),
    ...(publishStatus ? { publishStatus } : {}),
  });

  if (!ok) {
    return jsonError(404, "Site not found");
  }

  const row = await getSiteForSubscriber(subscriberId, siteId);
  return Response.json({
    id: siteId,
    name: row?.name,
    publishStatus: row?.publish_status,
    config: row?.config,
    updatedAt: row?.updated_at,
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ siteId: string }> }) {
  if (!isMemberSitesDatabaseConfigured()) {
    return jsonError(503, "Database is not configured for member saved sites.", { hint: MEMBER_SITES_DB_ENV_HINT });
  }

  const { siteId } = await ctx.params;
  if (!UUID_RE.test(siteId)) {
    return jsonError(400, "Invalid site id");
  }

  const subscriberId = getFusionSubscriberIdFromRequest(req);
  if (!subscriberId) {
    return jsonError(401, "Missing Fusion subscriber. Send header X-Fusion-Subscriber-Id.");
  }

  try {
    const deleted = await deleteSiteForSubscriber(subscriberId, siteId);
    if (!deleted) {
      return jsonError(404, "Site not found");
    }
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/member/sites DELETE]", e);
    return jsonError(500, msg);
  }
}
