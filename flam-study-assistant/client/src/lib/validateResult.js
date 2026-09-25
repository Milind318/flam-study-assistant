

export function parseCardsResponse(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, reason: "empty" };
  }


  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!data || !Array.isArray(data.cards)) {
    return { ok: false, reason: "shape" };
  }

  const cards = data.cards
    .filter(
      (c) =>
        c &&
        typeof c.question === "string" &&
        c.question.trim() &&
        typeof c.answer === "string" &&
        c.answer.trim()
    )
    .map((c, i) => ({
      id: `${Date.now()}-${i}`,
      question: c.question.trim(),
      answer: c.answer.trim(),
    }));

  if (cards.length === 0) {
    return { ok: false, reason: "shape" };
  }

  return { ok: true, cards };
}

export const FAILURE_MESSAGES = {
  empty: "The AI came back with nothing. Try rephrasing your notes, then retry.",
  malformed: "The AI's response wasn't valid JSON. This happens occasionally — retry usually fixes it.",
  shape: "The AI's response didn't match the expected flashcard format. Retry, or try a more specific topic.",
  network: "Couldn't reach the server. Check your connection and retry.",
  timeout: "The AI took too long to respond. Retry.",
  server: "The AI provider had an error on their end. Retry in a moment.",
};
