import React, { createContext, useContext, useState, useMemo } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ initial = "en", children }) {
  const [lang, setLang] = useState(initial);

  const LANGUAGE_CONFIG = {
    en: { sourceField: "English", ttsLocale: "en-US", label: "English → Hebrew" },
    jp: { sourceField: "Japanese", ttsLocale: "ja-JP", label: "日本語 → Hebrew" },
  };

  const value = useMemo(() => {
    const config = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.en;
    return {
      lang,
      setLang,
      config,
      available: Object.entries(LANGUAGE_CONFIG).map(([code, { label }]) => ({
        code,
        label,
      })),
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
