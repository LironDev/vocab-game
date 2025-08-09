import React from "react";

export default function FinishScreen({ player, gameData, onRestart, onBack }) {
  return (
    <div className="finish-screen">
      <h2>תודה ששיחקת, {player.name}!</h2>
      <p>נקודות סופיות: {gameData.score || 0}</p>
      <p>שאלות שנענו: {gameData.answered || 0}</p>
      <p>תשובות נכונות: {gameData.correct || 0}</p>

      <div className="finish-buttons">
        <button onClick={onRestart} className="restart-btn">
          התחל מחדש
        </button>
        <button onClick={onBack} className="back-btn">
          חזור למשחק
        </button>
      </div>
    </div>
  );
}
