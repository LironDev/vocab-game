import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Game from "./components/Game";
import FinishScreen from "./components/FinishScreen";

// שומר/טוען localStorage עבור שם ומין
function loadPlayerData() {
  const name = localStorage.getItem("playerName") || "";
  const gender = localStorage.getItem("playerGender") || "";
  return { name, gender };
}

function savePlayerData(name, gender) {
  localStorage.setItem("playerName", name);
  localStorage.setItem("playerGender", gender);
}

function loadGameData() {
  const json = localStorage.getItem("gameData");
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function saveGameData(data) {
  localStorage.setItem("gameData", JSON.stringify(data));
}

export default function App() {
  const [words, setWords] = useState([]);
  const [player, setPlayer] = useState(loadPlayerData());
  const [gameData, setGameData] = useState(loadGameData());
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  // טען CSV
  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/words.csv`, {
      download: true,
      header: true,
      complete: (results) => {
        const filtered = results.data.filter(
          (row) => row.English && row.Hebrew
        );
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
    return <PlayerSetup onSetup={setPlayer} />;
  }

  // הצג מסך סיום או משחק
  return showFinishScreen ? (
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
  );
}

// קומפוננטת כניסה שם ומין
function PlayerSetup({ onSetup }) {
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (name.trim() && (gender === "boy" || gender === "girl")) {
      onSetup({ name: name.trim(), gender });
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
