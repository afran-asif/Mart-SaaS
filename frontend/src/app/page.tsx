import Link from "next/link";

// ---------------------------------------------------------------------------
// Vendoo (vendoo.shop) — homepage, design variant 4: "simple / soft SaaS"
// Concept: minimal, airy, modern SaaS feel — one accent color, soft gradient
// blob, floating storefront cards. Drop in as app/page.tsx or pages/index.tsx.
// Fonts: Sora (display + body, one family, few weights).
// Load via next/font — note at bottom.
// ---------------------------------------------------------------------------

const features = [
  {
    title: "Your own storefront",
    body: "Every vendor gets a clean, branded page under vendoo.shop — no code needed.",
  },
  {
    title: "One shared checkout",
    body: "Customers buy from many vendors in a single cart. You just get paid.",
  },
  {
    title: "Simple payouts",
    body: "Commissions are calculated automatically and sent to your account on schedule.",
  },
  {
    title: "Clear analytics",
    body: "See sales, traffic, and top products for your store, updated in real time.",
  },
];

const stats = [
  { value: "1,200+", label: "active vendors" },
  { value: "48", label: "categories" },
  { value: "4.8/5", label: "average vendor rating" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#FAFAFC] text-[#15151F] font-[Sora,sans-serif]">
      {/* ---------------- Nav ---------------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-semibold tracking-tight">
          vendoo<span className="text-[#5B4FE9]">.shop</span>
        </span>
        <nav className="hidden items-center gap-8 text-sm text-[#5B5B6B] md:flex">
          <a href="#features" className="hover:text-[#15151F]">Features</a>
          <a href="#pricing" className="hover:text-[#15151F]">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-[#5B5B6B] hover:text-[#15151F] sm:block">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#5B4FE9] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4a3fd6]"
          >
            Start free
          </Link>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-16 text-center md:pt-24">
        {/* soft gradient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #5B4FE9 0%, #FF7A59 60%, transparent 80%)",
          }}
        />

        <span className="inline-block rounded-full bg-[#5B4FE9]/10 px-4 py-1.5 text-xs font-medium text-[#5B4FE9]">
          Multi-vendor marketplace platform
        </span>
        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Every seller, one
          <br />
          beautiful storefront.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-[#5B5B6B]">
          Vendoo lets vendors open a store in minutes and sell inside one
          shared marketplace — vendoo.shop.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-[#5B4FE9] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-[#5B4FE9]/20 transition hover:bg-[#4a3fd6]"
          >
            Open your store
          </Link>
          <Link
            href="/marketplace"
            className="rounded-full bg-white px-7 py-3 text-sm font-medium text-[#15151F] shadow-sm ring-1 ring-[#E7E7EE] transition hover:ring-[#5B4FE9]"
          >
            Browse marketplace
          </Link>
        </div>

        {/* floating storefront cards — light signature touch */}
        <div className="relative mx-auto mt-20 h-56 max-w-md">
          <div className="absolute left-1/2 top-0 w-56 -translate-x-1/2 -rotate-6 rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-[#E7E7EE]">
            <div className="h-2 w-10 rounded-full bg-[#FF7A59]" />
            <div className="mt-3 text-sm font-semibold">Maya's Ceramics</div>
            <div className="text-xs text-[#9A9AAA]">124 orders this week</div>
          </div>
          <div className="absolute left-1/2 top-8 w-56 -translate-x-1/2 rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-[#E7E7EE]">
            <div className="h-2 w-10 rounded-full bg-[#5B4FE9]" />
            <div className="mt-3 text-sm font-semibold">Nova Electronics</div>
            <div className="text-xs text-[#9A9AAA]">৳48,200 this month</div>
          </div>
          <div className="absolute left-1/2 top-16 w-56 -translate-x-1/2 rotate-6 rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-[#E7E7EE]">
            <div className="h-2 w-10 rounded-full bg-[#22C08A]" />
            <div className="mt-3 text-sm font-semibold">Rong Fashion</div>
            <div className="text-xs text-[#9A9AAA]">New order · 2m ago</div>
          </div>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="grid grid-cols-3 divide-x divide-[#E7E7EE] rounded-2xl bg-white py-8 shadow-sm ring-1 ring-[#E7E7EE]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-semibold text-[#5B4FE9] md:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-[#9A9AAA] md:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need to sell
          </h2>
          <p className="mt-3 text-[#5B5B6B]">
            No plugins, no setup headaches — it just works out of the box.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E7E7EE] transition hover:shadow-md"
            >
              <div className="h-9 w-9 rounded-full bg-[#5B4FE9]/10" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-[#5B5B6B]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section id="pricing" className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-3xl bg-[#15151F] px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to open your store?
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[#B8B8C6]">
            Free to list. You only pay a small commission once you make a sale.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-[#5B4FE9] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#6c60f0]"
          >
            Start free today
          </Link>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E7E7EE] pt-8 text-sm text-[#9A9AAA] md:flex-row">
          <span className="font-semibold text-[#15151F]">vendoo.shop</span>
          <span>© {new Date().getFullYear()} Vendoo. Made for every seller.</span>
        </div>
      </footer>
    </div>
  );
}

/*
  Font setup (add once in app/layout.tsx):

  import { Sora } from "next/font/google";

  const sora = Sora({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-sora" });

  Then map this to the "Sora" family referenced in the className strings above
  via tailwind.config theme.fontFamily, or swap the className references
  directly to your configured utility class.
*/
