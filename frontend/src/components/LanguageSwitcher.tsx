// src/components/LanguageSwitcher.tsx
"use client";

import { useDispatch, useSelector } from "react-redux";
import { setLanguage, type Language } from "@/redux/languageSlice";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
];

interface LanguageSwitcherProps {
  /** "light" = white text (for dark/orange backgrounds), "dark" = gray text (for white backgrounds) */
  variant?: "light" | "dark";
}

export default function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const reduxLang = useSelector((state: any) => state.language?.current ?? "en") as Language;
  
  // Prefer URL route prefix for current active language indicator
  const current: Language = pathname === "/bn" || pathname.startsWith("/bn/") ? "bn" : (pathname === "/en" || pathname.startsWith("/en/") ? "en" : reduxLang);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (code: Language) => {
    dispatch(setLanguage(code));
    if (typeof window !== "undefined") {
      document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
    }
    setOpen(false);

    // Compute localized URL
    let newPath = pathname;
    if (pathname.startsWith("/en")) {
      newPath = pathname.replace(/^\/en/, `/${code}`);
    } else if (pathname.startsWith("/bn")) {
      newPath = pathname.replace(/^\/bn/, `/${code}`);
    } else {
      newPath = `/${code}${pathname === "/" ? "" : pathname}`;
    }

    if (newPath !== pathname) {
      router.push(newPath);
    }
  };

  const buttonClass =
    variant === "light"
      ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors"
      : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={buttonClass}
        aria-label="Select language"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        {/* Chevron icon */}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                ${
                  lang.code === current
                    ? "bg-orange-50 text-orange-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === current && (
                <svg
                  className="ml-auto w-3.5 h-3.5 text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
