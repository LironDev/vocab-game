import React, { useRef } from "react";
import html2canvas from "html2canvas";

export default function FinishScreen({ player, gameData, onRestart, onBack }) {
  const finishRef = useRef();

  async function handleShare() {
    if (!finishRef.current) return;

    try {
      const canvas = await html2canvas(finishRef.current);
      const dataUrl = canvas.toDataURL("image/png");

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "vocab-game.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "התוצאה שלי במשחק אוצר מילים",
          text: `השגתי ${gameData.score} נקודות מתוך ${gameData.answered} שאלות!`
        });
      } else {
        alert("הדפדפן שלך לא תומך בשיתוף ישיר. נשמור את התמונה במקום.");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "vocab-game.png";
        link.click();
      }
    } catch (error) {
      console.error("שגיאה בשיתוף:", error);
    }
  }

  return (
    <div ref={finishRef} className="finish-screen">
      <div className="trophy-icon">🏆</div>
      <h2>כל הכבוד {player.name}!</h2>
      <p>השגת <strong>{gameData.score}</strong> נקודות מתוך {gameData.answered} שאלות</p>
      <p>תשובות נכונות: {gameData.correct}</p>

      <div className="finish-buttons">
        <button onClick={onRestart}>התחל מחדש</button>
        <button onClick={onBack}>חזור למשחק</button>
        <button className="share-btn" onClick={handleShare}>📤 שתף</button>
      </div>
    </div>
  );
}
