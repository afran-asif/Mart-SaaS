"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, store } = useSelector((state: any) => state.auth || {});
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClaimSubdomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = subdomainInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (cleanSub) {
      router.push(`/register?subdomain=${encodeURIComponent(cleanSub)}`);
    } else {
      router.push("/register");
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: "Custom Subdomain Storefronts",
      description:
        "Every vendor gets their own branded storefront under a dedicated subdomain (e.g. yourbrand.martsaas.com) with isolated store routing.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: "Full Inventory & Catalog Control",
      description:
        "Easily upload products with multiple high-resolution images, real-time stock counters, price configurations, and category sorting.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Integrated SSLCommerz & COD",
      description:
        "Accept bKash, Nagad, debit/credit cards, or Cash on Delivery. Configure your own store credentials or use the unified engine.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Real-Time Vendor Analytics",
      description:
        "Track sales volume, completed and pending orders, active customer checkouts, and total revenue directly inside your dashboard.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "High-Speed Cart & Checkout",
      description:
        "Engineered with Redux Toolkit and Next.js SSR for instantaneous product adding, persistent carts, and frictionless customer checkout.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Multi-Tenant Data Isolation",
      description:
        "Enterprise-grade architectural separation guarantees each vendor's products, orders, customers, and revenues remain completely isolated.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Register Your Store",
      desc: "Sign up in 30 seconds, choose your store name, and claim your custom subdomain.",
    },
    {
      num: "02",
      title: "Upload Your Products",
      desc: "Add items with images, stock counts, and prices through your vendor dashboard.",
    },
    {
      num: "03",
      title: "Start Selling & Growing",
      desc: "Share your store link with customers, accept orders, and track your revenue live.",
    },
  ];

  const faqs = [
    {
      q: "What is MARTsaas?",
      a: "MARTsaas is a modern multi-tenant e-commerce platform that allows merchants and vendors to instantly launch their own independent online storefront with custom subdomains, live inventory management, and automated order processing.",
    },
    {
      q: "How does the subdomain work?",
      a: "When you register your store, you pick a subdomain (e.g. 'af-gadgets'). Your store is immediately accessible at af-gadgets.martsaas.com (or in local dev at af-gadgets.localhost:3000 / /store/af-gadgets). All customer traffic and orders are scoped strictly to your store.",
    },
    {
      q: "What payment methods are supported?",
      a: "MARTsaas supports Cash on Delivery (COD) as well as automated online payments via SSLCommerz (supporting bKash, Nagad, Rocket, Visa, Mastercard, and internet banking). Vendors can also configure their own SSLCommerz credentials in store settings.",
    },
    {
      q: "How do I manage my products and orders?",
      a: "Once registered, you get full access to the MARTsaas Vendor Dashboard. From there you can add, edit, or remove products, manage stock levels, view customer order details, and update shipping statuses.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* ---------------- Navigation ---------------- */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
                MART<span className="text-orange-600">saas</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-gray-400">
                Multi-Tenant Commerce
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-orange-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-orange-600 transition-colors">
              How It Works
            </a>
            <a href="#showcase" className="hover:text-orange-600 transition-colors">
              Storefront Preview
            </a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-orange-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {store?.storeName || user?.name || "Vendor"}
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
                >
                  <span>Go to Dashboard</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-orange-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
                >
                  Create Store
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                How It Works
              </a>
              <a
                href="#showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                Storefront Preview
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {mounted && isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-700 transition"
                >
                  Open Vendor Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Vendor Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-700 transition"
                  >
                    Create Free Store
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ---------------- Hero Section ---------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Soft decorative background glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[620px] -translate-x-1/2 rounded-full opacity-35 blur-3xl"
          style={{
            background: "radial-gradient(circle, #f97316 0%, #fbbf24 45%, transparent 75%)",
          }}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-4 py-1.5 text-xs font-semibold text-orange-700 backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
            Next-Gen Multi-Tenant E-Commerce Platform
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-6xl sm:leading-[1.15]">
            Launch Your Online Store.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
              Scale With Multi-Tenant Power.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
            MARTsaas provides entrepreneurs and retailers with independent, lightning-fast
            subdomain storefronts, instant product catalogs, automated checkout, and full vendor analytics.
          </p>

          {/* Interactive Subdomain Claim Bar */}
          <form
            onSubmit={handleClaimSubdomain}
            className="mx-auto mt-9 flex max-w-lg flex-col sm:flex-row items-center gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-gray-200/60 ring-1 ring-gray-200"
          >
            <div className="flex w-full items-center px-3 py-2 sm:py-1">
              <span className="text-xs font-semibold text-gray-400 mr-1 select-none">https://</span>
              <input
                type="text"
                value={subdomainInput}
                onChange={(e) => setSubdomainInput(e.target.value)}
                placeholder="your-store-name"
                className="w-full bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 select-none shrink-0">
                .martsaas.com
              </span>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
            >
              Claim Store
            </button>
          </form>

          {/* Quick Action Links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Zero setup fee
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Instant subdomain activation
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              SSLCommerz & COD ready
            </span>
          </div>

          {/* Floating Storefront Mock Cards */}
          <div className="relative mx-auto mt-14 sm:mt-18 h-64 max-w-lg">
            {/* Left Card */}
            <div className="absolute left-1/2 -translate-x-[75%] top-2 w-60 sm:w-64 -rotate-6 rounded-2xl bg-white p-4.5 text-left shadow-2xl ring-1 ring-gray-200/80 transition hover:rotate-0 hover:z-20 hover:scale-105 duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-block h-2.5 w-10 rounded-full bg-orange-500" />
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <div className="mt-3 text-sm font-bold text-gray-900">Sestone Fashion</div>
              <div className="text-xs text-gray-500">sestone.martsaas.com</div>
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">Today's Sales</span>
                <span className="font-bold text-orange-600">৳48,500</span>
              </div>
            </div>

            {/* Center Top Card */}
            <div className="absolute left-1/2 -translate-x-1/2 top-8 z-10 w-64 sm:w-72 rounded-2xl bg-white p-5 text-left shadow-2xl ring-1 ring-orange-500/30 transition hover:scale-105 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-gray-700">Af Gadgets & Tech</span>
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  Top Vendor
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400 font-mono">af-gadgets.martsaas.com</div>
              <div className="mt-4 grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-gray-500">New Orders</div>
                  <div className="text-sm font-bold text-gray-900">26 Pending</div>
                </div>
                <div className="border-l border-gray-200">
                  <div className="text-[10px] text-gray-500">This Month</div>
                  <div className="text-sm font-bold text-emerald-600">৳1,82,400</div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="absolute left-1/2 -translate-x-[25%] top-4 w-60 sm:w-64 rotate-6 rounded-2xl bg-white p-4.5 text-left shadow-2xl ring-1 ring-gray-200/80 transition hover:rotate-0 hover:z-20 hover:scale-105 duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-block h-2.5 w-10 rounded-full bg-blue-500" />
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  SSLCommerz
                </span>
              </div>
              <div className="mt-3 text-sm font-bold text-gray-900">Fresh Organics</div>
              <div className="text-xs text-gray-500">organics.martsaas.com</div>
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">Cart Checkout</span>
                <span className="font-bold text-gray-800">12s avg time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Stats Section ---------------- */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-200/70">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-600">&lt; 2 min</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">Store Setup Time</div>
          </div>
          <div className="text-center p-3 border-l border-gray-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">100%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">Tenant Data Isolation</div>
          </div>
          <div className="text-center p-3 border-t md:border-t-0 md:border-l border-gray-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">৳0</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">Setup & Listing Fees</div>
          </div>
          <div className="text-center p-3 border-t md:border-t-0 border-l border-gray-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">99.9%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">Uptime & Reliability</div>
          </div>
        </div>
      </section>

      {/* ---------------- Features Section ---------------- */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Built for High-Growth Commerce
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need To Sell Online
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            No complex setup, zero coding required. MARTsaas equips you with professional multi-tenant
            storefronts, real-time inventory tools, and automated ordering.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl bg-white p-6 sm:p-7 shadow-sm ring-1 ring-gray-200/80 transition hover:shadow-xl hover:ring-orange-500/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.description}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
                <span>Learn more</span>
                <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- How It Works ---------------- */}
      <section id="how-it-works" className="bg-gray-50/70 py-16 sm:py-24 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/60 px-3 py-1 rounded-full">
              Quick 3-Step Setup
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From Zero to Live Store in Minutes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Start accepting orders from customers nationwide with a few simple steps.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="relative rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">
                <span className="text-3xl font-black text-orange-500/30">{step.num}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
            >
              <span>Get Started Now</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Showcase / Dashboard Teaser ---------------- */}
      <section id="showcase" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="rounded-3xl bg-gradient-to-b from-gray-900 to-black p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          {/* subtle background glow */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl pointer-events-none"
          />

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                Merchant Control Center
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                An intuitive dashboard tailored for your daily hustle.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
                Effortlessly manage your catalog, track incoming customer orders, update store branding,
                and inspect live revenue data without ever touching code.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                    ✓
                  </div>
                  <span className="text-sm text-gray-200">Instant product image uploads via Cloudinary</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                    ✓
                  </div>
                  <span className="text-sm text-gray-200">Real-time status updates: Pending, Processing, Delivered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                    ✓
                  </div>
                  <span className="text-sm text-gray-200">Custom SSLCommerz store credentials integration</span>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition"
                >
                  Create Vendor Account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition border border-white/10"
                >
                  Log In to Dashboard
                </Link>
              </div>
            </div>

            {/* Dashboard Mock UI */}
            <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs font-mono text-gray-400">MARTsaas / dashboard</span>
                </div>
                <span className="text-[10px] font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                  Live Engine
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-900 p-3 border border-gray-800">
                  <div className="text-[10px] text-gray-400">Monthly Revenue</div>
                  <div className="text-lg font-bold text-orange-500">৳ 2,45,800</div>
                  <div className="text-[10px] text-emerald-400 mt-1">↑ +18% from last week</div>
                </div>
                <div className="rounded-xl bg-gray-900 p-3 border border-gray-800">
                  <div className="text-[10px] text-gray-400">Total Orders</div>
                  <div className="text-lg font-bold text-white">384 Completed</div>
                  <div className="text-[10px] text-gray-400 mt-1">12 awaiting dispatch</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-gray-400 px-1">Recent Store Transactions</div>
                <div className="flex items-center justify-between rounded-lg bg-gray-900/90 p-2.5 text-xs border border-gray-800/80">
                  <div>
                    <div className="font-semibold text-gray-200">#ORD-9042 · Wireless Earbuds</div>
                    <div className="text-[10px] text-gray-400">Buyer: tanvir@gmail.com · COD</div>
                  </div>
                  <span className="font-bold text-emerald-400">৳ 1,850</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-900/90 p-2.5 text-xs border border-gray-800/80">
                  <div>
                    <div className="font-semibold text-gray-200">#ORD-9041 · Minimalist Backpack</div>
                    <div className="text-[10px] text-gray-400">Buyer: afrin.s@yahoo.com · SSLCommerz</div>
                  </div>
                  <span className="font-bold text-emerald-400">৳ 3,200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Pricing Section ---------------- */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Vendor-First Plans
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Start completely free. Upgrade whenever you are ready to scale with custom domains and advanced tooling.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Starter Vendor</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">৳0</span>
                <span className="text-sm font-medium text-gray-500">/ forever free</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Ideal for individuals and small shops launching their first online storefront.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> 1 Branded Subdomain (.martsaas.com)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> Unlimited Product Uploads
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> Cash on Delivery & SSLCommerz Integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> Real-Time Vendor Dashboard
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full text-center rounded-xl border-2 border-orange-600 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl bg-gradient-to-b from-orange-600 to-orange-700 p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Most Popular
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Pro Merchant</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">৳999</span>
                <span className="text-sm font-medium text-orange-100">/ month</span>
              </div>
              <p className="mt-3 text-xs text-orange-100">
                For established businesses needing custom payment credentials and dedicated support.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-orange-50">
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> Everything in Starter
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> Use Your Own SSLCommerz Merchant Credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> Advanced Sales & Inventory Analytics
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> Priority 24/7 Technical Support
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full text-center rounded-xl bg-white py-3 text-sm font-bold text-orange-600 shadow-md hover:bg-gray-100 transition"
            >
              Launch Pro Store
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ Section ---------------- */}
      <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-gray-100">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200/80 bg-white p-5 transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-base font-semibold text-gray-900 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 text-orange-600 text-lg font-bold">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- Bottom Call to Action ---------------- */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="rounded-3xl bg-gray-900 px-6 sm:px-12 py-12 sm:py-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/30 blur-3xl"
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Launch Your Online Storefront?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-gray-300">
              Join merchants growing with MARTsaas. Set up your inventory and start accepting customer orders today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition"
              >
                Create Your Store Now
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-gray-700 bg-gray-800/80 px-7 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800 transition"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-sm">
                  M
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  MART<span className="text-orange-600">saas</span>
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-xs text-gray-500 leading-relaxed">
                Empowering retailers, entrepreneurs, and independent merchants with dedicated multi-tenant
                e-commerce storefronts and integrated payment workflows.
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <span>Next.js 16</span>
                <span>•</span>
                <span>Redux Toolkit</span>
                <span>•</span>
                <span>SSLCommerz Ready</span>
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Platform</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-600">
                <li>
                  <a href="#features" className="hover:text-orange-600 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-orange-600 transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-orange-600 transition">
                    Store Showcase
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-orange-600 transition">
                    Pricing Plans
                  </a>
                </li>
              </ul>
            </div>

            {/* Vendor Portal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Vendor Portal</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-600">
                <li>
                  <Link href="/login" className="hover:text-orange-600 transition">
                    Vendor Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-orange-600 transition">
                    Register Store
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-orange-600 transition">
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/products" className="hover:text-orange-600 transition">
                    Product Management
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/orders" className="hover:text-orange-600 transition">
                    Order Tracking
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Settings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Manage</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-600">
                <li>
                  <Link href="/dashboard/settings" className="hover:text-orange-600 transition">
                    Store Settings
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-orange-600 transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-orange-600 transition">
                    Sign Out / Switch Store
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} MARTsaas Core Engine. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-gray-600 transition">
                Vendor Access
              </Link>
              <Link href="/register" className="hover:text-gray-600 transition">
                Create Storefront
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
