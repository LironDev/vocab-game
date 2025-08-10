import React from "react";
import { FaTrophy, FaRedo, FaArrowLeft, FaShareAlt } from "react-icons/fa";
import html2canvas from "html2canvas";

export default function FinishScreen({ player, gameData, onRestart, onBack }) {
  const handleShare = () => {
    html2canvas(document.body).then((canvas) => {
      canvas.toBlob((blob) => {
        if (navigator.share) {
          const file = new File([blob], "score.png", { type: "image/png" });
          navigator
            .share({
              files: [file],
              title: "התוצאה שלי במשחק המילים",
              text: `השגתי ${gameData.score} נקודות!`,
            })
            .catch((err) => console.log("Share canceled", err));
        } else {
          const link = document.createElement("a");
          link.href = canvas.toDataURL();
          link.download = "score.png";
          link.click();
        }
      });
    });
  };

  return (
    <div className="finish-screen">
      <FaTrophy className="trophy-big" />
      <h2>כל הכבוד {player.name}!</h2>
      <p>סיימת את המשחק.</p>
      <p>נקודות: {gameData.score}</p>
      <p>שאלות: {gameData.answered}</p>
      <p>תשובות נכונות: {gameData.correct}</p>
      <p>הרצף הארוך ביותר: x{gameData.maxCombo || 1}</p>
      <div className="finish-buttons">
        <button onClick={onRestart}>
          <FaRedo style={{ marginLeft: "8px" }} />
          התחל מחדש
        </button>
        <button onClick={onBack}>
          <FaArrowLeft style={{ marginLeft: "8px" }} />
          חזור למשחק
        </button>
        <button className="finish-btn share-btn" onClick={handleShare}>
          <FaShareAlt style={{ marginLeft: "8px" }} />
          שתף
        </button>
      </div>
    </div>
  );
}
