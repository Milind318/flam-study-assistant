export default function LoadingState() {
  return (
    <div className="state-block" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p>Reading your notes and writing flashcards…</p>
    </div>
  );
}
