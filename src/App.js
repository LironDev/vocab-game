// src/App.js
import React, { useEffect, useState } from "react";
import Game from "./components/Game";
import FinishScreen from "./components/FinishScreen";
import DailyLeaderboard from "./components/DailyLeaderboard";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { loadWords } from "./utils/loadWordsBundled";

// ===== Utilities (unchanged) =====
function getOrCreatePlayerId() {
  let id = localStorage.getItem("playerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("playerId", id);
  }
  return id;
}
function loadPlayerData() {
  const name = localStorage.getItem("playerName") || "";
  const gender = localStorage.getItem("playerGender") || "";
  const id = getOrCreatePlayerId();
  return { id, name, gender };
}
function savePlayerData(name, gender) {
  localStorage.setItem("playerName", name);
  localStorage.setItem("playerGender", gender);
}
function loadGameData() {
  const json = localStorage.getItem("gameData");
  const savedDate = localStorage.getItem("gameDataDate");
  const today = new Date().toISOString().split("T")[0];
  if (savedDate !== today || !json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}
function saveGameData(data) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("gameData", JSON.stringify(data));
  localStorage.setItem("gameDataDate", today);
}

// ===== AppInner =====
function AppInner() {
  const { lang, setLang, config, available } = useLanguage();

  const [words, setWords] = useState([]);
  const [player, setPlayer] = useState(loadPlayerData());
  const [gameData, setGameData] = useState(() => ({
    score: 0,
    answered: 0,
    correct: 0,
    usedIndices: [],
    correctIndices: [],
    wrongIndices: [],
    ...loadGameData(),
  }));
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  // restore saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== lang) setLang(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist language
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  // load words JSON via loadWords()
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadWords(lang);
        // generic filter using context config
        const filtered = (data || []).filter((row) => row[config.sourceField] && row.Hebrew);
        if (!cancelled) setWords(filtered);
      } catch (err) {
        console.error("Failed to load words:", err);
        if (!cancelled) setWords([]);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, config.sourceField]);

  // autosave game data
  useEffect(() => { saveGameData(gameData); }, [gameData]);

  // save player details
  useEffect(() => {
    if (player.name && player.gender) savePlayerData(player.name, player.gender);
  }, [player]);

  function restartGame() {
    setGameData({
      score: 0,
      answered: 0,
      correct: 0,
      usedIndices: [],
      correctIndices: [],
      wrongIndices: [],
    });
    setShowFinishScreen(false);
  }

  function onFinish(data) {
    setGameData(data);
    setShowFinishScreen(true);
  }

  if (!player.name || !player.gender) {
    return <PlayerSetup existingId={player.id} onSetup={setPlayer} />;
  }

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",   // slimmer
    borderBottom: "1px solid #ddd", // minimal strip line
  };

  return (
    <>
      <div className="topbar" style={headerStyle} dir="rtl">
        <div style={{ fontWeight: 700 }}>לימוד מילים</div>
        <select
          aria-label="בחר שפה"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{ fontSize: "1.2rem", border: "none", background: "transparent" }}
        >
          {available.map((a) => (
            <option key={a.code} value={a.code} style={{ fontSize: "1.2rem", textAlign: "center" }}>
              {a.flag} {/* flag only */}
            </option>
          ))}
        </select>
      </div>

      {showFinishScreen ? (
        <>
          <FinishScreen
            player={player}
            gameData={gameData}
            onRestart={restartGame}
            onBack={() => setShowFinishScreen(false)}
          />
          <DailyLeaderboard />
        </>
      ) : (
        <>
          <Game
            words={words}
            player={player}
            gameData={gameData}
            setGameData={setGameData}
            onFinish={onFinish}
          />
          <DailyLeaderboard />
        </>
      )}

      <footer
        style={{
          fontSize: "0.8rem",
          color: "#666",
          textAlign: "center",
          padding: "8px 0",
          marginTop: "20px",
          userSelect: "none",
        }}
      >
        Created by Liron Avrahami
      </footer>
    </>
  );
}

// ===== Player setup (unchanged) =====
function PlayerSetup({ onSetup, existingId }) {
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
    <div className="player-setup">
      <h2>ברוכים הבאים למשחק מילים!</h2>
      <form onSubmit={onSubmit}>
        <label>
          שם:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div>
          מין:
          <label>
            <input type="radio" name="gender" value="boy" checked={gender === "boy"} onChange={() => setGender("boy")} />
            בן
          </label>
          <label>
            <input type="radio" name="gender" value="girl" checked={gender === "girl"} onChange={() => setGender("girl")} />
            בת
          </label>
        </div>
        <button type="submit" className="start-btn">התחל לשחק</button>
      </form>
    </div>
  );
}

// ===== Root =====
export default function App() {
  const initialLang = localStorage.getItem("lang") || "en";
  return (
    <LanguageProvider initial={initialLang}>
      <AppInner />
    </LanguageProvider>
  );
}
