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
  status,
  message,
  onSpeak,
  disableOptions,
}) {
  // מה להציג כ"שאלה" (English או Hebrew)
  // const promptText = direction === "engToHeb" ? word.English : word.Hebrew;
  const sourceField = lang === "jp" ? "Japanese" : "English";
  const promptText = direction === "engToHeb" ? word[sourceField] : word.Hebrew;

  return (
    <div className="question-container">
      <div className="prompt">
        {direction === "engToHeb" && (
          <FcSpeaker onClick={onSpeak} disabled={disableOptions} />
        )}
        <span className="prompt-text">{promptText}</span>
      </div>

      <div className="options">
        {options.map((option) => {
          let className = "option-btn";
          if (status) {
            if (option.correct) className += " correct";
            else if (option.text === message.selectedWrong) className += " wrong";
          }
          return (
            <div key={option.text} className={`option-container ${direction === "hebToEng" ? "has-speaker" : ""}`}>
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
                  disabled={disableOptions}
                />
              )}
              <button
                className={className}
                onClick={() => onAnswer(option.text)}
                disabled={disableOptions}
              >
                {option.text}
              </button>
            </div>
          );
        })}
      </div>

      {message && <div className={`message ${status}`}>{message}</div>}
    </div>
  );
}
