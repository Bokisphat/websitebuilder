# Fusion Sites — Developer handoff (Fusion CRM / Laravel integration)

This document is for the engineer integrating **Fusion Sites** (Next.js app) with **Fusion CRM** (PHP / Laravel). It describes architecture, environment configuration, existing Fusion API usage, and the **member saved websites** feature (Postgres-backed).

---

## 1. Repository and stack

| Item | Detail |
|------|--------|
| **Repo** | `websitebuilder` on GitHub under the product owner’s account (e.g. `Bokisphat/websitebuilder`). |
| **Framework** | Next.js **16.x**, React **19.x**, TypeScript, Tailwind CSS **4.x**. |
| **Hosting** | **Vercel** (production URL typically `*.vercel.app` or a custom domain). |
| **Database (member sites)** | **Vercel Postgres** (Neon). Driver: `@neondatabase/serverless`. Connection via **`POSTGRES_URL`** or **`DATABASE_URL`**. |

Important: follow project rules in `AGENTS.md` / `CLAUDE.md` — local Next docs live under `node_modules/next/dist/docs/` when bumping major versions.

---

## 2. High-level architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│  Fusion CRM     │ ──────────────▶│  Fusion Sites    │
│  (Laravel)      │  links / API   │  (Next.js)       │
└────────┬────────┘                └────────┬─────────┘
         │                                │
         │  API-KEY + API-URL              │  POSTGRES_URL
         ▼                                ▼
┌─────────────────┐                ┌──────────────────┐
│ fusioncrm.software              │  Neon / Postgres   │
│ /api/fusion/*  (upstream)       │  member_* tables  │
└─────────────────┘                └──────────────────┘
```

- **Fusion Sites** is a separate deployable app: marketing pages, **website builder**, preview, property pages, and **server routes** that proxy or aggregate Fusion data.
- **Member website JSON** is stored in **Postgres** (`member_saved_sites`). Laravel can treat this as the system of record for “sites” *or* sync/copy into Fusion later — the API shape is stable for either approach.

---

## 3. Fusion upstream (listings, enquiries, BFF)

### 3.1 Environment variables (server-only)

Documented in **`.env.example`**. Key entries:

| Variable | Purpose |
|----------|---------|
| `FUSION_HOST_URL` | Base URL (e.g. `https://fusioncrm.software`). |
| `FUSION_API_KEY` | Fusion `API-KEY` header value. |
| `FUSION_API_URL` | Fusion **authorized origin**; sent as **`API-URL`** header. Must match Fusion allow-list **exactly** (often hostname without `https://`, e.g. `yoursite.vercel.app` in production). |
| `FUSION_SUBSCRIBER` | Default subscriber id for listing endpoints in single-tenant/demo scenarios. |
| `FUSION_API_PROPERTIES_LIMIT` | Upper bound for project list fetches. |
| `FUSION_API_PROPERTIES_URL` | Optional explicit projects URL (see `.env.example`). |

### 3.2 Server routes that talk to Fusion

- **`GET/POST /api/fusion/[[...path]]`** — allowlisted BFF proxy to Fusion `/api/fusion/*` (see `src/app/lib/fusion-bff-path.ts`). SSRF-safe segment rules.
- **`GET /api/properties`** — property listing aggregation/pagination for the builder and site pages.
- **`POST /api/enquiries`** — forwards enquiries to Fusion with `API-KEY` / `API-URL`.
- Other utilities: `subscriber`, `test` (sanity check; consider restricting or removing in production).

Implementation references:

- `src/app/lib/fusion-env.ts` — URL and subscriber resolution.
- `src/app/lib/fusion-upstream.ts` — auth headers and HTTP helpers.
- `src/app/lib/fusion-bff-path.ts` — allowed Fusion paths.

### 3.3 Allow-listed origin

When the app is deployed, **Fusion** must allow the production hostname used in **`FUSION_API_URL`**. Typical pattern: production host = `projectname.vercel.app` or custom domain — **no** typo vs Fusion dashboard.

---

## 4. Member saved websites (Postgres)

### 4.1 Purpose

- Each **Fusion member** (subscriber) has a numeric id, e.g. from CRM URL:  
  `https://fusioncrm.software/users/subscriber/show/9711` → **`9711`**.
- Members can maintain multiple **saved** website definitions (default cap **6**, configurable per subscriber).
- Each save is a full **`SiteConfig`** JSON document (pages, sections, branding, `publishStatus`).

### 4.2 Schema

Run **once** in Neon/Vercel SQL editor (file: **`scripts/member-sites-schema.sql`**):

**`member_site_quotas`**

| Column | Type | Notes |
|--------|------|--------|
| `subscriber_id` | `VARCHAR(32)` PK | Fusion subscriber id as string, e.g. `"9711"`. |
| `max_sites` | `INT` | Per-member cap (1–500). |
| `updated_at` | `TIMESTAMPTZ` | |

If no row exists for a subscriber, the app uses default **`MEMBER_SITES_MAX`** env (default **6**).

**`member_saved_sites`**

| Column | Type | Notes |
|--------|------|--------|
| `id` | `UUID` PK | Stable id for the saved site (also reflected in `config.id`). |
| `subscriber_id` | `VARCHAR(32)` | Owner. |
| `name` | `TEXT` | Display name. |
| `config` | `JSONB` | Full `SiteConfig` (see §5). |
| `publish_status` | `VARCHAR(16)` | `'draft'` \| `'published'` (mirrors config where applicable). |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

Index: `idx_member_saved_sites_subscriber` on `subscriber_id`.

### 4.3 Identity contract (critical)

All **`/api/member/*`** routes resolve the member using:

**HTTP header:** `X-Fusion-Subscriber-Id: <digits-only>`

- Example: `X-Fusion-Subscriber-Id: 9711`
- **Production:** Laravel should set this on **server-side** requests (recommended) or establish a **signed token / session** model and have a small Next middleware or Edge check later — **do not** rely on public `NEXT_PUBLIC_*` subscriber ids for real users.

**Development only** (when `NODE_ENV !== "production"`):

- If the header is missing, the app may fall back to `MEMBER_SITES_DEV_SUBSCRIBER` or `FUSION_SUBSCRIBER` in `.env` (see `src/lib/member-sites/auth.ts`).

### 4.4 HTTP API reference

Base path: **`/api/member/sites`**

#### `GET /api/member/sites`

Lists saved sites for the authenticated subscriber.

**Headers:** `X-Fusion-Subscriber-Id` (required in production).

**200 response:**

```json
{
  "subscriberId": "9711",
  "maxSites": 6,
  "sites": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Spring campaign",
      "publishStatus": "draft",
      "updatedAt": "2026-05-14T12:00:00.000Z"
    }
  ]
}
```

#### `POST /api/member/sites`

Creates a new site **if** current count `< maxSites`.

**Headers:** `X-Fusion-Subscriber-Id`, `Content-Type: application/json`

**Body (optional fields):**

```json
{
  "name": "My new site",
  "templateId": "advisory"
}
```

- **`name`** — optional; defaults to `"New site"`.
- **`templateId`** — optional; must be one of the built-in template ids (see §5.2). If omitted, a generic default site is created.

**201 response:**

```json
{
  "id": "uuid",
  "name": "My new site",
  "config": { "...": "full SiteConfig" }
}
```

**403** — site limit reached (`maxSites` in response body + hint).

---

#### `GET /api/member/sites/{siteId}`

**`siteId`** — UUID v4.

**200 response:**

```json
{
  "id": "uuid",
  "name": "Spring campaign",
  "publishStatus": "draft",
  "config": { "...": "SiteConfig" },
  "updatedAt": "..."
}
```

**404** — not found or not owned by subscriber.

#### `PUT /api/member/sites/{siteId}`

Partial or full update.

**Body (at least one field):**

```json
{
  "name": "Renamed site",
  "publishStatus": "published",
  "config": { "...": "full SiteConfig" }
}
```

**Rules:**

- **`config`** is validated with a **minimal structural check** (see `src/lib/member-sites/validate-config.ts`). Invalid payload → **400**.
- Server enforces `config.id === siteId` on write.

**200** — returns updated snapshot (`id`, `name`, `publishStatus`, `config`, `updatedAt`).

---

### 4.5 Quotas (raising the limit)

1. **Global default:** set env **`MEMBER_SITES_MAX`** (integer, clamped in code).
2. **Per subscriber:** insert/update **`member_site_quotas`**:

```sql
INSERT INTO member_site_quotas (subscriber_id, max_sites)
VALUES ('9711', 20)
ON CONFLICT (subscriber_id) DO UPDATE SET max_sites = EXCLUDED.max_sites, updated_at = NOW();
```

---

## 5. Site configuration JSON (`SiteConfig`)

Canonical TypeScript types: **`src/lib/site-model.ts`** (`SiteConfig`, `BrandingConfig`, `PageConfig`, `SectionConfig`, `PublishStatus`).

Summary:

- **`id`** — string; for DB-backed sites matches **`member_saved_sites.id`** (UUID).
- **`name`** — internal / builder name.
- **`templateId`** — preset key or `"custom"`.
- **`branding`** — `siteName`, `logo`, colors, `phone`, `email`, optional `bookingUrl`, `referralPartnersUrl`, `colorScheme`, `contentWidth`, etc.
- **`pages`** — array of pages (`id`, `name`, `sections[]`, optional video fields).
- **`publishStatus`** — `"draft"` | `"published"`.

### 5.1 Template ids (`POST /api/member/sites` body)

Defined in `SITE_TEMPLATE_IDS` in `site-model.ts` (examples: `advisory`, `smsfStrategy`, `highYield`, `positiveCashflow`, `dualIncome`, `lifestyleCorridors`, `ndisProperties`, `realEstateTheme2`, `realEstateTheme3`, `firstHomeBuyers`).

Builders live in **`src/lib/site-templates.ts`** (`SITE_TEMPLATE_BUILDERS`).

---

## 6. End-user flows in the Next app (reference)

| URL | Purpose |
|-----|---------|
| `/` | Marketing home. |
| `/member/sites` | “My sites” UI (list, create, link to builder). Uses `fetch` + `memberSitesClientHeaders()` (see below). |
| `/builder` | Template gallery / editor. |
| `/builder?siteId=<uuid>` | Load saved site from API; **autosave** to `PUT /api/member/sites/{siteId}` after edits (~1.2s debounce). |
| `/builder/preview` | Full-page preview (uses preview storage / context). |
| `/site/[siteId]` | **Public-style** member site routes (separate from DB `member_saved_sites` routing — product may later map published configs to public URLs). |

### 6.1 Browser demo header (not for production)

`src/lib/member-sites/client-fetch.ts` adds `X-Fusion-Subscriber-Id` from **`NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID`** when set — **insecure**, for demos only. Replace with Laravel-issued session or server proxy.

---

## 7. Recommended Laravel integration patterns

### 7.1 Open builder from Fusion (member context)

1. User clicks “Edit websites” in CRM.
2. Laravel **redirects or iframe-opens** Fusion Sites, e.g.  
   `https://<fusion-sites-host>/member/sites` or `/builder?siteId=<uuid>`.
3. **Preferred:** Laravel **server** calls Next APIs with `X-Fusion-Subscriber-Id` and passes data to the client **or** sets an **HttpOnly cookie** that a future Next middleware reads (not implemented yet — extension point).
4. **Avoid:** putting subscriber id only in a public query string for production without signing.

### 7.2 Server-side proxy (strongly recommended)

Laravel route, e.g. `POST /fusion-sites/proxy/...`, forwards to `https://<vercel>/api/member/...` with:

- `X-Fusion-Subscriber-Id` = authenticated CRM user’s subscriber id  
- Optional shared secret header between Laravel and Next (`X-Internal-Secret`) — **to be added** if you want mutual authentication beyond subscriber id.

### 7.3 Single sign-on / token (future)

If you issue a **JWT**:

- Claims should include **`sub`** (subscriber id) and **exp**.
- Next would verify signature (add middleware / `getFusionSubscriberIdFromRequest` extension) and drop the raw header requirement.

This handoff leaves auth as **header-based** for v1; upgrading to JWT is localized to `src/lib/member-sites/auth.ts`.

---

## 8. Operational checklist (Vercel)

1. Create / link **Vercel Postgres**; confirm **`POSTGRES_URL`** on the project.
2. Run **`scripts/member-sites-schema.sql`** in the Neon SQL editor.
3. Set Fusion env vars (`FUSION_API_KEY`, `FUSION_API_URL`, etc.) for production hostname.
4. Align **`FUSION_API_URL`** with Fusion **authorized origins**.
5. Redeploy after env changes.
6. (Optional) Restrict **`/api/test`** in production.

---

## 9. Key source files (index)

| Area | Path |
|------|------|
| Member auth resolution | `src/lib/member-sites/auth.ts` |
| Member DB repo | `src/lib/member-sites/repo.ts` |
| Member env defaults | `src/lib/member-sites/env.ts` |
| Config validation | `src/lib/member-sites/validate-config.ts` |
| Client fetch helper | `src/lib/member-sites/client-fetch.ts` |
| List + create API | `src/app/api/member/sites/route.ts` |
| Get + update API | `src/app/api/member/sites/[siteId]/route.ts` |
| My sites UI | `src/app/member/sites/page.tsx` |
| Builder (load/save) | `src/app/builder/page.tsx` |
| SQL schema | `scripts/member-sites-schema.sql` |
| Fusion env | `src/app/lib/fusion-env.ts` |
| Fusion BFF allowlist | `src/app/lib/fusion-bff-path.ts` |

---

## 10. Contact / questions

Product owner can clarify business rules (default site count, billing tiers vs `member_site_quotas`, whether Fusion becomes source of truth for JSON). Technical questions on this codebase are best answered by inspecting the paths above and `.env.example`.

**Document version:** May 2026 (align with current `main`).
