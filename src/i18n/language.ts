// Single source of truth for language-specific knobs
export type LangCode = "en" | "jp";

type LangConfig = {
  // field name on your word object to show as the source term
  sourceField: "English" | "Japanese";
  // Web Speech API voice locale
  ttsLocale: string;
  // optional: label to show user
  label: string;
};

export const LANGUAGE_CONFIG: Record<LangCode, LangConfig> = {
  en: { sourceField: "English",  ttsLocale: "en-US", label: "English → Hebrew" },
  jp: { sourceField: "Japanese", ttsLocale: "ja-JP", label: "日本語 → Hebrew"   },
};

export function getLangConfig(lang: LangCode): LangConfig {
  return LANGUAGE_CONFIG[lang] ?? LANGUAGE_CONFIG.en;
}
