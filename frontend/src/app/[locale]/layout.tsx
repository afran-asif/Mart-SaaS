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

  const title = isBn
    ? "শপিলিকা – বাংলাদেশে নিজের অনলাইন স্টোর তৈরির প্ল্যাটফর্ম"
    : "Shopilika – Online Store Builder in Bangladesh";
  const description = isBn
    ? "শপিলিকা বাংলাদেশের জন্য একটি ই-কমার্স প্ল্যাটফর্ম। মিনিটেই নিজের অনলাইন স্টোর খুলুন — কাস্টম সাবডোমেইন, প্রোডাক্ট ও অর্ডার ম্যানেজমেন্ট এবং ক্যাশ অন ডেলিভারি সুবিধা নিয়ে।"
    : "Shopilika is an ecommerce platform for Bangladesh. Launch your own online store in minutes with a custom subdomain, product and order management, and cash on delivery.";

  return {
    title,
    description,
    keywords: isBn
      ? ["অনলাইন স্টোর", "ই-কমার্স প্ল্যাটফর্ম", "বাংলাদেশ", "অনলাইন ব্যবসা", "শপিলিকা", "ফ্রি ট্রায়াল"]
      : ["online store builder", "ecommerce platform Bangladesh", "create online store", "Shopilika", "free trial", "cash on delivery"],
    openGraph: {
      title,
      description,
      siteName: "Shopilika",
      type: "website",
      locale: isBn ? "bn_BD" : "en_US",
    },
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
