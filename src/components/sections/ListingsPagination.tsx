"use client";

type ListingsPaginationProps = {
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Styling preset for fusion marketing site vs themed builder pages */
  variant: "dark" | "themed";
  className?: string;
};

export function ListingsPagination({
  page,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  variant,
  className = "",
}: ListingsPaginationProps) {
  if (!hasPrev && !hasNext) return null;

  const btnBase =
    variant === "dark"
      ? "rounded-xl border border-white/15 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-40"
      : "rounded-xl border border-[var(--fs-border)] bg-[var(--fs-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--fs-heading)] hover:bg-[var(--fs-card)] disabled:cursor-not-allowed disabled:opacity-40";

  const labelClass =
    variant === "dark" ? "text-sm tabular-nums text-zinc-400" : "text-sm tabular-nums text-[var(--fs-subtle)]";

  return (
    <nav
      className={`mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${className}`}
      aria-label="Listing pages"
    >
      <button type="button" className={btnBase} disabled={!hasPrev} onClick={onPrev}>
        Previous
      </button>
      <span className={labelClass}>Page {page}</span>
      <button type="button" className={btnBase} disabled={!hasNext} onClick={onNext}>
        Next
      </button>
    </nav>
  );
}
