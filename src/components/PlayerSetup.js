import React from "react";
import { getOrCreatePlayerId } from "../helpers/player";

export default function PlayerSetup({ onSetup, existingId }) {
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (name.trim() && (gender === "boy" || gender === "girl")) {
      onSetup({ id: existingId || getOrCreatePlayerId(), name: name.trim(), gender });
    } else {
      alert("אנא הזן שם ובחר מין");
    }
  }

  return (
    <div className="player-setup fancy" dir="rtl">
      <div className="setup-hero">
        <div className="mascot" aria-hidden>⭐️</div>
        <h2 className="setup-title">ברוכים הבאים למשחק המילים</h2>
        <p className="setup-subtitle">כדי שנתחיל, נשלים כמה פרטים</p>
      </div>

      <form onSubmit={onSubmit} className="setup-form fade-slide-in">
        <div className="input-group">
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הקלידו את שמכם"
            aria-label="שם"
            required
          />
        </div>

        <div className="radio-group gender-group" role="radiogroup" aria-label="מין">
          <div className="gender-cards">
            <input
              type="radio"
              id="gender-boy"
              name="gender"
              value="boy"
              checked={gender === "boy"}
              onChange={() => setGender("boy")}
              hidden
            />
            <label htmlFor="gender-boy" className={`gender-card boy ${gender === "boy" ? "selected" : ""}`}>
              <span className="gender-emoji" aria-hidden>♂️</span>
              <span className="gender-text">בן</span>
              <span className="check" aria-hidden>✓</span>
            </label>

            <input
              type="radio"
              id="gender-girl"
              name="gender"
              value="girl"
              checked={gender === "girl"}
              onChange={() => setGender("girl")}
              hidden
            />
            <label htmlFor="gender-girl" className={`gender-card girl ${gender === "girl" ? "selected" : ""}`}>
              <span className="gender-emoji" aria-hidden>♀️</span>
              <span className="gender-text">בת</span>
              <span className="check" aria-hidden>✓</span>
            </label>
          </div>
        </div>

        <button type="submit" className="start-btn bump">
          <span className="btn-text">התחל לשחק</span>
          <span className="btn-icon" aria-hidden>🚀</span>
        </button>
      </form>
    </div>
  );
}
