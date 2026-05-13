"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type BaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

function classes(variant: "primary" | "ghost", extra?: string) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-primary)]";
  const ghost =
    "border border-white/20 bg-transparent text-zinc-100 hover:bg-white/10 hover:border-white/30";
  const primary = "shadow-lg shadow-black/30";
  return [base, variant === "primary" ? primary : ghost, extra].filter(Boolean).join(" ");
}

export function BrandedButton({
  variant = "primary",
  className,
  children,
  ...rest
}: BaseProps & ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={classes(variant, className)}
      style={
        variant === "primary"
          ? { backgroundColor: "var(--site-primary)", color: "#09090b" }
          : { color: "var(--site-secondary)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function BrandedLinkButton({
  href,
  variant = "primary",
  className,
  children,
}: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      className={classes(variant, className)}
      style={
        variant === "primary"
          ? { backgroundColor: "var(--site-primary)", color: "#09090b" }
          : { color: "var(--site-secondary)" }}
    >
      {children}
    </Link>
  );
}
