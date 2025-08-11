import { getDatabase, ref, set, get } from "firebase/database";
import { app } from "./firebase";

const db = getDatabase(app);

export async function saveScore(player, scoreData) {
  const now = new Date();
  const localeOffset = now.getTimezoneOffset() * 60000;
  const curDate = new Date(now - localeOffset);
  const today = curDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const playerScoreRef = ref(db, `scores/${today}/${player}`);

  try {
    // שומרים גם timestamp כדי שנוכל לסנן לפי זמן
    await set(playerScoreRef, { ...scoreData, timestamp: now });
    console.log("Score saved successfully");
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

// מחזיר כמה שחקנים שונים שיחקו היום
export async function getDailyPlayerCount() {
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);

  try {
    const snapshot = await get(todayRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      return Object.keys(players).length;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching daily player count:", error);
    return 0;
  }
}

// מחזיר שחקנים עם ניקוד היום, ממוינים לפי ניקוד יורד (top 10)
export async function getTop10DailyScores() {
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);

  try {
    const snapshot = await get(todayRef);
    if (!snapshot.exists()) return [];

    const players = snapshot.val();

    const sorted = Object.entries(players)
      .sort(([, a], [, b]) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);

    return sorted;
  } catch (error) {
    console.error("Error fetching top 10 daily scores:", error);
    return [];
  }
}

// מחזיר שחקנים ששיחקו בשעה האחרונה
export async function getPlayersLastHour() {
  const now = Date.now();
  const oneHourAgo = now - 3600 * 1000;
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);

  try {
    const snapshot = await get(todayRef);
    if (!snapshot.exists()) return [];

    const players = snapshot.val();

    const recentPlayers = Object.entries(players).filter(
      ([, data]) => data.timestamp && data.timestamp >= oneHourAgo
    );

    return recentPlayers;
  } catch (error) {
    console.error("Error fetching players last hour:", error);
    return [];
  }
}
