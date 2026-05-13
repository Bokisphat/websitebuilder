import { NextResponse } from "next/server";
import type { PexelsSearchPhoto } from "@/lib/pexels-types";

const PEXELS_BASE = "https://api.pexels.com/v1";

type PexelsSearchResponse = { photos: PexelsSearchPhoto[]; total_results: number; page: number; per_page: number };

/**
 * Server-only proxy: keeps PEXELS_API_KEY off the client.
 * @see https://www.pexels.com/api/documentation/
 */
export async function GET(request: Request) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Pexels is not configured. Set PEXELS_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(30, Math.max(1, Number.parseInt(searchParams.get("per_page") ?? "15", 10) || 15));
  const orientation = searchParams.get("orientation");
  // landscape | portrait | square — Pexels optional filter

  const u = new URL(`${PEXELS_BASE}/search`);
  u.searchParams.set("query", query);
  u.searchParams.set("page", String(page));
  u.searchParams.set("per_page", String(perPage));
  if (orientation && ["landscape", "portrait", "square"].includes(orientation)) {
    u.searchParams.set("orientation", orientation);
  }

  const res = await fetch(u.toString(), {
    headers: { Authorization: key },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "Pexels request failed", details: res.status, body: text.slice(0, 200) },
      { status: 502 }
    );
  }

  const data = (await res.json()) as PexelsSearchResponse;
  return NextResponse.json(data);
}
