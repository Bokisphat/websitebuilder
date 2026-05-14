import Link from "next/link";
import { HomeTemplateGrid } from "./HomeTemplateGrid";

const demographicItems = [
  "General wealth creation",
  "Positive cashflow",
  "SMSF",
  "First home buyers",
  "Dual income property",
  "NDIS",
  "Custom",
] as const;

export function MarketingHome() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#e7e7ea] text-zinc-900">
      {/* Soft warm highlight — replaces violet/cyan glow */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute left-1/2 top-0 h-[min(55vh,32rem)] w-[min(95vw,56rem)] -translate-x-1/2 -translate-y-[10%] rounded-[100%] blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,145,66,0.18), rgba(232,145,66,0.05) 45%, transparent 72%)",
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-[14rem] w-full max-w-4xl -translate-x-1/2 bg-gradient-to-b from-[#E89142]/[0.08] via-transparent to-transparent"
        />
      </div>

      <header className="relative z-20 border-b border-zinc-300/80 bg-[#e7e7ea]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[#E89142] to-[#f0a866] text-sm font-bold text-white shadow-sm">
              F
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-zinc-900">Fusion Sites</p>
              <p className="text-xs text-zinc-600">Property transaction websites</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a href="#templates" className="text-zinc-600 transition hover:text-zinc-900">
              Templates
            </a>
            <a href="#api" className="text-zinc-600 transition hover:text-zinc-900">
              Listings & API
            </a>
            <Link
              href="/member/sites"
              className="text-zinc-600 transition hover:text-zinc-900"
            >
              My sites
            </Link>
            <Link
              href="/builder"
              className="rounded-lg bg-[#E89142] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d48238]"
            >
              Open builder
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-6 pb-8 pt-16 text-center md:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E89142]">Website builder</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
            Build property transaction sites that match how you go to market
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Fusion Sites is a website builder for professionals selling{" "}
            <strong className="font-medium text-zinc-800">new property</strong>. Create fast, informative sites with
            distinct themes, then run separate properties or brands for the audiences you care about — all driven by the
            same listing engine when you are ready to connect.
          </p>
        </section>

        <section className="border-y border-zinc-300/70 bg-white/50">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-12">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">What you are building</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  Each site is a focused property transaction experience: education, social proof, and clear paths to
                  enquiry. Swap themes and copy so the story fits the room — from wealth creation to yield-first, SMSF,
                  or first home journeys — without losing your brand discipline.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-zinc-700">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E89142] text-center text-xs font-bold text-white shadow-sm">
                    1
                  </span>
                  <span>
                    Choose a starting template tuned to a demographic; customise sections and branding in the builder.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E89142] text-center text-xs font-bold text-white shadow-sm">
                    2
                  </span>
                  <span>
                    Run multiple public sites for different funnels (wealth, cashflow, SMSF, FHB, dual income, and more).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E89142] text-center text-xs font-bold text-white shadow-sm">
                    3
                  </span>
                  <span>
                    Connect the API so each site only shows the property types and locations you allow for that brand.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-[#e7e7ea]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-bold text-zinc-900">Demographics you can target</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
              The same new-property inventory can support different marketing stories. Spin up separate sites to speak
              directly to who is in the room today — or combine propositions when your offer does not fit a single box.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {demographicItems.map((label) => (
                <li
                  key={label}
                  className={
                    label === "Custom"
                      ? "rounded-full border border-[#E89142] bg-[#E89142] px-4 py-2 text-sm font-medium text-white shadow-sm"
                      : "rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 shadow-sm"
                  }
                >
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-zinc-300/90 bg-white p-6 shadow-md shadow-zinc-400/15 md:p-7">
              <h3 className="text-sm font-semibold text-zinc-900">Custom: mix and match propositions</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                You are not limited to one narrative per site. In the builder you can blend sections so the homepage
                matches your lead offer while still speaking to secondary needs — for example, a{" "}
                <span className="font-medium text-zinc-800">general wealth creation</span> site with a dedicated{" "}
                <span className="font-medium text-zinc-800">positive cashflow</span> block, or NDIS-specific copy
                alongside investor education. Start from a template, then reorder and add sections until the story fits
                your market.
              </p>
            </div>
          </div>
        </section>

        <section id="api" className="border-t border-zinc-300/70 bg-white/40">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="rounded-2xl border border-zinc-300/90 bg-white p-8 shadow-md shadow-zinc-400/15 md:p-10">
              <h2 className="text-2xl font-bold text-zinc-900">Listings: show the right product on every site</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">
                Behind each site, you can{" "}
                <strong className="font-medium text-zinc-800">configure the API</strong> to control which property
                types, projects, and locations appear. That way a wealth-creation experience does not surface stock meant
                for a different brief, and each demographic-facing site stays credible and on-message.
              </p>
              <p className="mt-4 text-sm text-zinc-500">
                Wiring to your live data layer is a platform concern — the builder here focuses on page structure, copy,
                and conversion patterns you will ship next.
              </p>
            </div>
          </div>
        </section>

        <section id="templates" className="border-t border-zinc-300/70 bg-[#e7e7ea] py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold text-zinc-900">Choose a template to start from</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Six entry points are planned. Four are available today in the builder; the rest are on the roadmap and will
              drop in as we ship each experience.
            </p>
          </div>
          <div className="mt-12 px-6">
            <HomeTemplateGrid />
          </div>
          <div className="mx-auto mt-12 max-w-xl px-6 text-center">
            <p className="text-sm text-zinc-600">
              Prefer to browse? Open the full builder, compare hero and section stacks, and switch templates at any time.
            </p>
            <Link
              href="/builder"
              className="mt-4 inline-block rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              Go to all templates
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-zinc-300/80 bg-[#dfe0e7] py-8 text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Fusion Sites — website builder for new property professionals.</p>
      </footer>
    </div>
  );
}
