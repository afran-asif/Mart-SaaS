// src/hooks/useTranslation.ts
import { useSelector, useDispatch } from "react-redux";
import { useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { setLanguage, type Language } from "@/redux/languageSlice";

// Import translation files statically
import en from "../../messages/en.json";
import bn from "../../messages/bn.json";

const translations: Record<Language, typeof en> = { en, bn };

/**
 * Hook that returns:
 * - `t(key)` function with dot-notation support: t("nav.features")
 * - `language`: current language ('en' | 'bn') derived from URL route
 */
export function useTranslation() {
  const dispatch = useDispatch();
  const pathname = usePathname() || "";
  const reduxLang = useSelector((state: any) => state.language?.current ?? "en") as Language;

  // Determine language primarily from URL path (/bn or /bn/...)
  const routeLang: Language = pathname === "/bn" || pathname.startsWith("/bn/") ? "bn" : "en";

  // Sync with Redux, localStorage, and cookie if mismatched
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = routeLang;
      if (reduxLang !== routeLang) {
        dispatch(setLanguage(routeLang));
      }
      document.cookie = `NEXT_LOCALE=${routeLang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [routeLang, reduxLang, dispatch]);

  const activeLang = routeLang || reduxLang;

  const t = useMemo(() => {
    const dict = translations[activeLang] ?? translations["en"];

    return function translate(key: string): string {
      const parts = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = dict;
      for (const part of parts) {
        if (result && typeof result === "object" && part in result) {
          result = result[part];
        } else {
          return key; // fallback: return the key itself
        }
      }
      return typeof result === "string" ? result : key;
    };
  }, [activeLang]);

  return { t, language: activeLang };
}
