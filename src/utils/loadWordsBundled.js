import Papa from "papaparse";
// These imports become file URLs via the bundler
import wordsEnUrl from "../assets/data/words.en.csv";
import wordsJpUrl from "../assets/data/words.jp.csv";

const MAP = { en: wordsEnUrl, jp: wordsJpUrl };

export async function loadWords(lang) {
  const url = MAP[lang] || MAP.en;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true });
  // keep only rows with source + Hebrew
  return (parsed.data || []).filter(r => (r.English || r.Japanese) && r.Hebrew);
}
