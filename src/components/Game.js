import React, { useEffect, useState, useRef } from "react";
import Question from "./Question";
import Scoreboard from "./Scoreboard";

const ENCOURAGEMENTS = {
  boy: [
    "כל הכבוד, אלוף!",
    "יפה מאוד!",
    "מעולה!",
    "אתה תותח!",
    "המשך כך!",
  ],
  girl: [
    "כל הכבוד, אלופה!",
    "יפה מאוד!",
    "מעולה!",
    "את תותחית!",
    "המשיכי כך!",
  ],
};

const TRY_AGAIN_MSGS = [
  "לא נורא, תלמד את המילה שוב",
  "כמעט הצלחת!",
  "נסה שוב בפעם הבאה",
  "את בדרך הנכונה!",
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

function Game({ words, player, gameData, setGameData, onFinish }) {
  const [questionIndex, setQuestionIndex] = useState(null);
  const [usedIndices, setUsedIndices] = useState(
    Array.isArray(gameData?.usedIndices) ? gameData.usedIndices : []
  );
  const [direction, setDirection] = useState("engToHeb");
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null
  const [message, setMessage] = useState("");
  const [disableOptions, setDisableOptions] = useState(false);

  const audioCtxRef = useRef(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // בוחר שאלה חדשה רק אם סטטוס הוא null (כלומר: מחכים לתשובה)
  useEffect(() => {
    if (!words.length) return;

    // אם סיימנו את כל המילים - מסיימים את המשחק
    if (usedIndices.length === words.length) {
      onFinish({
        ...gameData,
        usedIndices,
      });
      return;
    }

    // אם יש שאלה פתוחה (סטטוס !== null) מחכים לתשובה, אל תבחר שאלה חדשה
    if (status !== null) return;

    // בחר שאלה חדשה שלא הייתה בשימוש
    const unusedIndices = [];
    for (let i = 0; i < words.length; i++) {
      if (!usedIndices.includes(i)) unusedIndices.push(i);
    }
    if (unusedIndices.length === 0) return;

    const nextIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)];

    setQuestionIndex(nextIndex);

    // הגדר כיוון אקראי
    setDirection(Math.random() < 0.5 ? "engToHeb" : "hebToEng");

    // הכנת אפשרויות תשובה
    const correctWord = words[nextIndex];
    const wrongOptions = [];

    while (wrongOptions.length < 2) {
      const randIndex = Math.floor(Math.random() * words.length);
      const candidate = words[randIndex];
      if (randIndex !== nextIndex && !wrongOptions.includes(candidate)) {
        wrongOptions.push(candidate);
      }
    }

    let choices = [];
    if (direction === "engToHeb") {
      choices = [
        { text: correctWord.Hebrew, correct: true },
        { text: wrongOptions[0].Hebrew, correct: false },
        { text: wrongOptions[1].Hebrew, correct: false },
      ];
    } else {
      choices = [
        { text: correctWord.English, correct: true },
        { text: wrongOptions[0].English, correct: false },
        { text: wrongOptions[1].English, correct: false },
      ];
    }

    setOptions(shuffleArray(choices));
  }, [words, usedIndices, status, onFinish, gameData, direction]);

  function playSound(correct) {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    o.frequency.value = correct ? 800 : 300;
    o.type = "triangle";
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    o.start();
    o.stop(ctx.currentTime + 0.15);
  }

  function onAnswer(selected) {
    if (disableOptions) return;
    setDisableOptions(true);

    const correctOption = options.find((o) => o.correct);
    const isCorrect = selected === correctOption.text;

    let newScore = gameData?.score || 0;
    let newCorrect = gameData?.correct || 0;
    let newAnswered = gameData?.answered || 0;

    newAnswered++;

    if (isCorrect) {
      newScore++;
      newCorrect++;
      playSound(true);
      setStatus("correct");
      const phrase = getRandomItem(ENCOURAGEMENTS[player.gender]);
      setMessage(phrase);
    } else {
      playSound(false);
      setStatus("wrong");
      const tryAgainMsg = getRandomItem(TRY_AGAIN_MSGS);
      setMessage(tryAgainMsg);
    }

    // עדכון סטטיסטיקות ומילוי usedIndices אחרי שהתשובה ניתנה
    setGameData({
      score: newScore,
      answered: newAnswered,
      correct: newCorrect,
      usedIndices,
    });

    // אחרי דיליי של 2-3 שניות נוסיף את השאלה לרשימת השאלות שנענו ונעבור לשאלה הבאה
    const delay = isCorrect ? 700 : 3000;
    setTimeout(() => {
      setUsedIndices((prev) => [...prev, questionIndex]);
      setStatus(null);
      setMessage("");
      setDisableOptions(false);
    }, delay);
  }

  function onSpeak() {
    if (direction !== "engToHeb") return;
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(words[questionIndex].English);
    utterance.lang = "en-US";
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
        score={gameData?.score || 0}
        answered={gameData?.answered || 0}
        correct={gameData?.correct || 0}
        onFinish={() => onFinish(gameData)}
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

export default Game;
