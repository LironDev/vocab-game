import React from "react";
import { FcSpeaker } from "react-icons/fc";
import { speak } from "../utils/speech";

const params = new URLSearchParams(window.location.search);
const lang = params.get("lang");

export default function Question({
  word,
  words,
  direction,
  options,
  onAnswer,
  status,                // "correct" | "wrong" | null
  message,               // טקסט פידבק רגיל (לא במצב "לא יודע")
  onSpeak,               // דיבור של ה-Prompt (ב-engToHeb)
  disableOptions,
  onDontKnow,            // לחיצה על "לא יודע"
  // === חדשים להתנהגות "לא יודע" ===
  revealCorrect = false, // אם true – צובע את התשובה הנכונה
  correctText = "",      // הטקסט של התשובה הנכונה לצביעה
  dontKnowActive = false,// מצב "לא יודע" פעיל – חוסם לחיצות על תשובות
  dontKnowInfo = null,   // { sourceText, translationText }
  onDontKnowContinue,    // כפתור "המשך למילה הבאה"
}) {
  const sourceField = lang === "jp" ? "Japanese" : "English";
  const promptText = direction === "engToHeb" ? word[sourceField] : word.Hebrew;

  // בבחירת תשובות: חסימה אם disableOptions או במצב "לא יודע" או אם כבר חושפים תשובה נכונה
  const areOptionsDisabled = disableOptions || dontKnowActive || revealCorrect;

  return (
    <div className="question-container">
      {/* שורת הפרומפט */}
      <div className="prompt">
        {direction === "engToHeb" && (
          <FcSpeaker onClick={onSpeak} style={{ cursor: "pointer" }} />
        )}
        <span className="prompt-text">{promptText}</span>
      </div>

      {/* אופציות */}
      <div className="options">
        {options.map((option) => {
          let className = "option-btn";
          // צביעה רגילה (כשלא במצב "לא יודע")
          if (!dontKnowActive && !revealCorrect && status) {
            if (option.correct) className += " correct";
            else if (option.text === message?.selectedWrong) className += " wrong";
          }
          // צביעה כפויה של התשובה הנכונה במצב "לא יודע"
          if (revealCorrect && option.text === correctText) {
            className += " correct";
          }

          return (
            <div
              key={option.text}
              className={`option-container ${direction === "hebToEng" ? "has-speaker" : ""}`}
            >
              {direction === "hebToEng" && (
                <FcSpeaker
                  onClick={() => {
                    const desiredLang = lang === "jp" ? "ja-JP" : "en-US";
                    speak(option.text, {
                      lang: desiredLang,
                      rate: 0.8,
                      pitch: 1,
                      volume: 1,
                      queue: false,
                    });
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
      
      {/* הודעת מצב רגילה (לא מוצגת כשבמצב "לא יודע") */}
      {!dontKnowActive && message && (
        <div className={`message ${status || ""}`}>{message}</div>
      )}
      
      {/* קישור "לא יודע" */}
      {!dontKnowActive && (
        <div className="dont-know-wrap">
          <button
            type="button"
            className="dont-know-link"
            onClick={onDontKnow}
            disabled={disableOptions}
          >
            לא יודע, לחץ לתשובה
          </button>
        </div>
      )}

      {/* במצב "לא יודע": טבלה קטנה + כפתור המשך */}
      {dontKnowActive && (
        <div className="dont-know-reveal" dir="rtl">
          {/* טבלה קטנה עם המילה והתרגום */}
          {dontKnowInfo && (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>מילה</th>
                  <th>תרגום</th>
                </tr>
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
            <button
              type="button"
              className="primary next-btn"
              onClick={onDontKnowContinue}
            >
              המשך למילה הבאה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
