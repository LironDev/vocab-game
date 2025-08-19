// utils/speech.js

/**
 * Lightweight Web Speech helpers – generic by language.
 * Usage:
 *   speak("Hello", { lang: "en-US" });
 *   speak("こんにちは", { lang: "ja-JP", rate: 0.9 });
 */

let voicesCache = [];
let voicesReadyResolve;
let voicesReadyPromise;

/** Detect Web Speech API support */
export function supportsSpeech() {
  return typeof window !== "undefined" &&
         "speechSynthesis" in window &&
         "SpeechSynthesisUtterance" in window;
}

/** Internal: fetch & cache voices (with event fallback) */
async function loadVoicesOnce() {
  if (!supportsSpeech()) return [];

  const synth = window.speechSynthesis;
  const got = synth.getVoices();
  if (got && got.length) {
    voicesCache = got;
    return voicesCache;
  }

  // Wait for voiceschanged or give a short timeout fallback
  if (!voicesReadyPromise) {
    voicesReadyPromise = new Promise((resolve) => {
      voicesReadyResolve = resolve;
      const handler = () => {
        const list = synth.getVoices();
        if (list && list.length) {
          voicesCache = list;
          synth.removeEventListener("voiceschanged", handler);
          resolve(voicesCache);
        }
      };
      synth.addEventListener("voiceschanged", handler);

      // Safety: resolve anyway after 1s with whatever we have
      setTimeout(() => {
        synth.removeEventListener("voiceschanged", handler);
        resolve(synth.getVoices() || []);
      }, 1000);
    });
  }

  const voices = await voicesReadyPromise;
  if (voices && voices.length) voicesCache = voices;
  return voicesCache;
}

/** Public: ensure we have voices available before speaking */
export async function initVoices() {
  return loadVoicesOnce();
}

/** Utility: normalize language tags safely */
function normLangTag(tag) {
  return (tag || "").toString().toLowerCase();
}

/**
 * Prefer a voice that matches the full lang tag (e.g. "ja-JP"), then base ("ja"),
 * and bias towards "Google" voices when available (they're often higher quality).
 */
export function selectVoiceForLanguage(lang) {
  const voices = voicesCache;
  if (!voices || !voices.length) return null;

  const wanted = normLangTag(lang);
  const base = wanted.split("-")[0];

  const exact = voices.filter(v => normLangTag(v.lang) === wanted);
  const exactGoogle = exact.find(v => /google/i.test(v.name)) || exact[0];
  if (exactGoogle) return exactGoogle;

  const baseMatches = voices.filter(v => normLangTag(v.lang).startsWith(base));
  const baseGoogle = baseMatches.find(v => /google/i.test(v.name)) || baseMatches[0];
  if (baseGoogle) return baseGoogle;

  return null;
}

/**
 * Fallback search with preference order (array of lang tags).
 * Example: findBestVoice(["ja-JP", "ja", "en-US"])
 */
export function findBestVoice(preferences = []) {
  for (const tag of preferences) {
    const v = selectVoiceForLanguage(tag);
    if (v) return v;
  }
  // Final fallback: first available voice
  return (voicesCache && voicesCache[0]) || null;
}

/** Optional helper to list voices in UI (debug/selector) */
export function getAvailableVoices() {
  return voicesCache.slice();
}

/** Cancel any queued/ongoing speech */
export function cancelSpeech() {
  if (supportsSpeech()) window.speechSynthesis.cancel();
}

/**
 * Speak text with options.
 * opts:
 *  - lang: BCP-47 tag (e.g., "en-US", "ja-JP") – required for correct TTS voice
 *  - rate, pitch, volume: numbers
 *  - voice: a SpeechSynthesisVoice to force
 *  - queue: if false (default), cancels anything currently speaking
 *  - onEnd: callback when utterance ends
 */
export async function speak(text, opts = {}) {
  if (!supportsSpeech()) return false;
  const trimmed = (text || "").toString().trim();
  if (!trimmed) return false;

  const {
    lang = "en-US",
    rate = 1,
    pitch = 1,
    volume = 1,
    voice = null,
    queue = false,
    onEnd,
  } = opts;

  // Ensure voices are loaded once (async)
  await initVoices();

  if (!queue) {
    window.speechSynthesis.cancel();
  }

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;

  // Prefer explicit voice; otherwise pick best for lang
  let selectedVoice = voice || selectVoiceForLanguage(lang);

  // Fallback: try broader preferences, then any voice
  if (!selectedVoice) {
    const prefs = [lang, lang.split("-")[0], "en-US"];
    selectedVoice = findBestVoice(prefs);
  }

  if (selectedVoice) {
    utter.voice = selectedVoice;
    // Some engines ignore utter.lang if voice.lang is set; keep them aligned
    utter.lang = selectedVoice.lang || lang;
  }

  return new Promise((resolve) => {
    if (typeof onEnd === "function") {
      utter.onend = onEnd;
    }
    try {
      window.speechSynthesis.speak(utter);
      resolve(true);
    } catch (e) {
      console.warn("speech: failed to speak", e);
      resolve(false);
    }
  });
}
