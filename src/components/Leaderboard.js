import React, { useEffect, useState } from "react";
import { getTop10DailyScores } from "../scoreLogger"; // תעדכן את הנתיב אם צריך

export default function Leaderboard() {
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    getTop10DailyScores().then(setTopPlayers);
  }, []);

  return (
    <div>
      <h2>טבלת מובילים יומית - Top 10</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", verticalAlign: "middle" }}>מיקום</th>
            <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", verticalAlign: "middle" }}>שחקן</th>
            <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", verticalAlign: "middle" }}>ניקוד</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map(([playerId, data], index) => (
            <tr key={playerId}>
              <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", verticalAlign: "middle" }}>{index + 1}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", verticalAlign: "middle" }}>{playerId}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center", verticalAlign: "middle" }}>{data.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
