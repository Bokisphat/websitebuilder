import { getFusionServerConfig } from "../../lib/fusion-env";
import { fusionAuthHeaders } from "../../lib/fusion-upstream";

const TEXT_PREVIEW = 2000;

type EnquiryBody = {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  project_id?: unknown;
};

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!json || typeof json !== "object") {
    return Response.json({ ok: false, error: "Expected a JSON object" }, { status: 400 });
  }

  const b = json as EnquiryBody;
  const first_name = str(b.first_name);
  const last_name = str(b.last_name);
  const email = str(b.email);
  const phone = str(b.phone);
  const message = str(b.message);

  if (!first_name || !last_name || !email || !phone || !message) {
    return Response.json(
      { ok: false, error: "first_name, last_name, email, phone, and message are required" },
      { status: 400 },
    );
  }

  const config = getFusionServerConfig();
  if (!config) {
    return Response.json(
      { ok: false, error: "Fusion is not configured (set FUSION_API_KEY and FUSION_API_URL)" },
      { status: 503 },
    );
  }

  const payload: Record<string, string | number> = {
    source: "api",
    first_name,
    last_name,
    email,
    phone,
    message,
  };

  const pid = b.project_id;
  if (pid !== undefined && pid !== null && pid !== "") {
    if (typeof pid === "number" && Number.isFinite(pid)) {
      payload.project_id = pid;
    } else if (typeof pid === "string" && pid.trim()) {
      const n = Number.parseInt(pid, 10);
      if (!Number.isNaN(n) && String(n) === pid.trim()) payload.project_id = n;
      else payload.project_id = pid.trim();
    }
  }

  const upstream = await fetch(`${config.hostUrl}/api/fusion/leads`, {
    method: "POST",
    headers: {
      ...fusionAuthHeaders(config),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error("[api/enquiries] Fusion leads failed", {
      status: upstream.status,
      preview: text.slice(0, 500),
    });
    return Response.json(
      {
        ok: false,
        error: "Could not submit your enquiry. Please try again shortly.",
        upstreamStatus: upstream.status,
        upstreamText: text.slice(0, TEXT_PREVIEW),
      },
      { status: 502 },
    );
  }

  let parsed: unknown = text;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
  }

  return Response.json({ ok: true, data: parsed });
}
