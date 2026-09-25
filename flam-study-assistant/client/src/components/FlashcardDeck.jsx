import { useState } from "react";

export default function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  function go(delta) {
    setFlipped(false);
    setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + delta)));
  }

  return (
    <div className="deck">
      <div className="deck-count">
        Card {index + 1} of {cards.length}
      </div>

      <div
        className={`flashcard ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-tag">Question</span>
            <p>{card.question}</p>
            <span className="flashcard-flip-hint">Tap to reveal answer</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-tag">Answer</span>
            <p>{card.answer}</p>
          </div>
        </div>
      </div>

      <div className="deck-nav">
        <button className="btn btn-secondary" onClick={() => go(-1)} disabled={index === 0}>
          ← Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => go(1)}
          disabled={index === cards.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
