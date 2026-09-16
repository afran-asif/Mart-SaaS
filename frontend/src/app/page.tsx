"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, store } = useSelector((state: any) => state.auth || {});
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { t } = useTranslation();

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
      title: t("features.items.0.title"),
      description: t("features.items.0.description"),
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: t("features.items.1.title"),
      description: t("features.items.1.description"),
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: t("features.items.2.title"),
      description: t("features.items.2.description"),
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: t("features.items.3.title"),
      description: t("features.items.3.description"),
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t("features.items.4.title"),
      description: t("features.items.4.description"),
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: t("features.items.5.title"),
      description: t("features.items.5.description"),
    },
  ];

  const steps = [
    {
      num: "01",
      title: t("howItWorks.steps.0.title"),
      desc: t("howItWorks.steps.0.desc"),
    },
    {
      num: "02",
      title: t("howItWorks.steps.1.title"),
      desc: t("howItWorks.steps.1.desc"),
    },
    {
      num: "03",
      title: t("howItWorks.steps.2.title"),
      desc: t("howItWorks.steps.2.desc"),
    },
  ];

  const faqs = [
    {
      q: t("faq.items.0.q"),
      a: t("faq.items.0.a"),
    },
    {
      q: t("faq.items.1.q"),
      a: t("faq.items.1.a"),
    },
    {
      q: t("faq.items.2.q"),
      a: t("faq.items.2.a"),
    },
    {
      q: t("faq.items.3.q"),
      a: t("faq.items.3.a"),
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
              {t("nav.features")}
            </a>
            <a href="#how-it-works" className="hover:text-orange-600 transition-colors">
              {t("nav.howItWorks")}
            </a>
            <a href="#showcase" className="hover:text-orange-600 transition-colors">
              {t("nav.storefront")}
            </a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">
              {t("nav.pricing")}
            </a>
            <a href="#faq" className="hover:text-orange-600 transition-colors">
              {t("nav.faq")}
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher variant="dark" />
            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {store?.storeName || user?.name || "Vendor"}
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
                >
                  <span>{t("nav.dashboard")}</span>
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
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-orange-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
                >
                  {t("nav.getStarted")}
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
                {t("nav.features")}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                {t("nav.howItWorks")}
              </a>
              <a
                href="#showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                {t("nav.storefront")}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                {t("nav.pricing")}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
              >
                {t("nav.faq")}
              </a>
            </nav>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex justify-center pb-1">
                <LanguageSwitcher variant="dark" />
              </div>
              {mounted && isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-700 transition"
                >
                  {t("nav.dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-700 transition"
                  >
                    {t("nav.getStarted")}
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
            {t("hero.badge")}
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-6xl sm:leading-[1.15]">
            {t("hero.heading1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
              {t("hero.heading2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
            {t("hero.subtitle")}
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
              {t("hero.claimButton")}
            </button>
          </form>

          {/* Quick Action Links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {t("hero.feature1")}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {t("hero.feature2")}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {t("hero.feature3")}
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
                <span className="text-gray-400">Today&apos;s Sales</span>
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
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">{t("stats.setupTime")}</div>
          </div>
          <div className="text-center p-3 border-l border-gray-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">100%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">{t("stats.dataIsolation")}</div>
          </div>
          <div className="text-center p-3 border-t md:border-t-0 md:border-l border-gray-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">৳0</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">{t("stats.setupFees")}</div>
          </div>
          <div className="text-center p-3 border-t md:border-t-0 border-l border-gray-100">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">99.9%</div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">{t("stats.uptime")}</div>
          </div>
        </div>
      </section>

      {/* ---------------- Features Section ---------------- */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-gray-100">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            {t("features.badge")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            {t("features.subtitle")}
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
                <span>{t("features.learnMore")}</span>
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
              {t("howItWorks.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              {t("howItWorks.subtitle")}
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
              <span>{t("howItWorks.getStarted")}</span>
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
                {t("showcase.badge")}
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {t("showcase.title")}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
                {t("showcase.subtitle")}
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                    ✓
                  </div>
                  <span className="text-sm text-gray-200">{t("showcase.point1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                    ✓
                  </div>
                  <span className="text-sm text-gray-200">{t("showcase.point2")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                    ✓
                  </div>
                  <span className="text-sm text-gray-200">{t("showcase.point3")}</span>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition"
                >
                  {t("showcase.createAccount")}
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition border border-white/10"
                >
                  {t("showcase.loginDashboard")}
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
            {t("pricing.badge")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("pricing.starterLabel")}</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">৳0</span>
                <span className="text-sm font-medium text-gray-500">{t("pricing.starterFree")}</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                {t("pricing.starterDesc")}
              </p>

              <ul className="mt-6 space-y-3 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> {t("pricing.starterFeature1")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> {t("pricing.starterFeature2")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> {t("pricing.starterFeature3")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold">✓</span> {t("pricing.starterFeature4")}
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full text-center rounded-xl border-2 border-orange-600 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
            >
              {t("pricing.starterCta")}
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-3xl bg-gradient-to-b from-orange-600 to-orange-700 p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {t("pricing.popular")}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100">{t("pricing.proLabel")}</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">৳999</span>
                <span className="text-sm font-medium text-orange-100">{t("pricing.proMonth")}</span>
              </div>
              <p className="mt-3 text-xs text-orange-100">
                {t("pricing.proDesc")}
              </p>

              <ul className="mt-6 space-y-3 text-xs text-orange-50">
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> {t("pricing.proFeature1")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> {t("pricing.proFeature2")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> {t("pricing.proFeature3")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold">✓</span> {t("pricing.proFeature4")}
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full text-center rounded-xl bg-white py-3 text-sm font-bold text-orange-600 shadow-md hover:bg-gray-100 transition"
            >
              {t("pricing.proCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ Section ---------------- */}
      <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-gray-100">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            {t("faq.badge")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t("faq.title")}
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
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-gray-300">
              {t("cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition"
              >
                {t("cta.createStore")}
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-gray-700 bg-gray-800/80 px-7 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800 transition"
              >
                {t("cta.signIn")}
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
                {t("footer.tagline")}
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t("footer.platform")}</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-600">
                <li>
                  <a href="#features" className="hover:text-orange-600 transition">
                    {t("footer.features")}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-orange-600 transition">
                    {t("footer.howItWorks")}
                  </a>
                </li>
                <li>
                  <a href="#showcase" className="hover:text-orange-600 transition">
                    {t("footer.storeShowcase")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-orange-600 transition">
                    {t("footer.pricingPlans")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Vendor Portal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t("footer.vendorPortal")}</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-600">
                <li>
                  <Link href="/login" className="hover:text-orange-600 transition">
                    {t("footer.vendorLogin")}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-orange-600 transition">
                    {t("footer.registerStore")}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-orange-600 transition">
                    {t("footer.dashboardOverview")}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/products" className="hover:text-orange-600 transition">
                    {t("footer.productManagement")}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/orders" className="hover:text-orange-600 transition">
                    {t("footer.orderTracking")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Settings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t("footer.manage")}</h4>
              <ul className="mt-4 space-y-2.5 text-xs text-gray-600">
                <li>
                  <Link href="/dashboard/settings" className="hover:text-orange-600 transition">
                    {t("footer.storeSettings")}
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-orange-600 transition">
                    {t("footer.faq")}
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-orange-600 transition">
                    {t("footer.signOut")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} MARTsaas Core Engine. {t("footer.rights")}</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-gray-600 transition">
                {t("footer.vendorAccess")}
              </Link>
              <Link href="/register" className="hover:text-gray-600 transition">
                {t("footer.createStorefront")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
