// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { ref, set, get, query, orderByChild, limitToLast, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };

// ===== Database Abstraction (Firebase implementation) =====

// Save a player's score (generic)
export async function dbSaveScore(player, scoreData) {
  const now = Date.now();
  const today = new Date(now).toISOString().split("T")[0];
  const playerScoreRef = ref(db, `scores/${today}/${player}`);
  await set(playerScoreRef, { ...scoreData, timestamp: now });
}

// Count players for today (generic)
export async function dbGetDailyPlayerCount() {
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);
  const snapshot = await get(todayRef);
  if (!snapshot.exists()) return 0;
  return Object.keys(snapshot.val()).length;
}

// Top-N daily scores (generic)
export async function dbGetTop10DailyScores(limit = 10) {
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);
  const snapshot = await get(todayRef);
  if (!snapshot.exists()) return [];
  const players = snapshot.val();
  const sorted = Object.entries(players)
    .map(([playerId, data]) => ({
      playerId,
      name: data?.name || (playerId.includes("--") ? playerId.split("--")[0] : playerId),
      score: Number(data?.score || 0),
      answered: Number(data?.answered || 0),
      correct: Number(data?.correct || 0),
      maxCombo: Number(data?.maxCombo || 0),
      timestamp: Number(data?.timestamp || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return sorted;
}

// Players in the last hour (generic)
export async function dbGetPlayersLastHour() {
  const now = Date.now();
  const oneHourAgo = now - 3600 * 1000;
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);
  const snapshot = await get(todayRef);
  if (!snapshot.exists()) return [];
  const players = snapshot.val();
  return Object.entries(players)
    .map(([playerId, data]) => ({ playerId, ...data }))
    .filter((p) => p.timestamp && p.timestamp >= oneHourAgo);
}

// Subscribe to live top-N daily scores (generic)
export function dbSubscribeDailyTopScores(today, topN = 10, onRows) {
  const dayRef = ref(db, `scores/${today}`);
  const q = query(dayRef, orderByChild("score"), limitToLast(topN));
  const unsub = onValue(q, (snap) => {
    const val = snap.val() || {};
    const rows = Object.entries(val)
      .map(([playerId, data]) => ({
        playerId,
        name: data?.name || (playerId.includes("--") ? playerId.split("--")[0] : playerId),
        score: Number(data?.score || 0),
        answered: Number(data?.answered || 0),
        correct: Number(data?.correct || 0),
        maxCombo: Number(data?.maxCombo || 0),
        timestamp: Number(data?.timestamp || 0),
      }))
      .sort((a, b) => b.score - a.score);
    onRows(rows);
  });
  return unsub; // call to detach listener
}
