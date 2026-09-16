// src/hooks/useTranslation.ts
import { useSelector } from "react-redux";
import { useMemo } from "react";
import type { Language } from "@/redux/languageSlice";

// Import translation files statically
import en from "../../messages/en.json";
import bn from "../../messages/bn.json";

const translations: Record<Language, typeof en> = { en, bn };

/**
 * A simple hook that returns a `t(key)` function.
 * Supports dot-notation: t("login.title")
 */
export function useTranslation() {
  const language = useSelector((state: any) => state.language?.current ?? "en") as Language;

  const t = useMemo(() => {
    const dict = translations[language] ?? translations["en"];

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
  }, [language]);

  return { t, language };
}
