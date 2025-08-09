import React from "react";

function SpeakerIcon({ onClick, disabled }) {
  return (
    <button
      className="speaker-icon"
      onClick={onClick}
      disabled={disabled}
      title="הפעל קול"
      aria-label="הפעל קול"
      onMouseEnter={(e) => e.currentTarget.classList.add("hover")}
      onMouseLeave={(e) => e.currentTarget.classList.remove("hover")}
    >
      🔊
    </button>
  );
}

export default function Question({
  word,
  direction,
  options,
  onAnswer,
  status,
  message,
  onSpeak,
  disableOptions,
}) {
  // מה להציג כ"שאלה" (English או Hebrew)
  const promptText = direction === "engToHeb" ? word.English : word.Hebrew;

  return (
    <div className="question-container">
      <div className="prompt">
        <span className="prompt-text">{promptText}</span>
        {direction === "engToHeb" && (
          <SpeakerIcon onClick={onSpeak} disabled={disableOptions} />
        )}
      </div>

      <div className="options">
        {options.map((option) => {
          let className = "option-btn";
          if (status) {
            if (option.correct) className += " correct";
            else if (option.text === message.selectedWrong) className += " wrong";
          }
          return (
            <button
              key={option.text}
              className={className}
              onClick={() => onAnswer(option.text)}
              disabled={disableOptions}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {message && <div className={`message ${status}`}>{message}</div>}
    </div>
  );
}
