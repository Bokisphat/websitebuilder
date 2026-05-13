import { NextResponse } from "next/server";
import type { UnsplashSearchResult } from "@/lib/unsplash-types";

type UnsplashSearchResponse = { results: UnsplashSearchResult[]; total: number; total_pages: number };

/**
 * Server-only proxy. Header: `Authorization: Client-ID YOUR_ACCESS_KEY`
 * @see https://unsplash.com/documentation#user-authentication
 */
export async function GET(request: Request) {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "Unsplash is not configured. Set UNSPLASH_ACCESS_KEY in .env.local (Unsplash app → Access Key)." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(30, Math.max(1, Number.parseInt(searchParams.get("per_page") ?? "18", 10) || 18));
  const orientation = searchParams.get("orientation");
  // landscape | portrait | squarish

  const u = new URL("https://api.unsplash.com/search/photos");
  u.searchParams.set("query", query);
  u.searchParams.set("page", String(page));
  u.searchParams.set("per_page", String(perPage));
  if (orientation && ["landscape", "portrait", "squarish"].includes(orientation)) {
    u.searchParams.set("orientation", orientation);
  }

  const res = await fetch(u.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "Unsplash request failed", details: res.status, body: text.slice(0, 200) },
      { status: 502 }
    );
  }

  const data = (await res.json()) as UnsplashSearchResponse;
  return NextResponse.json(data);
}
