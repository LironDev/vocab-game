import React from "react";

export default function Scoreboard({ player, score, answered, correct, onFinish }) {
  return (
    <div>
        <div className="scoreboard">
        <div className="player-name">
            <span role="img" aria-label="trophy">
            🏆
            </span>{" "}
            {player.name}
        </div>
        </div>
        <div className="scoreboard">
        <div className="score-details">
            <div>נקודות: {score}</div>
            <div>שאלות: {answered}</div>
            <div>תשובות נכונות: {correct}</div>
        </div>
        <button className="finish-btn" onClick={() => onFinish()}>
            סיימתי
        </button>
        </div>
    </div>
  );
}
