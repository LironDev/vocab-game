import React from "react";
import { FcSpeaker } from "react-icons/fc";
import { speak } from "../utils/speech";
import { useLanguage } from "../context/LanguageContext";

export default function Question({
  word,
  direction,
  options,
  onAnswer,
  status,                // "correct" | "wrong" | null
  message,
  onSpeak,               // provided by Game
  disableOptions,
  onDontKnow,
  // dont-know behavior props:
  revealCorrect = false,
  correctText = "",
  dontKnowActive = false,
  dontKnowInfo = null,   // { sourceText, translationText }
  onDontKnowContinue,
}) {
  const { config } = useLanguage(); // { sourceField, ttsLocale }
  const promptText = direction === "engToHeb" ? word[config.sourceField] : word.Hebrew;
  const areOptionsDisabled = disableOptions || dontKnowActive || revealCorrect;

  return (
    <div className="question-container">
      <div className="prompt">
        {direction === "engToHeb" && (
          <FcSpeaker onClick={onSpeak} style={{ cursor: "pointer" }} />
        )}
        <span className="prompt-text">{promptText}</span>
      </div>

      <div className="options">
        {options.map((option) => {
          let className = "option-btn";
          if (!dontKnowActive && !revealCorrect && status) {
            if (option.correct) className += " correct";
            else if (option.text === message?.selectedWrong) className += " wrong";
          }
          if (revealCorrect && option.text === correctText) className += " correct";

          return (
            <div key={option.text} className={`option-container ${direction === "hebToEng" ? "has-speaker" : ""}`}>
              {direction === "hebToEng" && (
                <FcSpeaker
                  onClick={() => {
                    speak(option.text, { lang: config.ttsLocale, rate: 0.8, pitch: 1, volume: 1, queue: false });
                  }}
                  style={{ cursor: "pointer" }}
                />
              )}
              <button
                className={className}
                onClick={() => onAnswer(option.text)}
                disabled={areOptionsDisabled}
                aria-disabled={areOptionsDisabled}
                tabIndex={areOptionsDisabled ? -1 : 0}
              >
                {option.text}
              </button>
            </div>
          );
        })}
      </div>

      {!dontKnowActive && (
        <div className="dont-know-wrap">
          <button type="button" className="dont-know-link" onClick={onDontKnow} disabled={disableOptions}>
            לא יודע, לחץ לתשובה
          </button>
        </div>
      )}

      {dontKnowActive && (
        <div className="dont-know-reveal" dir="rtl">
          {dontKnowInfo && (
            <table className="mini-table">
              <thead>
                <tr><th>מילה</th><th>תרגום</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{dontKnowInfo.sourceText}</td>
                  <td>{dontKnowInfo.translationText}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div className="continue-wrap">
            <button type="button" className="primary next-btn" onClick={onDontKnowContinue}>
              המשך למילה הבאה
            </button>
          </div>
      </div>
      )}

      {!dontKnowActive && message && (
        <div className={`message ${status || ""}`}>{message}</div>
      )}
    </div>
  );
}
