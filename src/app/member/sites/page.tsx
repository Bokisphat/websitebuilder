"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { memberSitesClientHeaders } from "@/lib/member-sites/client-fetch";

type SiteItem = {
  id: string;
  name: string;
  publishStatus: string;
  updatedAt: string;
};

export default function MemberSitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteItem[] | null>(null);
  const [maxSites, setMaxSites] = useState<number>(6);
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/member/sites", { headers: memberSitesClientHeaders() });
    const data = (await res.json().catch(() => ({}))) as {
      sites?: SiteItem[];
      maxSites?: number;
      subscriberId?: string;
      error?: string;
    };
    if (!res.ok) {
      setSites(null);
      setError(data.error ?? `Request failed (${res.status})`);
      return;
    }
    setSites(data.sites ?? []);
    if (typeof data.maxSites === "number") setMaxSites(data.maxSites);
    setSubscriberId(data.subscriberId ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createNew = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/member/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...memberSitesClientHeaders() },
        body: JSON.stringify({ name: "New site" }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? `Create failed (${res.status})`);
        return;
      }
      if (data.id) {
        router.push(`/builder?siteId=${encodeURIComponent(data.id)}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const atLimit = sites !== null && sites.length >= maxSites;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-violet-400 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          Member sites
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Your websites</h1>
        <p className="mt-2 max-w-xl text-zinc-400">
          Each Fusion member can keep multiple saved sites (default cap {maxSites} — configurable per member in the
          database). Your Laravel integration should send{" "}
          <code className="rounded bg-zinc-900 px-1 text-violet-300">X-Fusion-Subscriber-Id</code> on requests.
        </p>

        {subscriberId ? (
          <p className="mt-3 text-xs text-zinc-500">
            Subscriber: <span className="text-zinc-400">{subscriberId}</span>
          </p>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
            {error.includes("401") || error.toLowerCase().includes("missing fusion") ? (
              <span className="mt-2 block text-amber-200/90">
                For local testing, set <code className="rounded bg-black/30 px-1">MEMBER_SITES_DEV_SUBSCRIBER</code> in{" "}
                <code className="rounded bg-black/30 px-1">.env.local</code> or{" "}
                <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID</code> (demo only).
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void createNew()}
            disabled={busy || atLimit || !!error}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Creating…" : "New site"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Refresh
          </button>
          {sites !== null ? (
            <span className="text-sm text-zinc-500">
              {sites.length} / {maxSites} used
            </span>
          ) : null}
        </div>

        {atLimit ? (
          <p className="mt-3 text-sm text-amber-200/90">
            Site limit reached. Add or update a row in <code className="text-violet-300">member_site_quotas</code> for
            this subscriber, or raise <code className="text-violet-300">MEMBER_SITES_MAX</code>.
          </p>
        ) : null}

        <ul className="mt-10 space-y-3">
          {sites === null && !error ? <li className="text-zinc-500">Loading…</li> : null}
          {sites?.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-zinc-500">
                  {s.publishStatus} · updated {new Date(s.updatedAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/builder?siteId=${encodeURIComponent(s.id)}`}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
              >
                Open in builder
              </Link>
            </li>
          ))}
        </ul>

        {sites?.length === 0 && !error ? (
          <p className="mt-8 text-zinc-500">No saved sites yet. Create one to get started.</p>
        ) : null}
      </div>
    </div>
  );
}
