// src/redux/languageSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "bn";

interface LanguageState {
  current: Language;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("language") as Language;
    if (saved === "en" || saved === "bn") return saved;
  }
  return "en";
};

const initialState: LanguageState = {
  current: "en", // default; rehydrated on mount
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.current = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("language", action.payload);
      }
    },
    rehydrateLanguage(state) {
      state.current = getInitialLanguage();
    },
  },
});

export const { setLanguage, rehydrateLanguage } = languageSlice.actions;
export default languageSlice.reducer;
