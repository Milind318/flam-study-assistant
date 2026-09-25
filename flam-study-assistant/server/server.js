import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, verifyDbConnection } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// ---------------------------------------------------------------------
// POST /api/generate
// Takes free-form text from the client, asks the LLM for STRICT JSON
// (an array of flashcards), and returns parsed JSON to the client.
// The API key never leaves this server.
// ---------------------------------------------------------------------
app.post("/api/generate", async (req, res) => {
  const { topic } = req.body || {};

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "topic is required" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Add it to server/.env" });
  }

  const systemPrompt = `You generate study flashcards. Always reply with ONLY valid JSON, no prose, no markdown fences.
The JSON must match exactly this shape:
{ "cards": [ { "question": string, "answer": string } ] }
Return between 5 and 10 cards. Questions must be answerable from the topic/notes given. Keep answers concise (max ~2 sentences).`;

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Notes / topic:\n${topic}` },
        ],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("[generate] upstream error", upstream.status, text);
      return res.status(502).json({ error: "The AI provider returned an error." });
    }

    const data = await upstream.json();
    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) {
      return res.status(502).json({ error: "The AI returned an empty response." });
    }

    // We deliberately return the raw string to the client and let the
    // frontend do its own strict parse + shape validation, matching the
    // assignment's "defensive parsing before rendering" requirement.
    return res.json({ raw });
  } catch (err) {
    console.error("[generate] failed", err);
    return res.status(500).json({ error: "Failed to reach the AI provider." });
  }
});

// ---------------------------------------------------------------------
// Sessions: save / list / load / delete (stretch goal: save & reload)
// ---------------------------------------------------------------------
app.post("/api/sessions", async (req, res) => {
  const { title, topic_input, cards } = req.body || {};
  if (!title || !Array.isArray(cards)) {
    return res.status(400).json({ error: "title and cards[] are required" });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO sessions (title, topic_input, cards_json) VALUES (?, ?, ?)",
      [title, topic_input || "", JSON.stringify(cards)]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("[sessions:create]", err);
    res.status(500).json({ error: "Could not save session. Is MySQL running and configured?" });
  }
});

app.get("/api/sessions", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, created_at FROM sessions ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("[sessions:list]", err);
    res.status(500).json({ error: "Could not load sessions. Is MySQL running and configured?" });
  }
});

app.get("/api/sessions/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM sessions WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[sessions:get]", err);
    res.status(500).json({ error: "Could not load session." });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM sessions WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error("[sessions:delete]", err);
    res.status(500).json({ error: "Could not delete session." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  await verifyDbConnection();
});
