import { useEffect, useState } from "react";
import { listSessions, loadSession, deleteSession } from "../lib/api";

export default function SessionsSidebar({ onLoad, refreshKey }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error

  useEffect(() => {
    refresh();
  }, [refreshKey]);

  async function refresh() {
    setStatus("loading");
    try {
      const rows = await listSessions();
      setSessions(rows);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function handleLoad(id) {
    try {
      const session = await loadSession(id);
      onLoad(session);
    } catch {
      setStatus("error");
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    try {
      await deleteSession(id);
      setSessions((s) => s.filter((row) => row.id !== id));
    } catch {
      setStatus("error");
    }
  }

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Saved decks</h3>
      {status === "error" && (
        <p className="sidebar-error">Can't reach the database right now.</p>
      )}
      {status === "idle" && sessions.length === 0 && (
        <p className="sidebar-empty">Nothing saved yet.</p>
      )}
      <ul className="sidebar-list">
        {sessions.map((s) => (
          <li key={s.id} className="sidebar-item" onClick={() => handleLoad(s.id)}>
            <span className="sidebar-item-title">{s.title}</span>
            <button
              className="sidebar-item-delete"
              onClick={(e) => handleDelete(s.id, e)}
              aria-label={`Delete ${s.title}`}
              title="Delete"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
