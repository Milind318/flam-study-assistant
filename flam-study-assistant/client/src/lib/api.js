const TIMEOUT_MS = 25000;

async function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateCards(topic) {
  try {
    const res = await withTimeout(
      (signal) =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
          signal,
        }),
      TIMEOUT_MS
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, reason: "server", detail: body.error };
    }
    const body = await res.json();
    return { ok: true, raw: body.raw };
  } catch (err) {
    if (err.name === "AbortError") return { ok: false, reason: "timeout" };
    return { ok: false, reason: "network" };
  }
}

export async function saveSession(title, topic_input, cards) {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, topic_input, cards }),
  });
  if (!res.ok) throw new Error("save failed");
  return res.json();
}

export async function listSessions() {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error("list failed");
  return res.json();
}

export async function loadSession(id) {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) throw new Error("load failed");
  return res.json();
}

export async function deleteSession(id) {
  const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("delete failed");
}
