import { useRef, useState } from "react";
import PromptInput from "./components/PromptInput";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import FlashcardDeck from "./components/FlashcardDeck";
import QuizView from "./components/QuizView";
import SessionsSidebar from "./components/SessionsSidebar";
import "./App.css";
import { generateCards, saveSession } from "./lib/api";
import { parseCardsResponse, FAILURE_MESSAGES } from "./lib/validateResult";

export default function App() {
  const [status, setStatus] = useState("idle");
  const [cards, setCards] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("cards"); 
  const [saveState, setSaveState] = useState("idle"); 
  const [sidebarKey, setSidebarKey] = useState(0);

  
  const requestId = useRef(0);

  async function handleGenerate(inputTopic) {
    const id = ++requestId.current;
    setTopic(inputTopic);
    setStatus("loading");
    setSaveState("idle");

    const result = await generateCards(inputTopic);
    if (id !== requestId.current) return; // a newer request has since started

    if (!result.ok) {
      setErrorMsg(FAILURE_MESSAGES[result.reason] || "Something unexpected happened.");
      setStatus("error");
      return;
    }

    const parsed = parseCardsResponse(result.raw);
    if (id !== requestId.current) return;

    if (!parsed.ok) {
      setErrorMsg(FAILURE_MESSAGES[parsed.reason]);
      setStatus("error");
      return;
    }

    setCards(parsed.cards);
    setMode("cards");
    setStatus("success");
  }

  function handleRetry() {
    if (topic) handleGenerate(topic);
  }

  async function handleSave() {
    setSaveState("saving");
    try {
      const title = topic.length > 60 ? topic.slice(0, 57) + "…" : topic;
      await saveSession(title, topic, cards);
      setSaveState("saved");
      setSidebarKey((k) => k + 1);
    } catch {
      setSaveState("error");
    }
  }

  function handleLoadSession(session) {
    let parsedCards;
    try {
      parsedCards =
        typeof session.cards_json === "string" ? JSON.parse(session.cards_json) : session.cards_json;
    } catch {
      setErrorMsg("This saved deck is corrupted and couldn't be loaded.");
      setStatus("error");
      return;
    }
    setCards(parsedCards.map((c, i) => ({ ...c, id: `${session.id}-${i}` })));
    setTopic(session.topic_input || session.title);
    setMode("cards");
    setStatus("success");
    setSaveState("saved");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Recall</h1>
        <p className="app-tagline">Turn any notes into a flashcard deck you can actually study from.</p>
      </header>

      <div className="app-body">
        <SessionsSidebar onLoad={handleLoadSession} refreshKey={sidebarKey} />

        <main className="app-main">
          <PromptInput onSubmit={handleGenerate} disabled={status === "loading"} />

          <section className="results" aria-live="polite">
            {status === "idle" && <EmptyState />}
            {status === "loading" && <LoadingState />}
            {status === "error" && <ErrorState message={errorMsg} onRetry={handleRetry} />}
            {status === "success" && cards.length > 0 && (
              <>
                <div className="results-toolbar">
                  <div className="mode-toggle">
                    <button
                      className={mode === "cards" ? "mode-btn is-active" : "mode-btn"}
                      onClick={() => setMode("cards")}
                    >
                      Flip cards
                    </button>
                    <button
                      className={mode === "quiz" ? "mode-btn is-active" : "mode-btn"}
                      onClick={() => setMode("quiz")}
                    >
                      Quiz me
                    </button>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={handleSave}
                    disabled={saveState === "saving" || saveState === "saved"}
                  >
                    {saveState === "saving" && "Saving…"}
                    {saveState === "saved" && "Saved ✓"}
                    {saveState === "error" && "Retry save"}
                    {saveState === "idle" && "Save this deck"}
                  </button>
                </div>

                {mode === "cards" ? <FlashcardDeck cards={cards} /> : <QuizView cards={cards} />}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
