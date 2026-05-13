"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 2 * 1024 * 1024;

function isHostedLogoUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

type Props = {
  logo: string | undefined;
  onChange: (next: string | undefined) => void;
};

/** Upload file as data URL or paste a hosted HTTPS URL — stored on site branding. */
export function LogoUploadField({ logo, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const hostedUrlValue = logo && isHostedLogoUrl(logo) ? logo : "";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (PNG, JPG, WebP, SVG, …).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onChange(result);
      }
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {logo ? (
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-16 max-w-[180px] shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" className="max-h-12 max-w-full object-contain" />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-fit rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Replace file…
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="w-fit text-xs font-medium text-zinc-600 hover:text-red-700"
            >
              Remove logo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-dashed border-zinc-400 bg-white px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Upload logo image…
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase text-zinc-500">Or paste logo URL</span>
        <input
          type="url"
          inputMode="url"
          placeholder="https://yourcdn.com/logo.png"
          value={hostedUrlValue}
          onChange={(e) => {
            const v = e.target.value.trim();
            setError(null);
            onChange(v === "" ? undefined : v);
          }}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[var(--fusion-builder-accent)]/70"
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <p className="text-xs leading-relaxed text-zinc-500">
        Uploads are embedded in your site draft (keep under 2 MB). For production, prefer hosting the file and pasting a
        stable HTTPS URL.
      </p>
    </div>
  );
}
