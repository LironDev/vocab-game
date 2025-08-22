// Generic score logger that does not know the underlying DB
import { dbSaveScore, dbGetDailyPlayerCount, dbGetTop10DailyScores, dbGetPlayersLastHour } from "./db/firebase";

export async function saveScore(player, scoreData) {
  try {
    await dbSaveScore(player, scoreData);
    console.log("Score saved successfully");
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

export async function getDailyPlayerCount() {
  try {
    return await dbGetDailyPlayerCount();
  } catch (error) {
    console.error("Error fetching daily player count:", error);
    return 0;
  }
}

export async function getTop10DailyScores() {
  try {
    return await dbGetTop10DailyScores(10);
  } catch (error) {
    console.error("Error fetching top 10 daily scores:", error);
    return [];
  }
}

export async function getPlayersLastHour() {
  try {
    return await dbGetPlayersLastHour();
  } catch (error) {
    console.error("Error fetching players last hour:", error);
    return [];
  }
}
