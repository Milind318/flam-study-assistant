import { useState } from "react";

export default function PromptInput({ onSubmit, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="prompt-form">
      <label htmlFor="topic" className="prompt-label">
        Paste your notes, or just name a topic
      </label>
      <textarea
        id="topic"
        className="prompt-textarea"
        placeholder="e.g. The French Revolution, or paste your lecture notes here…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        disabled={disabled}
      />
      <div className="prompt-row">
        <span className="prompt-hint">{value.length} characters</span>
        <button type="submit" className="btn btn-primary" disabled={disabled || !value.trim()}>
          {disabled ? "Generating…" : "Generate flashcards"}
        </button>
      </div>
    </form>
  );
}
