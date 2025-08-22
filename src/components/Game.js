import React, { useState, useEffect, useRef, useCallback } from "react";
import Question from "./Question";
import Scoreboard from "./Scoreboard";
import { speak, supportsSpeech } from "../utils/speech";
import { PiSpeakerSimpleHigh, PiSpeakerSimpleSlash } from "react-icons/pi";
import { useLanguage } from "../context/LanguageContext";

const ADAPTIVE_LEARNING_THRESHOLD =
  Number(process.env.REACT_APP_ADAPTIVE_LEARNING_THRESHOLD) || 10;

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

// ====== כרטיס אדפטיבי (כמו אצלך, רק בלי בדיקת lang; מקבל sourceField מה-Game) ======
function AdaptiveLearningCard({
  word,
  clickCount,
  translationVisible,
  speakerDisabled,
  onWordClick,
  onSkip,
  remainingWords,
  sourceField, // <-- עבר מה-Game
}) {
  if (!word) return null;
  const sourceText = word[sourceField];
  const translationText = word.Hebrew;

  return (
    <div className="adaptive-learning-card">
      <div className="adaptive-header">
        <h3>🎯 בונוס מילים קשות</h3>
        <span className="remaining-words">נותרו: {remainingWords} מילים</span>
      </div>

      <div className="word-display">
        <div className="source-word">{sourceText}</div>

        <div className="speaker-section">
          <button
            className={`speaker-button ${speakerDisabled ? "disabled" : ""}`}
            onClick={onWordClick}
            disabled={speakerDisabled}
          >
            🔊
          </button>
          <div className="instruction">לחץ על הרמקול וקבל 1000 נקודות מתנה!</div>
        </div>

        {translationVisible && (
          <div
            className={`translation ${
              clickCount === 1 ? "color1" : clickCount === 2 ? "color2" : "color3"
            }`}
          >
            {translationText}
          </div>
        )}

        <div className="click-counter">לחיצות: {clickCount}/3</div>
      </div>

      <div className="adaptive-actions">
        <button className="skip-button" onClick={onSkip}>
          דלג על בונוס
        </button>
      </div>
    </div>
  );
}

export default function Game({ words, player, gameData, setGameData, onFinish }) {
  const { config } = useLanguage(); // { sourceField: "English"|"Japanese", ttsLocale: "en-US"|"ja-JP" }

  const [questionIndex, setQuestionIndex] = useState(null);
  const [direction, setDirection] = useState("engToHeb");
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong" | null
  const [message, setMessage] = useState("");
  const [disableOptions, setDisableOptions] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const v = localStorage.getItem("soundEnabled");
    return v === null ? true : v !== "false";
  });

  // ==== מצב "לא יודע" ====
  const [dontKnowActive, setDontKnowActive] = useState(false);
  const [dontKnowInfo, setDontKnowInfo] = useState(null); // { sourceText, translationText }
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [correctText, setCorrectText] = useState("");

  // ==== מצבי למידה אדפטיבית (קיים) ====
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [difficultWords, setDifficultWords] = useState([]);
  const [currentDifficultWord, setCurrentDifficultWord] = useState(null);
  const [wordClickCount, setWordClickCount] = useState(0);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [speakerDisabled, setSpeakerDisabled] = useState(false);
  const [adaptiveModeActivated, setAdaptiveModeActivated] = useState(false);

  const audioCtxRef = useRef(null);
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);
  useEffect(() => {
    localStorage.setItem("soundEnabled", String(soundEnabled));
  }, [soundEnabled]);
  useEffect(() => {
    localStorage.setItem("adaptiveModeActivated", String(adaptiveModeActivated));
  }, [adaptiveModeActivated]);

  const pickNextQuestion = useCallback(() => {
    if (!words.length) return;

    const usedIndices = gameData.usedIndices || [];
    const allIndices = words.map((_, i) => i);
    const remainingIndices = allIndices.filter((i) => !usedIndices.includes(i));

    if (remainingIndices.length === 0) {
      onFinish(gameData);
      return;
    }

    const nextIndex =
      remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
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

    const sourceField = config.sourceField;
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

    // נקה מצב "לא יודע" בעת כניסה לשאלה חדשה
    setDontKnowActive(false);
    setDontKnowInfo(null);
    setRevealCorrect(false);
    setCorrectText("");
  }, [words, gameData, onFinish, config.sourceField]);

  useEffect(() => {
    if (status === null && !dontKnowActive && !adaptiveMode) {
      pickNextQuestion();
    }
  }, [status, words, pickNextQuestion, dontKnowActive, adaptiveMode]);

  function playSound(correct) {
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
    if (disableOptions || dontKnowActive) return;

    setDisableOptions(true);

    const correctOption = options.find((o) => o.correct);
    const isCorrect = selectedText === correctOption.text;

    // סטטיסטיקות מילה — לא קשור ל"לא יודע"
    const currentWord = words[questionIndex];
    const wordKey = `${currentWord.English}-${currentWord.Hebrew}`;
    const wordStats = JSON.parse(localStorage.getItem("wordStats") || "{}");
    if (!wordStats[wordKey]) {
      wordStats[wordKey] = { correct: 0, wrong: 0, word: currentWord };
    }

    if (isCorrect) {
      wordStats[wordKey].correct++;
      playSound(true);

      const newCombo = (gameData.combo || 0) + 1;
      const pointsEarned = 100 * newCombo * 0.8 + newCombo;
      const prevScore = gameData.score || 0;
      const newScore = prevScore + pointsEarned;

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
      wordStats[wordKey].wrong++;
      playSound(false);

      setGameData({
        ...gameData,
        answered: (gameData.answered || 0) + 1,
        combo: 0,
      });

      setStatus("wrong");
      setMessage(getRandomItem(TRY_AGAIN_MSGS));
    }

    localStorage.setItem("wordStats", JSON.stringify(wordStats));

    const totalAnswered = (gameData.answered || 0) + 1;
    if (
      totalAnswered % ADAPTIVE_LEARNING_THRESHOLD === 0 &&
      !adaptiveMode &&
      !adaptiveModeActivated
    ) {
      setAdaptiveModeActivated(true);
      startAdaptiveLearning(wordStats);
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
    if (!supportsSpeech()) return;

    const text =
      (words[questionIndex] && words[questionIndex][config.sourceField]) || "";
    speak(text, {
      lang: config.ttsLocale,
      rate: 0.8,
      pitch: 1,
      volume: 1,
      queue: false,
    });
  }

  // ==== אדפטיבי (קיים, לא בשימוש ב"לא יודע") ====
  function startAdaptiveLearning(wordStats) {
    const difficultWordsList = Object.values(wordStats)
      .filter((stat) => stat.wrong > stat.correct)
      .map((stat) => stat.word);

    if (difficultWordsList.length > 0) {
      setDifficultWords(difficultWordsList);
      setAdaptiveMode(true);
      setCurrentDifficultWord(difficultWordsList[0]);
      setWordClickCount(0);
      setTranslationVisible(false);
      setSpeakerDisabled(false);
    } else {
      setAdaptiveModeActivated(false);
    }
  }

  function onAdaptiveWordClick() {
    if (speakerDisabled) return;
    const newClickCount = wordClickCount + 1;
    setWordClickCount(newClickCount);
    setTranslationVisible(true);
    setSpeakerDisabled(true);

    const bonusPoints = 1000;
    setGameData((prev) => ({
      ...prev,
      score: (prev.score || 0) + bonusPoints,
    }));

    const text = currentDifficultWord[config.sourceField];
    speak(text, {
      lang: config.ttsLocale,
      rate: 0.8,
      pitch: 1,
      volume: 1,
      queue: false,
    });

    setTimeout(() => {
      setSpeakerDisabled(false);
    }, 3000);

    if (newClickCount >= 3) {
      setTimeout(() => {
        moveToNextDifficultWord();
      }, 1000);
    }
  }

  function moveToNextDifficultWord() {
    const currentIndex = difficultWords.findIndex(
      (word) => word.English === currentDifficultWord.English
    );
    const updatedDifficultWords = difficultWords.filter(
      (_, index) => index !== currentIndex
    );
    setDifficultWords(updatedDifficultWords);

    const wordKey = `${currentDifficultWord.English}-${currentDifficultWord.Hebrew}`;
    const wordStats = JSON.parse(localStorage.getItem("wordStats") || "{}");
    if (wordStats[wordKey]) {
      delete wordStats[wordKey];
      localStorage.setItem("wordStats", JSON.stringify(wordStats));
    }

    if (updatedDifficultWords.length > 0) {
      setCurrentDifficultWord(updatedDifficultWords[0]);
      setWordClickCount(0);
      setTranslationVisible(false);
      setSpeakerDisabled(false);
    } else {
      setAdaptiveMode(false);
      setCurrentDifficultWord(null);
      setAdaptiveModeActivated(false);
    }
  }

  function skipAdaptiveMode() {
    setAdaptiveMode(false);
    setCurrentDifficultWord(null);
    setDifficultWords([]);
    setAdaptiveModeActivated(false);
  }

  // ====== NEW: התנהגות "לא יודע" ======
  function onDontKnow() {
    if (disableOptions || questionIndex == null || adaptiveMode) return;

    setDisableOptions(true);

    const currentWord = words[questionIndex];
    const sourceText = currentWord[config.sourceField];
    const translationText = currentWord.Hebrew;

    // זהו את הטקסט הנכון (לצביעה)
    const correctOption = options.find((o) => o.correct);
    const theCorrectText = correctOption ? correctOption.text : "";

    // *** אין נקודות — רק answered + usedIndices, מאפס combo, לא נוגע ב-correct/wrong
    setGameData((prev) => ({
      ...prev,
      answered: (prev.answered || 0) + 1,
      combo: 0,
      usedIndices: [...(prev.usedIndices || []), questionIndex],
    }));

    // הצג את התשובה הנכונה + טבלת מידע + כפתור המשך
    setRevealCorrect(true);
    setCorrectText(theCorrectText);
    setDontKnowInfo({ sourceText, translationText });
    setDontKnowActive(true);

    // לא משנים score, לא מפעילים adaptive
    setStatus(null);
    setMessage("");
  }

  function onDontKnowContinue() {
    // מעבר לשאלה הבאה
    setDontKnowActive(false);
    setDontKnowInfo(null);
    setRevealCorrect(false);
    setCorrectText("");
    setDisableOptions(false);

    // בחר שאלה הבאה
    pickNextQuestion();
  }

  // ====== רנדר ======
  if (!words.length || questionIndex === null) {
    return (
      <div className="loading-message">
        טוען מילים... <br />
        אנא המתן
      </div>
    );
  }

  return (
    <>
      {/* כרטיס עליון: שלום + טוגל צליל */}
      <div className="card header-card" dir="rtl">
        <div className="header-card-row">
          <span className="greeting">שלום {player.name}</span>
          <div className="sound-icon" onClick={() => setSoundEnabled((v) => !v)}>
            {soundEnabled ? (
              <PiSpeakerSimpleHigh size={24} color="#4caf50" />
            ) : (
              <PiSpeakerSimpleSlash size={24} color="#888" />
            )}
          </div>
        </div>
      </div>

      <div className="game-container">
        <Scoreboard
          player={player}
          words={words}
          gameData={gameData}
          onFinishClick={() => {
            onFinish(gameData);
            localStorage.setItem("adaptiveModeActivated", "false");
          }}
          title="סטטוס המשחק"
        />

        {adaptiveMode ? (
          <AdaptiveLearningCard
            word={currentDifficultWord}
            clickCount={wordClickCount}
            translationVisible={translationVisible}
            speakerDisabled={speakerDisabled}
            onWordClick={onAdaptiveWordClick}
            onSkip={skipAdaptiveMode}
            remainingWords={difficultWords.length}
            sourceField={config.sourceField}
          />
        ) : (
          <Question
            word={words[questionIndex]}
            words={words}
            direction={direction}
            options={options}
            onAnswer={onAnswer}
            status={status}
            message={message}
            onSpeak={onSpeak}
            disableOptions={disableOptions}
            // === חדש: תמיכה ב"לא יודע"
            onDontKnow={onDontKnow}
            revealCorrect={revealCorrect}
            correctText={correctText}
            dontKnowActive={dontKnowActive}
            dontKnowInfo={dontKnowInfo} // { sourceText, translationText }
            onDontKnowContinue={onDontKnowContinue}
          />
        )}
      </div>
    </>
  );
}
