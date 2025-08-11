// scoreLogger.js
import { getDatabase, ref, set, get } from "firebase/database";
import { app } from "./firebase";

const db = getDatabase(app);

// שומר ניקוד של שחקן ספציפי בתאריך הנוכחי (לפי playerId)
export async function saveScore(playerId, scoreData) {
  const today = new Date().toISOString().split("T")[0]; // למשל "2025-08-11"
  const playerScoreRef = ref(db, `scores/${today}/${playerId}`);

  try {
    // set - כי שומר ניקוד יחיד לכל שחקן ליום מסוים
    await set(playerScoreRef, scoreData);
    console.log("Score saved successfully");
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

// מחזיר כמה שחקנים שונים שיחקו היום (מספר מפתחות תחת scores/תאריך)
export async function getDailyPlayerCount() {
  const today = new Date().toISOString().split("T")[0];
  const todayRef = ref(db, `scores/${today}`);

  try {
    const snapshot = await get(todayRef);
    if (snapshot.exists()) {
      const players = snapshot.val();
      return Object.keys(players).length; // מספר שחקנים שונים
    }
    return 0;
  } catch (error) {
    console.error("Error fetching daily player count:", error);
    return 0;
  }
}
