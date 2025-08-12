import React from "react";

export default function Scoreboard({ player, gameData, onFinishClick, title }) {
  return (
    <div className="scoreboard-container">
      <div className="scoreboard-top">
        <span className="game-status-title">{title}</span>
        <button className="finish-btn" onClick={onFinishClick}>
            הפסקה
        </button>
      </div>

      <div className="scoreboard-stats-row">
        <span>נקודות: {Math.round(gameData.score || 0)}</span>
        <span>רצף: {gameData.combo || 1}</span>
      </div>

      <div className="scoreboard-stats-row">
        <span>שאלות: {gameData.answered || 0}</span>
        <span>תשובות נכונות: {gameData.correct || 0}</span>
      </div>
    </div>
  );
}
