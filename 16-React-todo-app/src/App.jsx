import { useState, useRef, useEffect } from "react";

let nextId = 4;

const INITIAL_TODOS = [
  { id: 1, text: "Review project proposal", completed: false, created: Date.now() - 3600000 },
  { id: 2, text: "Schedule team standup", completed: true, created: Date.now() - 7200000 },
  { id: 3, text: "Update documentation", completed: false, created: Date.now() - 1800000 },
];

const FILTERS = ["All", "Active", "Done"];

export default function App() {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("All");

  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    if (editId !== null) editRef.current?.focus();
  }, [editId]);

  // ── CRUD ──────────────────────────────────────────
  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((p) => [{ id: nextId++, text, completed: false, created: Date.now() }, ...p]);
    setInput("");
    inputRef.current?.focus();
  };

  const deleteTodo = (id) => setTodos((p) => p.filter((t) => t.id !== id));

  const toggleTodo = (id) =>
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    const text = editText.trim();
    if (!text) return;
    setTodos((p) => p.map((t) => (t.id === editId ? { ...t, text } : t)));
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const clearCompleted = () => setTodos((p) => p.filter((t) => !t.completed));

  // ── Derived ───────────────────────────────────────
  const visible = todos.filter((t) => {
    if (filter === "Active") return !t.completed;
    if (filter === "Done") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>My Tasks</h1>
            <p style={s.subtitle}>
              {activeCount} remaining · {doneCount} done
            </p>
          </div>
          {doneCount > 0 && (
            <button onClick={clearCompleted} style={s.clearBtn}>
              Clear done
            </button>
          )}
        </div>

        {/* ── Add Input ── */}
        <div style={s.addRow}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task…"
            style={s.addInput}
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            style={{ ...s.addBtn, opacity: input.trim() ? 1 : 0.45 }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div style={s.tabs}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...s.tab,
                ...(filter === f ? s.tabActive : {}),
              }}
            >
              {f}
              <span style={{
                ...s.tabCount,
                background: filter === f ? "#4f46e5" : "#e2e8f0",
                color: filter === f ? "#fff" : "#64748b",
              }}>
                {f === "All" ? todos.length : f === "Active" ? activeCount : doneCount}
              </span>
            </button>
          ))}
        </div>

        {/* ── Task List ── */}
        <div style={s.list}>
          {visible.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>
                {filter === "Done" ? "✓" : filter === "Active" ? "○" : "✎"}
              </div>
              <p style={s.emptyText}>
                {filter === "Done"
                  ? "No completed tasks yet"
                  : filter === "Active"
                  ? "Nothing left to do — you're all caught up!"
                  : "Add your first task above"}
              </p>
            </div>
          ) : (
            visible.map((todo) => (
              <div
                key={todo.id}
                style={{
                  ...s.item,
                  background: todo.completed ? "#f8fafc" : "#fff",
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  style={{
                    ...s.check,
                    background: todo.completed ? "#4f46e5" : "transparent",
                    borderColor: todo.completed ? "#4f46e5" : "#cbd5e1",
                  }}
                  title={todo.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {todo.completed && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Text / Edit */}
                <div style={s.itemBody}>
                  {editId === todo.id ? (
                    <div style={s.editRow}>
                      <input
                        ref={editRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        style={s.editInput}
                      />
                      <div style={s.editActions}>
                        <button onClick={saveEdit} style={{ ...s.actionBtn, ...s.saveBtn }}>Save</button>
                        <button onClick={cancelEdit} style={{ ...s.actionBtn, ...s.cancelBtn }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <span
                      style={{
                        ...s.taskText,
                        textDecoration: todo.completed ? "line-through" : "none",
                        color: todo.completed ? "#94a3b8" : "#1e293b",
                      }}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>

                {/* Actions (hidden while editing) */}
                {editId !== todo.id && (
                  <div style={s.itemActions}>
                    <button
                      onClick={() => startEdit(todo)}
                      style={s.iconBtn}
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      style={{ ...s.iconBtn, color: "#ef4444" }}
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {todos.length > 0 && (
          <div style={s.footer}>
            <span>{activeCount} task{activeCount !== 1 ? "s" : ""} remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "48px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 20px 60px rgba(79,70,229,0.12)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "28px 28px 0",
  },
  title: { fontSize: 26, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" },
  subtitle: { fontSize: 13, color: "#94a3b8", margin: 0 },
  clearBtn: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    color: "#94a3b8",
    fontSize: 12,
    padding: "5px 12px",
    cursor: "pointer",
    marginTop: 4,
    transition: "all 0.15s",
  },
  addRow: {
    display: "flex",
    gap: 10,
    padding: "20px 28px 16px",
  },
  addInput: {
    flex: 1,
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f8fafc",
  },
  addBtn: {
    background: "#4f46e5",
    border: "none",
    borderRadius: 10,
    width: 42,
    height: 42,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.2s",
  },
  tabs: {
    display: "flex",
    gap: 4,
    padding: "0 28px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 8,
    border: "none",
    background: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#ede9fe",
    color: "#4f46e5",
  },
  tabCount: {
    fontSize: 11,
    fontWeight: 600,
    padding: "1px 6px",
    borderRadius: 10,
    transition: "all 0.15s",
  },
  list: {
    padding: "8px 0",
    minHeight: 80,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "36px 20px",
    gap: 10,
  },
  emptyIcon: {
    fontSize: 32,
    color: "#cbd5e1",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    margin: 0,
    textAlign: "center",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 28px",
    borderBottom: "1px solid #f8fafc",
    transition: "background 0.15s",
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 6,
    border: "2px solid",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s",
    padding: 0,
  },
  itemBody: { flex: 1, minWidth: 0 },
  taskText: {
    fontSize: 14,
    lineHeight: 1.5,
    display: "block",
    wordBreak: "break-word",
    transition: "all 0.2s",
  },
  editRow: { display: "flex", flexDirection: "column", gap: 8 },
  editInput: {
    border: "1.5px solid #4f46e5",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 14,
    color: "#1e293b",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  editActions: { display: "flex", gap: 6 },
  actionBtn: {
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
  },
  saveBtn: { background: "#4f46e5", color: "#fff" },
  cancelBtn: { background: "#f1f5f9", color: "#64748b" },
  itemActions: {
    display: "flex",
    gap: 4,
    opacity: 0,
    transition: "opacity 0.15s",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    transition: "color 0.15s, background 0.15s",
  },
  footer: {
    padding: "12px 28px",
    borderTop: "1px solid #f1f5f9",
    fontSize: 12,
    color: "#94a3b8",
    display: "flex",
    justifyContent: "space-between",
  },
};