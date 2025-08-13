// src/App.js
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Game from "./components/Game";
import FinishScreen from "./components/FinishScreen";
import DailyLeaderboard from "./components/DailyLeaderboard";

// מזהה ייחודי לשחקן (נשמר בלוקאלסטורג פעם אחת)
function getOrCreatePlayerId() {
  let id = localStorage.getItem("playerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("playerId", id);
  }
  return id;
}

// טעינת פרטי שחקן (שם/מין + id קיים/חדש)
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

// טעינת נתוני משחק עם איפוס יומי
function loadGameData() {
  const json = localStorage.getItem("gameData");
  const savedDate = localStorage.getItem("gameDataDate");
  const today = new Date().toISOString().split("T")[0];
  if (savedDate !== today || !json) {
    return {};
  }
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function saveGameData(data) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("gameData", JSON.stringify(data));
  localStorage.setItem("gameDataDate", today);
}

export default function App() {
  const [words, setWords] = useState([]);
  const [player, setPlayer] = useState(loadPlayerData());
  const [gameData, setGameData] = useState(() => {
    const loaded = loadGameData();
    return {
      score: 0,
      answered: 0,
      correct: 0,
      usedIndices: [],
      correctIndices: [],
      wrongIndices: [],
      ...loaded,
    };
  });
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  // טען CSV בהתאם לפרמטר lang (?lang=jp => words-jp.csv)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    const fileName = lang === "jp" ? "words-jp.csv" : "words-en.csv";

    Papa.parse(`${process.env.PUBLIC_URL}/${fileName}`, {
      download: true,
      header: true,
      complete: (results) => {
        const filtered = results.data.filter((row) => {
          if (lang === "jp") {
            return row.Japanese && row.Hebrew;
          }
          return row.English && row.Hebrew;
        });
        setWords(filtered);
      },
      error: (err) => {
        console.error("Failed to load CSV", err);
      },
    });
  }, []);

  // שמירת gameData אוטומטית
  useEffect(() => {
    saveGameData(gameData);
  }, [gameData]);

  // שמירת פרטי שחקן
  useEffect(() => {
    if (player.name && player.gender) {
      savePlayerData(player.name, player.gender);
    }
  }, [player]);

  // התחלה מחדש
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

  // הגעה למסך סיום
  function onFinish(data) {
    setGameData(data);
    setShowFinishScreen(true);
  }

  // אם שם/מין לא הוזנו — טופס פתיחה
  if (!player.name || !player.gender) {
    // מעבירים את ה-id הקיים כדי לשמר אותו
    return <PlayerSetup existingId={player.id} onSetup={setPlayer} />;
  }

  // מסך משחק + כרטיס טבלת מובילים יומי מתחתיו (או תחת מסך הסיום)
  return (
    <>
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

      {/* זכויות יוצרים בתחתית */}
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

// טופס שם/מין בתחילת המשחק
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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <div>
          מין:
          <label>
            <input
              type="radio"
              name="gender"
              value="boy"
              checked={gender === "boy"}
              onChange={() => setGender("boy")}
            />
            בן
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="girl"
              checked={gender === "girl"}
              onChange={() => setGender("girl")}
            />
            בת
          </label>
        </div>
        <button type="submit" className="start-btn">
          התחל לשחק
        </button>
      </form>
    </div>
  );
}
