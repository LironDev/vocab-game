import React, { useEffect, useState } from "react";
import { dbSubscribeDailyTopScores } from "../db/firebase";

// function nameOnlyFromId(fullId) {
//   if (!fullId) return "";
//   const idx = fullId.indexOf("--");
//   return idx >= 0 ? fullId.slice(0, idx) : fullId;
// }

export default function DailyLeaderboard() {
  const [rows, setRows] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsub = dbSubscribeDailyTopScores(today, 10, (arr) => {
      setRows(arr);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [today]);

  return (
    <div className="card leaderboard-card">
      <h3 className="leaderboard-title">טבלת מובילים יומית - {today}</h3>

      {rows.length === 0 ? (
        <div className="leaderboard-empty">אין נתונים להיום עדיין 🙂</div>
      ) : (
        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table" dir="rtl">
            <thead>
              <tr>
                <th>מקום</th>
                <th>שחקן/ית</th>
                <th>ניקוד</th>
                <th>ציון</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.playerId}>
                  <td>{i + 1}</td>
                  <td title={r.playerId}>{r.name}</td>
                  <td>{Math.round(r.score)}</td>
                  <td>{(Math.round(r.correct/r.answered*100) | 0) + '%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
