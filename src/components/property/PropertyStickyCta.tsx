"use client";

export function PropertyStickyCta({
  formId = "property-enquiry-form",
  label = "Enquire now",
}: {
  formId?: string;
  label?: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto w-full max-w-lg">
        <button
          type="button"
          onClick={() => document.getElementById(formId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="w-full rounded-2xl border border-white/10 bg-zinc-900/95 px-6 py-4 text-center text-base font-semibold text-white shadow-2xl shadow-black/50 backdrop-blur hover:bg-zinc-800 transition"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
