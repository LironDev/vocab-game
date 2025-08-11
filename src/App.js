import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Game from "./components/Game";
import FinishScreen from "./components/FinishScreen";
import Leaderboard from "./components/Leaderboard";

function getOrCreatePlayerId() {
  let id = localStorage.getItem("playerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("playerId", id);
  }
  return id;
}

// שומר/טוען localStorage עבור שם ומין
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

  if (savedDate !== today || !json) {
    return {}; // איפוס אם אין נתונים או שהתאריך שונה
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
  
  useEffect(() => {
    // בודק אם יש פרמטר lang ב-URL
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");

    // בחירת שם הקובץ לפי הפרמטר
    const fileName = lang === "jp" ? "words-jp.csv" : "words.csv";

    Papa.parse(`${process.env.PUBLIC_URL}/${fileName}`, {
      download: true,
      header: true,
      complete: (results) => {
        // סינון לפי השדות המתאימים
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

  // שמור gameData בלוקאלסטורג אוטומטית
  useEffect(() => {
    saveGameData(gameData);
  }, [gameData]);

  // שמור player בלוקאלסטורג
  useEffect(() => {
    if (player.name && player.gender) {
      savePlayerData(player.name, player.gender);
    }
  }, [player]);

  // התחלת משחק מחדש
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

  // כשמגיעים למסך סיום
  function onFinish(data) {
    setGameData(data);
    setShowFinishScreen(true);
  }

  // אם שם ומין לא הוזנו - בקש מהם
  if (!player.name || !player.gender) {
    setPlayer.id = player.id;
    return <PlayerSetup onSetup={setPlayer} />;
  }

  // הצג מסך סיום או משחק
  return (
    <>
      {showFinishScreen ? (
        <FinishScreen
          player={player}
          gameData={gameData}
          onRestart={restartGame}
          onBack={() => setShowFinishScreen(false)}
        />
      ) : (
        <Game
          words={words}
          player={player}
          gameData={gameData}
          setGameData={setGameData}
          onFinish={onFinish}
        />
      )}
      <Leaderboard />

      {/* זכויות יוצרים בתחתית */}
      <footer style={{
        fontSize: "0.8rem",
        color: "#666",
        textAlign: "center",
        padding: "8px 0",
        marginTop: "20px",
        userSelect: "none",
      }}>
        Created by Liron Avrahami
      </footer>
    </>
  );
}

// קומפוננטת כניסה שם ומין
function PlayerSetup({ onSetup }) {
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [id] = React.useState(onSetup.id);

  function onSubmit(e) {
    e.preventDefault();
    if (name.trim() && (gender === "boy" || gender === "girl")) {
      onSetup({ id, name: name.trim(), gender });
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
