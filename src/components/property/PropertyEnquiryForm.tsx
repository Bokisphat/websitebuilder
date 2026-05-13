"use client";

import { useState, type FormEvent } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function PropertyEnquiryForm({
  projectId,
  formId = "property-enquiry-form",
}: {
  projectId?: string;
  formId?: string;
}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting" || status === "success") return;

    const fd = new FormData(e.currentTarget);
    const first_name = String(fd.get("first_name") ?? "").trim();
    const last_name = String(fd.get("last_name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (!first_name || !last_name || !email || !phone || !message) {
      setErrorMessage("Please fill in all fields.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;

    const body: Record<string, string | number> = {
      first_name,
      last_name,
      email,
      phone,
      message,
    };
    if (projectId) body.project_id = projectId;

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: unknown = await res.json().catch(() => null);
      const ok =
        res.ok &&
        json &&
        typeof json === "object" &&
        "ok" in json &&
        (json as { ok?: boolean }).ok === true;

      if (!ok) {
        const err =
          json && typeof json === "object" && "error" in json && typeof (json as { error?: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Something went wrong. Please try again.";
        setErrorMessage(err);
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-6 py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-semibold text-emerald-200">Thank you — your enquiry was sent.</p>
        <p className="mt-2 text-sm text-zinc-400">We&apos;ll be in touch as soon as possible.</p>
      </div>
    );
  }

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-4">
      {status === "error" && errorMessage ? (
        <div
          className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-zinc-400">First name</span>
          <input
            name="first_name"
            type="text"
            required
            autoComplete="given-name"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-zinc-400">Last name</span>
          <input
            name="last_name"
            type="text"
            required
            autoComplete="family-name"
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-400">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-400">Phone</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-zinc-400">Message</span>
        <textarea
          name="message"
          required
          rows={4}
          className="w-full resize-y rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
        />
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit enquiry"}
      </button>
    </form>
  );
}
