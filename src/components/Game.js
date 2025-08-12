import React, { useState, useEffect, useRef, useCallback } from "react";
import Question from "./Question";
import Scoreboard from "./Scoreboard";
import confetti from "canvas-confetti";

const params = new URLSearchParams(window.location.search);
const lang = params.get("lang");

const ENCOURAGEMENTS = {
  boy: ["כל הכבוד, אלוף!", "יפה מאוד!", "מעולה!", "אתה תותח!", "המשך כך!"],
  girl: ["כל הכבוד, אלופה!", "יפה מאוד!", "מעולה!", "את תותחית!", "המשיכי כך!"],
};

const TRY_AGAIN_MSGS = [
  "לא נורא, כדאי ללמוד את המילה שוב",
  "כמעט הצלחת!",
  "ננסה שוב בפעם הבאה",
  "אנחנו בדרך הנכונה!",
];

function shuffleArray(arr) {
  let array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function celebrate() {
  confetti({
    particleCount: 200,
    spread: 90,
    origin: { y: 0.6 }
  });
}

function checkScoreMilestone(prevScore, newScore) {
  const prevMilestone = Math.floor(prevScore / 20000);
  const newMilestone = Math.floor(newScore / 20000);
  if (newMilestone > prevMilestone) {
    celebrate();
  }
}

export default function Game({ words, player, gameData, setGameData, onFinish }) {
  const [questionIndex, setQuestionIndex] = useState(null);
  const [direction, setDirection] = useState("engToHeb");
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null
  const [message, setMessage] = useState("");
  const [disableOptions, setDisableOptions] = useState(false);

  // NEW: sound toggle (persisted)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // אם אין ערך שמור—ברירת מחדל פעיל
    const v = localStorage.getItem("soundEnabled");
    return v === null ? true : v !== "false";
  });

  const audioCtxRef = useRef(null);

  // Init Audio Context for beep sounds
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Persist sound flag
  useEffect(() => {
    localStorage.setItem("soundEnabled", String(soundEnabled));
  }, [soundEnabled]);

  // pickNextQuestion עם useCallback ותלות מתאימה
  const pickNextQuestion = useCallback(() => {
    if (!words.length) return;

    const usedIndices = gameData.usedIndices || [];
    const allIndices = words.map((_, i) => i);

    // מילים שטרם נענו נכון
    const remainingIndices = allIndices.filter((i) => !usedIndices.includes(i));

    if (remainingIndices.length === 0) {
      // סיימנו את כל המילים - מסיימים את המשחק
      onFinish(gameData);
      return;
    }

    const nextIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
    setQuestionIndex(nextIndex);

    const dir = Math.random() < 0.5 ? "engToHeb" : "hebToEng";
    setDirection(dir);

    const correctWord = words[nextIndex];
    const wrongOptions = [];

    while (wrongOptions.length < 2) {
      const randIndex = Math.floor(Math.random() * words.length);
      if (randIndex !== nextIndex && !wrongOptions.includes(words[randIndex])) {
        wrongOptions.push(words[randIndex]);
      }
    }

    const sourceField = lang === "jp" ? "Japanese" : "English";
    let choices = [];
    if (dir === "engToHeb") {
      choices = [
        { text: correctWord.Hebrew, correct: true },
        { text: wrongOptions[0].Hebrew, correct: false },
        { text: wrongOptions[1].Hebrew, correct: false },
      ];
    } else {
      choices = [
        { text: correctWord[sourceField], correct: true },
        { text: wrongOptions[0][sourceField], correct: false },
        { text: wrongOptions[1][sourceField], correct: false },
      ];
    }

    setOptions(shuffleArray(choices));
    setStatus(null);
    setMessage("");
    setDisableOptions(false);
  }, [words, gameData, onFinish]);

  // useEffect שמאזין ל-status ול-words ומפעיל pickNextQuestion
  useEffect(() => {
    if (status === null) {
      pickNextQuestion();
    }
  }, [status, words, pickNextQuestion]);

  function playSound(correct) {
    // Respect mute toggle
    if (!soundEnabled) return;
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    if (correct) {
      o.type = "sine";
      o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.4);
    } else {
      o.type = "sawtooth";
      o.frequency.setValueAtTime(400, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.2);
    }
  }

  function onAnswer(selectedText) {
    if (disableOptions) return;
    setDisableOptions(true);

    const correctOption = options.find((o) => o.correct);
    const isCorrect = selectedText === correctOption.text;

    if (isCorrect) {
      playSound(true);

      const newCombo = (gameData.combo || 0) + 1;
      const pointsEarned = 100 * newCombo * 0.8 + newCombo;
      const prevScore = gameData.score || 0;
      const newScore = prevScore + pointsEarned;

      checkScoreMilestone(prevScore, newScore);

      setGameData({
        ...gameData,
        score: newScore,
        answered: (gameData.answered || 0) + 1,
        correct: (gameData.correct || 0) + 1,
        combo: newCombo,
        maxCombo: Math.max(gameData.maxCombo || 0, newCombo),
        usedIndices: [...(gameData.usedIndices || []), questionIndex],
      });

      setStatus("correct");
      setMessage(getRandomItem(ENCOURAGEMENTS[player.gender]));
    } else {
      playSound(false);

      setGameData({
        ...gameData,
        answered: (gameData.answered || 0) + 1,
        combo: 0,
      });

      setStatus("wrong");
      setMessage(getRandomItem(TRY_AGAIN_MSGS));
    }

    const delay = isCorrect ? 700 : 3000;
    setTimeout(() => {
      setStatus(null);
      setMessage("");
      setDisableOptions(false);
    }, delay);
  }

  function onSpeak() {
    if (direction !== "engToHeb") return;
    if (!window.speechSynthesis) return;

    const sourceField = lang === "jp" ? "Japanese" : "English";
    const utterance = new SpeechSynthesisUtterance(words[questionIndex][sourceField]);
    utterance.lang = lang === "jp" ? "ja-JP" : "en-US";
    window.speechSynthesis.speak(utterance);
  }

  if (!words.length || questionIndex === null) {
    return (
      <div className="loading-message">
        טוען מילים... <br />
        אנא המתן
      </div>
    );
  }

  return (
    <div className="game-container">
      <Scoreboard
        player={player}
        gameData={gameData}
        onFinishClick={() => onFinish(gameData)}
        title="סטטוס המשחק"
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
      />
      <Question
        word={words[questionIndex]}
        direction={direction}
        options={options}
        onAnswer={onAnswer}
        status={status}
        message={message}
        onSpeak={onSpeak}
        disableOptions={disableOptions}
      />
    </div>
  );
}
