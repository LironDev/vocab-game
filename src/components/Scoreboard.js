import React from "react";

export default function Scoreboard({ player, score, answered, correct, onFinish }) {
  return (
    <div className="scoreboard-container">
      <div className="top-bar">
        <div className="player-name">שלום, {player.name}</div>
        <button className="finish-btn" onClick={onFinish}>סיימתי</button>
      </div>
      <div className="score-stats">
        <div>נקודות: {score}</div>
        <div>שאלות: {answered}</div>
        <div>תשובות נכונות: {correct}</div>
      </div>
    </div>
  );
}
