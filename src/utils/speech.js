// src/utils/speech.js

/**
 * כלי עבודה נוח ל-Web Speech API (SpeechSynthesis)
 * כולל:
 *  - טעינת קולות אסינכרונית (כולל התממשקות ל-voiceschanged)
 *  - בחירת קול לפי רשימת שפות מועדפת (e.g., ["ja-JP", "ja", "en-US"])
 *  - פונקציית speak גמישה עם rate/pitch/volume/queue
 *  - בדיקת תמיכה וביטול (cancel)
 */

let voicesCache = null;
let voicesPromise = null;

/** בודק אם יש תמיכה ב-API */
export function supportsSpeech() {
  return typeof window !== "undefined" && !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
}

/**
 * טוען קולות. מחזיר Promise<Voice[]>
 * מטפל במקרה שבו getVoices() מחזיר [] עד שמתקבל 이벤트 voiceschanged.
 */
export function initVoices() {
  if (!supportsSpeech()) {
    return Promise.resolve([]);
  }
  if (voicesCache && voicesCache.length) {
    return Promise.resolve(voicesCache);
  }
  if (voicesPromise) {
    return voicesPromise;
  }

  voicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const tryGet = () => {
      const list = synth.getVoices();
      if (list && list.length) {
        voicesCache = list;
        resolve(list);
        return true;
      }
      return false;
    };

    // ניסיון מיידי
    if (tryGet()) return;

    // האזנה לאירוע טעינת קולות
    const onChange = () => {
      if (tryGet()) {
        synth.removeEventListener("voiceschanged", onChange);
      }
    };
    synth.addEventListener("voiceschanged", onChange);

    // גיבוי: ב-iOS לפעמים צריך "לנדנד"
    setTimeout(() => {
      tryGet();
    }, 350);
  });

  return voicesPromise;
}

/**
 * בוחר את הקול הכי מתאים לפי רשימת שפות מועדפת (לפי startsWith על voice.lang)
 * לדוגמה: ["ja-JP","ja","en-US"]
 */
export function findBestVoice(preferredLangs = []) {
  if (!voicesCache || !voicesCache.length) return null;

  // חיפוש מלא לפי startsWith בסדר העדיפות
  for (const pref of preferredLangs) {
    const v = voicesCache.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith(pref.toLowerCase()));
    if (v) return v;
  }

  // גיבוי: קול ברירת מחדל של הדפדפן
  return voicesCache.find((v) => v.default) || voicesCache[0] || null;
}

/**
 * דיבור טקסט
 * @param {string} text - הטקסט להקראה
 * @param {Object} opts
 * @param {string} [opts.lang="en-US"] - שפת ההקראה (ישפיע על בחירת הקול)
 * @param {number} [opts.rate=1] - מהירות (0.1–10)
 * @param {number} [opts.pitch=1] - גובה קול (0–2)
 * @param {number} [opts.volume=1] - עוצמה (0–1)
 * @param {SpeechSynthesisVoice|null} [opts.voice=null] - קול ספציפי (אם קיים)
 * @param {boolean} [opts.queue=false] - האם להכניס לתור או לבטל תור קודם
 * @param {Function} [opts.onEnd] - callback בסיום
 * @returns {Promise<boolean>} - true אם התחיל לדבר, false אם לא נתמך/אין קולות/אין טקסט
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

  await initVoices();

  if (!queue) {
    window.speechSynthesis.cancel();
  }

  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;

  // ✅ בחירה חכמה של קול לפי שם ספציפי
  let selectedVoice = voice;
  if (!selectedVoice) {
    if (lang === "en-US") {
      selectedVoice = voicesCache.find(v => v.name === "Google US English");
    } else if (lang === "ja-JP") {
      selectedVoice = voicesCache.find(v => v.name === "Google 日本語");
    }
  }

  // אם לא נמצא קול ייעודי, נ fallback ל-findBestVoice
  if (!selectedVoice) {
    const prefs = [lang, lang.split("-")[0], "en-US"];
    selectedVoice = findBestVoice(prefs);
  }

  if (selectedVoice) {
    utter.voice = selectedVoice;
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

/** ביטול דיבור נוכחי */
export function cancel() {
  if (!supportsSpeech()) return;
  window.speechSynthesis.cancel();
}
