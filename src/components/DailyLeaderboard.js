import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";

function nameOnlyFromId(fullId) {
  if (!fullId) return "";
  const idx = fullId.indexOf("--");
  return idx >= 0 ? fullId.slice(0, idx) : fullId;
}

export default function DailyLeaderboard() {
  const [rows, setRows] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const dayRef = ref(db, `scores/${today}`);
    // נשתמש ב-orderByChild + limitToLast כדי לקבל את הגבוהים, ואז נמיין בירידה בצד הלקוח
    const q = query(dayRef, orderByChild("score"), limitToLast(10));
    const unsub = onValue(q, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([playerId, data]) => ({
        playerId,
        name: data?.name || nameOnlyFromId(playerId),
        score: Number(data?.score || 0),
        answered: Number(data?.answered || 0),
        correct: Number(data?.correct || 0),
        maxCombo: Number(data?.maxCombo || 0),
        timestamp: Number(data?.timestamp || 0),
      }));
      // מיון בירידה לפי ניקוד
      arr.sort((a, b) => b.score - a.score);
      setRows(arr);
    });

    return () => unsub();
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
                  <td>{Math.round(r.correct/r.answered*100) + '%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
