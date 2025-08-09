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
  const [correctIndices, setCorrectIndices] = useState(gameData?.correctIndices || []);
  const [wrongIndices, setWrongIndices] = useState(gameData?.wrongIndices || []);
  const [usedIndices, setUsedIndices] = useState(gameData?.usedIndices || []);
  const [direction, setDirection] = useState("engToHeb");
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null
  const [message, setMessage] = useState("");
  const [disableOptions, setDisableOptions] = useState(false);

  const audioCtxRef = useRef(null);

  // Init Audio Context for beep sounds
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Pick next question when status is null (ready for next)
  useEffect(() => {
    if (!words.length) return;

    if (status !== null) return; // מחכה לסיום ההשהיה של התשובה הקודמת

    // בניית רשימת מילים זמינות - כל האינדקסים חוץ מאלו שנענו נכון
    const availableIndices = [];
    for (let i = 0; i < words.length; i++) {
      if (!correctIndices.includes(i)) {
        availableIndices.push(i);
      }
    }

    if (availableIndices.length === 0) {
      // כל המילים נענו נכון - סיום משחק
      onFinish({
        ...gameData,
        correctIndices,
        wrongIndices,
        usedIndices,
      });
      return;
    }

    // בוחר אינדקס רנדומלי מתוך המילים הזמינות (כולל מילים שלא נענו עדיין, ומילים שגויות)
    const nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    setQuestionIndex(nextIndex);
    setUsedIndices(prev => (prev.includes(nextIndex) ? prev : [...prev, nextIndex]));

    // הגדרת כיוון אקראי
    const dir = Math.random() < 0.5 ? "engToHeb" : "hebToEng";
    setDirection(dir);

    // הכנת אפשרויות: 1 נכונה + 2 שגויות (מתוך רשימת כל המילים)
    const correctWord = words[nextIndex];
    const wrongOptions = [];

    while (wrongOptions.length < 2) {
      const randIndex = Math.floor(Math.random() * words.length);
      if (randIndex !== nextIndex && !wrongOptions.includes(words[randIndex])) {
        wrongOptions.push(words[randIndex]);
      }
    }

    let choices = [];
    if (dir === "engToHeb") {
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

    choices = shuffleArray(choices);
    setOptions(choices);
  }, [words, correctIndices, wrongIndices, status, onFinish, gameData, usedIndices]);

  function playSound(correct) {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    if (correct) {
      o.frequency.value = 800;
    } else {
      o.frequency.value = 300;
    }
    o.type = "triangle";
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    o.start();
    o.stop(ctx.currentTime + 0.15);
  }

  function onAnswer(selected) {
    if (disableOptions) return;
    setDisableOptions(true);

    const correctOption = options.find(o => o.correct);
    const isCorrect = selected === correctOption.text;

    let newScore = gameData?.score || 0;
    let newCorrect = gameData?.correct || 0;
    let newAnswered = gameData?.answered || 0;

    newAnswered++;

    let newCorrectIndices = [...correctIndices];
    let newWrongIndices = [...wrongIndices];

    if (isCorrect) {
      newScore++;
      newCorrect++;
      if (!newCorrectIndices.includes(questionIndex)) {
        newCorrectIndices.push(questionIndex);
      }
      // הסר מהרשימה של טעויות אם קיים
      newWrongIndices = newWrongIndices.filter(idx => idx !== questionIndex);

      playSound(true);
      setStatus("correct");
      const phrase = getRandomItem(ENCOURAGEMENTS[player.gender]);
      setMessage(phrase);
    } else {
      // הוסף לרשימת טעויות אם לא קיים כבר
      if (!newWrongIndices.includes(questionIndex)) {
        newWrongIndices.push(questionIndex);
      }

      playSound(false);
      setStatus("wrong");
      const tryAgainMsg = getRandomItem(TRY_AGAIN_MSGS);
      setMessage(tryAgainMsg);
    }

    setCorrectIndices(newCorrectIndices);
    setWrongIndices(newWrongIndices);

    setGameData({
      score: newScore,
      answered: newAnswered,
      correct: newCorrect,
      correctIndices: newCorrectIndices,
      wrongIndices: newWrongIndices,
      usedIndices,
    });

    // השהיה: 700 מ"ש לתשובה נכונה, 3000 מ"ש לשגויה
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
