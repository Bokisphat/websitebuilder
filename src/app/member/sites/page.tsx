"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearManualSubscriberId,
  getManualSubscriberId,
  memberSitesClientHeaders,
  setManualSubscriberId,
} from "@/lib/member-sites/client-fetch";

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
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [memberNoInput, setMemberNoInput] = useState("");
  const [newSiteName, setNewSiteName] = useState("");

  useEffect(() => {
    setMemberNoInput(getManualSubscriberId() ?? "");
  }, []);

  const load = useCallback(async () => {
    setError(null);
    setErrorHint(null);
    const res = await fetch("/api/member/sites", { headers: memberSitesClientHeaders() });
    const data = (await res.json().catch(() => ({}))) as {
      sites?: SiteItem[];
      maxSites?: number;
      subscriberId?: string;
      error?: string;
      hint?: string;
    };
    if (!res.ok) {
      setSites(null);
      setError(data.error ?? `Request failed (${res.status})`);
      setErrorHint(typeof data.hint === "string" ? data.hint : null);
      return;
    }
    setSites(data.sites ?? []);
    if (typeof data.maxSites === "number") setMaxSites(data.maxSites);
    setSubscriberId(data.subscriberId ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const applyMemberNumber = () => {
    const t = memberNoInput.trim();
    if (!t || !/^\d+$/.test(t)) {
      setErrorHint(null);
      setError("Enter your Fusion member number (digits only, e.g. 9711).");
      return;
    }
    setManualSubscriberId(t);
    void load();
  };

  const clearSavedMemberNumber = () => {
    clearManualSubscriberId();
    setMemberNoInput("");
    void load();
  };

  const createNew = async () => {
    setBusy(true);
    setError(null);
    setErrorHint(null);
    try {
      const title = newSiteName.trim() || "New site";
      const res = await fetch("/api/member/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...memberSitesClientHeaders() },
        body: JSON.stringify({ name: title }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string; hint?: string };
      if (!res.ok) {
        setError(data.error ?? `Create failed (${res.status})`);
        setErrorHint(typeof data.hint === "string" ? data.hint : null);
        return;
      }
      if (data.id) {
        setNewSiteName("");
        router.push(`/builder?siteId=${encodeURIComponent(data.id)}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const atLimit = sites !== null && sites.length >= maxSites;
  const hasSubscriberHeader =
    Boolean(getManualSubscriberId()) || Boolean(process.env.NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID?.trim());

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

        <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Fusion member number</p>
          <p className="mt-1 text-xs text-zinc-500">
            Same id as in the CRM URL:{" "}
            <code className="text-zinc-400">/users/subscriber/show/</code>
            <strong className="text-zinc-300">9711</strong>. Stored only in this browser until IT connects Fusion.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="block min-w-[12rem] flex-1">
              <span className="sr-only">Member number</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="e.g. 9711"
                value={memberNoInput}
                onChange={(e) => setMemberNoInput(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
              />
            </label>
            <button
              type="button"
              onClick={() => applyMemberNumber()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Save &amp; load
            </button>
            <button
              type="button"
              onClick={() => clearSavedMemberNumber()}
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Clear
            </button>
          </div>
        </div>

        {subscriberId ? (
          <p className="mt-3 text-xs text-zinc-500">
            Active subscriber: <span className="text-zinc-400">{subscriberId}</span>
          </p>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
            {errorHint ? (
              <span className="mt-2 block text-amber-200/90">
                {errorHint}
              </span>
            ) : null}
            {error.includes("401") || error.toLowerCase().includes("missing fusion") ? (
              <span className="mt-2 block text-amber-200/90">
                Enter your member number above and click <strong>Save &amp; load</strong>, or set{" "}
                <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_DEV_FUSION_SUBSCRIBER_ID</code> on Vercel for a
                fixed demo id.
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 space-y-2">
          <label className="block max-w-md">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Name for next new site (optional)</span>
            <input
              type="text"
              autoComplete="off"
              placeholder="e.g. Smith portfolio"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              disabled={busy || atLimit || !hasSubscriberHeader}
              className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 disabled:opacity-50"
            />
          </label>
          <p className="text-xs text-zinc-500">
            Shown in your list below. You can also change <strong className="font-medium text-zinc-400">Site name</strong> in
            the builder (Home page) — it will update this list after save.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void createNew()}
            disabled={busy || atLimit || !hasSubscriberHeader}
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

        {!hasSubscriberHeader ? (
          <p className="mt-2 text-xs text-zinc-500">Save a member number above to enable New site.</p>
        ) : null}

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
