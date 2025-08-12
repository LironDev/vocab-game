import React from "react";

export default function Scoreboard({ player, gameData, onFinishClick, title, soundEnabled, onToggleSound }) {
  return (
    <div className="scoreboard-container">
      {title && <h3 className="scoreboard-title">{title}</h3>}

      <div className="scoreboard-top">
        {/* שם מימין */}
        <span className="player-name">{player.name}</span>

        <div className="top-actions">
          {/* כפתור טוגל צליל */}
          {/* <button
            type="button"
            className={`sound-toggle ${soundEnabled ? "on" : "off"}`}
            onClick={onToggleSound}
            aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            title={soundEnabled ? "השתק צלילים" : "הפעל צלילים"}
          >
            {soundEnabled ? "🔊 צליל פעיל" : "🔇 צליל כבוי"}
          </button> */}
          <div className="sound-toggle-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={onToggleSound}
              />
              <span className="slider"></span>
            </label>
            <span className="sound-label">
              {soundEnabled ? "צליל פעיל" : "צליל כבוי"}
            </span>
          </div>


          {/* סיום משחק */}
          <button className="finish-btn" onClick={onFinishClick}>
            הפסקה
          </button>
        </div>
      </div>

      {/* שורה 1 */}
      <div className="scoreboard-stats-row">
        <span>נקודות: {Math.round(gameData.score || 0)}</span>
        <span>רצף: {gameData.combo || 1}</span>
      </div>

      {/* שורה 2 */}
      <div className="scoreboard-stats-row">
        <span>שאלות: {gameData.answered || 0}</span>
        <span>תשובות נכונות: {gameData.correct || 0}</span>
      </div>
    </div>
  );
}
