import { useState } from "react";


export default function QuizView({ cards }) {
  const [round, setRound] = useState(cards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrong, setWrong] = useState([]);
  const [finished, setFinished] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);

  const card = round[index];

  function grade(isCorrect) {
    if (!isCorrect) setWrong((w) => [...w, card]);
    const next = index + 1;
    setRevealed(false);
    if (next < round.length) {
      setIndex(next);
    } else {
      setFinished(true);
    }
  }

  function retestWrong() {
    setRound(wrong);
    setWrong([]);
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setRoundNumber((n) => n + 1);
  }

  function restartAll() {
    setRound(cards);
    setWrong([]);
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setRoundNumber(1);
  }

  if (finished) {
    const scored = round.length - wrong.length;
    return (
      <div className="quiz-summary">
        <h3>Round {roundNumber} done</h3>
        <p>
          {scored} / {round.length} correct
        </p>
        {wrong.length > 0 ? (
          <button className="btn btn-primary" onClick={retestWrong}>
            Re-test the {wrong.length} you missed
          </button>
        ) : (
          <p className="quiz-clean">Clean round — nice work.</p>
        )}
        <button className="btn btn-secondary" onClick={restartAll}>
          Restart full quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="deck-count">
        Round {roundNumber} · Question {index + 1} of {round.length}
      </div>
      <div className="quiz-card">
        <p className="quiz-question">{card.question}</p>
        {revealed && <p className="quiz-answer">{card.answer}</p>}
      </div>

      {!revealed ? (
        <button className="btn btn-primary" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      ) : (
        <div className="quiz-grade-row">
          <button className="btn btn-good" onClick={() => grade(true)}>
            I got it right
          </button>
          <button className="btn btn-bad" onClick={() => grade(false)}>
            I got it wrong
          </button>
        </div>
      )}
    </div>
  );
}
