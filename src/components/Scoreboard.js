// import React from "react";
import React, { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value = 0,
  duration = 350,
  format = (v) => v, // e.g. v => Math.round(v) or v => `${Math.round(v)}%`
}) {
  const [display, setDisplay] = useState(value || 0);

  // Refs to avoid state deps
  const startRef = useRef(null);
  const fromRef = useRef(value || 0);
  const toRef = useRef(value || 0);
  const rafRef = useRef(null);

  // Keep the latest display value available without depending on it
  const displayRef = useRef(display);
  displayRef.current = display;

  useEffect(() => {
    // Start from whatever is currently shown, not from the previous target
    fromRef.current = displayRef.current;
    toRef.current = value || 0;
    startRef.current = null;

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min(1, (ts - startRef.current) / duration);
      const next =
        fromRef.current + (toRef.current - fromRef.current) * progress;

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span>{format(display)}</span>;
}



export default function Scoreboard({ player, words, gameData, onFinishClick, title }) {
  // 

  const {
    score = 0,
    answered = 0,
    correct = 0,
    combo = 1,
  } = gameData;
  console.log(gameData)
  const accuracy = answered > 0 ? (correct / answered) * 100 : 0;

  return (
    <div className="scoreboard-container" dir="rtl" aria-label="Scoreboard">
      <div className="scoreboard-top">
        <span className="game-status-title" title={title}>{title}</span>

        <div className="scoreboard-top-right">
          {combo > 1 && (
            <span className="combo-badge" aria-label={`x ${combo}`}>
              🔥 x <strong>{combo}</strong>
            </span>
          )}
          <button className="finish-btn" onClick={onFinishClick}>
            הפסקה
          </button>
        </div>
      </div>

      <div className="score-cards">
        <div className="stat-card">
          <span className="stat-label">נקודות  </span>
          <span className="stat-value">
            <AnimatedNumber value={Math.round(score)} format={v => Math.round(v)} />
          </span>
        </div>

        {/* <div className="stat-card">
          <div className="stat-label">שאלות</div>
          <div className="stat-value">
            <AnimatedNumber value={answered} format={v => Math.round(v)} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">נכונות</div>
          <div className="stat-value">
            <AnimatedNumber value={correct} format={v => Math.round(v)} />
          </div>
        </div> */}

        {/* <div className="stat-card">
          <span className="stat-label">ציון  </span>
          <span className="stat-value">
            <AnimatedNumber value={accuracy} format={v => `${Math.round(v)}%`} />
          </span>
        </div> */}
        <div className="progress-wrap" aria-label="Accuracy progress">
          <div className="progress-top">
            {/* <span>התקדמות</span> */}
            <span className="progress-meta">
              {answered}/{words.length}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, accuracy))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="progress-wrap" aria-label="Accuracy progress">
        <div className="progress-top">
          <span>התקדמות</span>
          <span className="progress-meta">
            {correct}/{answered} נכונות
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, accuracy))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
