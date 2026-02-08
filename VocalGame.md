# README — Vocabulary Game (React, Client-Only, GitHub Pages)

A responsive, single-page React app for learning vocabulary through a quick, kid-friendly quiz. Runs fully client-side (no backend required), reads words from CSV files, supports speech synthesis and sound effects, daily scoring reset, and an optional Firebase integration for a daily leaderboard. Designed to deploy on GitHub Pages.

## Features

* **CSV-driven content** (in `/public`)

  * English deck: `words-en.csv` with headers `English,Hebrew`
  * Japanese deck: `words-jp.csv` with headers `Japanese,Hebrew`
  * Choose deck with `?lang=jp` (otherwise English is default).
* **Game modes** (randomized per question)

  * English → 3 Hebrew options, or Hebrew → 3 English options
  * (Japanese mode: Japanese ↔ Hebrew)
  * Two distractors are sampled randomly from the deck.
* **No repeat until cycle ends**
  Correctly answered words are not repeated until a new game starts.
* **Scoring & streak**

  * Points per correct answer (with streak multiplier).
  * Tracks: score, total questions, correct answers, longest streak.
  * **Daily reset** of score & counters (local-only) — name/gender persist.
* **Feedback**

  * Green for correct, red for wrong, randomized encouragement/try-again messages by gender.
  * Optional **confetti** when crossing score milestones (e.g., every 10,000).
* **Audio**

  * **Speech Synthesis** button on English/Japanese prompts
    Tries specific voices if available:

    * English: `Google US English`
    * Japanese: `Google 日本語`
  * Short **sound effects** for correct/wrong with a sound on/off toggle.
* **Finish screen**

  * Final score, totals, longest streak, **Share** (Web Share API + `html2canvas` fallback), **Restart**.
* **Optional Firebase (Realtime Database)**

  * Save daily scores (`scores/YYYY-MM-DD/{playerKey}`)
    Player key can be `name##uuid` for uniqueness while showing only the name in UI.
  * Daily unique player count, daily Top 10 leaderboard.

* **Theming - NOT IMPLEMENTED YET**

  * Default screen + **Kids Theme screen** via `?theme=kids`.
  * (Optional) Dynamic CSS by theme — see “Dynamic Themes” below.

## Tech Stack

* React (functional components + hooks)
* CSV parsing: [`papaparse`](https://www.papaparse.com/)
* Speech synthesis: Web Speech API
* Canvas screenshot: [`html2canvas`](https://github.com/niklasvh/html2canvas)
* Optional: Firebase (Realtime Database)
* Deployment: GitHub Pages

## Folder Structure

```
/public
  words-en.csv
  words-jp.csv
  /themes               # (optional) dynamic CSS by theme
    kids.css
    pro.css
/src
  /components
    App.js
    Game.js
    Question.js
    Scoreboard.js
    FinishScreen.js
    DailyLeaderboard.js
  /screens
    KidsThemeScreen.js  # themed wrapper using real game data
  /utils
    speech.js           # centralized speech synthesis utilities
  firebase.js           # optional (uses env vars)
  scoreLogger.js        # optional (save/query daily stats)
  styles.css
  index.js
```

> File names in your project may differ slightly; align as needed.

## CSV Formats

**English deck (`/public/words-en.csv`)**

```
English,Hebrew
bridge,גשר
cat,חתול
...
```

**Japanese deck (`/public/words-jp.csv`)**

```
Japanese,Hebrew
こんにちは,שלום
ありがとう,תודה
...
```

> If you prefer Kanji+Furigana inside the same field, use quoted strings, e.g. `"日 (にち)","יום"`.

## Getting Started

```bash
# 1) Install
npm install

# 2) Start dev server
npm start
```

Place your CSV files in `/public`. The app will fetch them at runtime:

* `words-en.csv` for `?lang` not set
* `words-jp.csv` for `?lang=jp`

Open:

* Default: `http://localhost:3000/`
* Japanese deck: `http://localhost:3000/?lang=jp`
* Kids Theme: `http://localhost:3000/?theme=kids`

## Build & Deploy (GitHub Pages)

In `package.json`:

```json
{
  "homepage": "https://<your-username>.github.io/<repo-name>",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0"
  }
}
```

```bash
npm run build
npm run deploy
```

Push to `main` (or your default branch).
Enable GitHub Pages → **Settings → Pages** → Deploy from branch: select `gh-pages` branch.

## Environment Variables (Secrets)

Create `.env.local` (never commit to git):

```
# Firebase (optional)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DB_URL=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

Load these in `src/firebase.js` via `process.env.REACT_APP_...`.

> **Rotate leaked keys immediately** in your Firebase console and update `.env.local`. Never commit secrets.

## Optional: Firebase Realtime Database

Initialize with env vars in `src/firebase.js`:

```js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
});

export const db = getDatabase(app);
```

**Suggested data shape:**

```
/scores/YYYY-MM-DD/{playerKey} => {
  name: "Display Only",
  score: 12345,
  answered: 42,
  correct: 37,
  maxCombo: 9,
  lang: "en" | "jp",
  timestamp: 1699999999999
}
```

> `playerKey` can be `name##uuid`. UI shows only the name (split by `##` and use index 0).

**Rules (simple, public demo only):**

```json
{
  "rules": {
    "scores": {
      "$date": {
        ".read": true,
        ".write": "auth == null && newData.child('score').val() <= 500000"
      }
    }
  }
}
```

*This is only a demo baseline. For production, add auth and stronger validation.*

## Daily Reset Logic (Client)

* On app load, compare `localStorage.gameDataDate` to today (`YYYY-MM-DD`).
* If different, reset `gameData` (score/answered/correct/usedIndices/combos).
* Keep name/gender/playerId intact.

## Audio & Speech

* **Sound effects** on correct/wrong; toggle icon to mute/unmute (persisted in `localStorage`).
* **Speech Synthesis**:

  * English voice preference: `Google US English`
  * Japanese voice preference: `Google 日本語`
  * Fallback to any available voice if specific ones aren’t found.
  * iOS requires a user gesture before audio APIs can play.

## Dynamic Themes (Optional)

Two ways:

1. **Route/Param-based screens**

   * Default screen (classic)
   * Kids Theme screen at `?theme=kids` (wrapper `KidsThemeScreen` that renders `<Game />` + `<DailyLeaderboard />` with a vibrant UI shell)

2. **Dynamic CSS loader (single screen)**

   * Put theme CSS files in `/public/themes/kids.css` and `/public/themes/pro.css`.
   * In `index.html`, add:

     ```html
     <link id="themeStylesheet" rel="stylesheet" href="/themes/pro.css">
     ```
   * At runtime:

     ```js
     const params = new URLSearchParams(window.location.search);
     const theme = params.get("theme") || localStorage.getItem("theme") || "pro";
     const link = document.getElementById("themeStylesheet");
     if (link) link.href = `/themes/${theme}.css`;
     localStorage.setItem("theme", theme);
     ```
   * This lets you switch full CSS without shipping both to every page (simple and CRA-friendly).

## Accessibility & i18n

* RTL layout supported (Hebrew).
* Large targets, high contrast, focusable controls.
* Speech aids pronunciation drills.

## Troubleshooting

* **Stuck on “Loading words…”**
  Check CSV path and headers; ensure files are in `/public` and accessible at `process.env.PUBLIC_URL`.
* **Speech not heard on mobile**
  iOS/Android often require a user gesture before initiating WebAudio/Speech.
* **Firebase errors**
  Ensure `.env.local` is present locally and *not committed*. In production (GH Pages), you cannot load secrets from Git – use client-only mode or serve a prebuilt config via safe proxy if needed.
* **GitHub Pages 404**
  Ensure `homepage` in `package.json` matches your repo URL; redeploy.

## License

MIT
