import { useState } from "react";

const initialTasks = [
  { id: 1, text: "Review project proposal", completed: false },
  { id: 2, text: "Schedule team standup", completed: true },
  { id: 3, text: "Update documentation", completed: false },
];

export default function TodoApp() {
  const [tasks, setTasks] = useState(initialTasks);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks([...tasks, { id: Date.now(), text: trimmed, completed: false }]);
    setInput("");
  };

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const toggleTask = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id) => {
    const trimmed = editText.trim();
    if (trimmed) setTasks(tasks.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
    setEditingId(null);
  };

  const done = tasks.filter((t) => t.completed).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F7F6F3",
      display: "flex",
      justifyContent: "center",
      padding: "48px 16px",
      fontFamily: "'Georgia', serif",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: 0,
            letterSpacing: "-0.5px",
          }}>My Tasks</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 4, fontFamily: "sans-serif" }}>
            {done} of {tasks.length} completed
          </p>
        </div>

        {/* Add Task */}
        <div style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task…"
            style={{
              flex: 1,
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: "sans-serif",
              border: "1.5px solid #ddd",
              borderRadius: 8,
              background: "#fff",
              outline: "none",
              color: "#1a1a1a",
            }}
          />
          <button
            onClick={addTask}
            style={{
              padding: "10px 18px",
              fontSize: 20,
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >+</button>
        </div>

        {/* Task List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.length === 0 && (
            <p style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: 14,
              fontFamily: "sans-serif",
              padding: "32px 0",
            }}>No tasks yet. Add one above!</p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 10,
                padding: "12px 14px",
                transition: "opacity 0.2s",
                opacity: task.completed ? 0.55 : 1,
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${task.completed ? "#1a1a1a" : "#ccc"}`,
                  background: task.completed ? "#1a1a1a" : "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                {task.completed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Text / Edit */}
              {editingId === task.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(task.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: "sans-serif",
                    border: "1px solid #1a1a1a",
                    borderRadius: 6,
                    padding: "4px 8px",
                    outline: "none",
                    color: "#1a1a1a",
                  }}
                />
              ) : (
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: "sans-serif",
                    color: "#1a1a1a",
                    textDecoration: task.completed ? "line-through" : "none",
                    cursor: "text",
                    wordBreak: "break-word",
                  }}
                  onDoubleClick={() => startEdit(task)}
                  title="Double-click to edit"
                >
                  {task.text}
                </span>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => startEdit(task)}
                  title="Edit"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    fontSize: 15,
                    padding: "2px 4px",
                    borderRadius: 4,
                    lineHeight: 1,
                  }}
                >✎</button>
                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ccc",
                    fontSize: 15,
                    padding: "2px 4px",
                    borderRadius: 4,
                    lineHeight: 1,
                  }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: clear completed */}
        {done > 0 && (
          <button
            onClick={() => setTasks(tasks.filter((t) => !t.completed))}
            style={{
              marginTop: 20,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#bbb",
              fontSize: 12,
              fontFamily: "sans-serif",
              display: "block",
              marginLeft: "auto",
            }}
          >
            Clear {done} completed
          </button>
        )}
      </div>
    </div>
  );
}