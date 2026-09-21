// src/app/[locale]/layout.tsx
import type { Metadata } from "next";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "bn" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isBn = locale === "bn";

  return {
    title: isBn
      ? "Vendoo - মাল্টি-টেন্যান্ট ই-কমার্স প্ল্যাটফর্ম"
      : "Vendoo Core Engine - Multi-Tenant SaaS Platform",
    description: isBn
      ? "কাস্টম সাবডোমেন, সম্পূর্ণ ইনভেন্টরি ও পেমেন্ট ইন্টিগ্রেশন সহ কয়েক মিনিটে নিজস্ব অনলাইন স্টোর তৈরি করুন।"
      : "Launch your branded multi-tenant storefront in minutes with custom subdomain and integrated payments.",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        bn: "/bn",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div data-locale={locale} className="contents">
      {children}
    </div>
  );
}
