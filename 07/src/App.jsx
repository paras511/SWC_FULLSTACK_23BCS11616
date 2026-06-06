import { useState, useRef } from "react";

const COLUMNS_ORDER = ["todo", "inprogress", "done"];

const INITIAL_COLUMNS = {
  todo: {
    id: "todo",
    title: "To Do",
    dot: "#a78bfa",
    tasks: [
      { id: "t1", title: "Design landing page mockups", tag: "Design", priority: "high" },
      { id: "t2", title: "Set up CI/CD pipeline", tag: "DevOps", priority: "medium" },
      { id: "t3", title: "Write unit tests for auth", tag: "QA", priority: "high" },
      { id: "t4", title: "Update API documentation", tag: "Docs", priority: "low" },
      { id: "t5", title: "Accessibility audit", tag: "Frontend", priority: "medium" },
    ],
  },
  inprogress: {
    id: "inprogress",
    title: "In Progress",
    dot: "#fbbf24",
    tasks: [
      { id: "t6", title: "Build authentication module", tag: "Backend", priority: "high" },
      { id: "t7", title: "Fix navbar on mobile", tag: "Frontend", priority: "medium" },
      { id: "t8", title: "Optimise image pipeline", tag: "DevOps", priority: "low" },
    ],
  },
  done: {
    id: "done",
    title: "Done",
    dot: "#34d399",
    tasks: [
      { id: "t9", title: "Project kickoff meeting", tag: "Management", priority: "low" },
      { id: "t10", title: "Database schema design", tag: "Backend", priority: "medium" },
      { id: "t11", title: "Stakeholder sign-off", tag: "Management", priority: "low" },
    ],
  },
};

const PRIORITY_STYLES = {
  high:   { bg: "#fee2e2", color: "#dc2626", label: "High" },
  medium: { bg: "#fef9c3", color: "#ca8a04", label: "Med"  },
  low:    { bg: "#dcfce7", color: "#16a34a", label: "Low"  },
};

const TAG_COLORS = {
  Design:     "#e0e7ff",
  DevOps:     "#fce7f3",
  QA:         "#ecfdf5",
  Docs:       "#fffbeb",
  Frontend:   "#eff6ff",
  Backend:    "#f5f3ff",
  Management: "#fdf4ff",
};

/* ─── Card ──────────────────────────────────────────────── */
function Card({ task, colId, onDragStart, isDragging }) {
  const p = PRIORITY_STYLES[task.priority];
  const tagBg = TAG_COLORS[task.tag] || "#f3f4f6";

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id, colId)}
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "13px 14px",
        boxShadow: isDragging
          ? "0 8px 28px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.07)",
        cursor: "grab",
        opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? "rotate(2deg)" : "none",
        transition: "box-shadow 0.15s, opacity 0.15s",
        border: "1px solid #f0f0f0",
        userSelect: "none",
      }}
    >
      {/* title */}
      <p style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: "#1a1a2e",
        lineHeight: 1.45,
        marginBottom: 10,
        fontFamily: "'Georgia', serif",
      }}>
        {task.title}
      </p>

      {/* footer row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em",
          background: tagBg, color: "#444",
          padding: "2px 8px", borderRadius: 20,
          fontFamily: "monospace",
        }}>
          {task.tag}
        </span>
        <span style={{
          marginLeft: "auto",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
          background: p.bg, color: p.color,
          padding: "2px 7px", borderRadius: 20,
        }}>
          {p.label}
        </span>
      </div>
    </div>
  );
}

/* ─── Column ─────────────────────────────────────────────── */
function Column({ col, dragging, onDragStart, onDragOver, onDragLeave, onDrop, isDragOver }) {
  return (
    <div
      onDragOver={(e) => onDragOver(e, col.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, col.id)}
      style={{
        flex: 1,
        minWidth: 260,
        maxWidth: 340,
        background: isDragOver ? "#f0fdf4" : "#f7f8fa",
        borderRadius: 14,
        padding: "16px 14px",
        border: isDragOver ? "2px dashed #34d399" : "2px solid transparent",
        transition: "background 0.2s, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 8, marginBottom: 14,
      }}>
        <span style={{
          width: 9, height: 9, borderRadius: "50%",
          background: col.dot, flexShrink: 0,
          boxShadow: `0 0 0 3px ${col.dot}33`,
        }} />
        <span style={{
          fontSize: 11.5, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#555", fontFamily: "monospace",
        }}>
          {col.title}
        </span>
        <span style={{
          marginLeft: "auto",
          fontSize: 11, fontWeight: 700,
          background: "#e5e7eb", color: "#777",
          borderRadius: 20, padding: "1px 9px",
          fontFamily: "monospace",
        }}>
          {col.tasks.length}
        </span>
      </div>

      {/* cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
        {col.tasks.length === 0 ? (
          <div style={{
            height: 64, border: "1.5px dashed #d1d5db",
            borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center", color: "#bbb",
            fontSize: 11.5, letterSpacing: "0.06em",
            fontFamily: "monospace",
          }}>
            drop here
          </div>
        ) : (
          col.tasks.map(task => (
            <Card
              key={task.id}
              task={task}
              colId={col.id}
              onDragStart={onDragStart}
              isDragging={dragging?.cardId === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────── */
export default function KanbanBoard() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [dragOver, setDragOver] = useState(null);
  const dragging = useRef(null);

  const totalDone = columns.done.tasks.length;
  const total = COLUMNS_ORDER.reduce((s, k) => s + columns[k].tasks.length, 0);

  const handleDragStart = (cardId, fromColumn) => {
    dragging.current = { cardId, fromColumn };
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOver(colId);
  };

  const handleDragLeave = () => setDragOver(null);

  const handleDrop = (e, toColumn) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging.current) return;
    const { cardId, fromColumn } = dragging.current;
    dragging.current = null;
    if (fromColumn === toColumn) return;

    setColumns(prev => {
      const from = { ...prev[fromColumn], tasks: [...prev[fromColumn].tasks] };
      const to   = { ...prev[toColumn],   tasks: [...prev[toColumn].tasks]   };
      const cardIdx = from.tasks.findIndex(c => c.id === cardId);
      if (cardIdx === -1) return prev;
      const [card] = from.tasks.splice(cardIdx, 1);
      to.tasks.push(card);
      return { ...prev, [fromColumn]: from, [toColumn]: to };
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8f9ff 0%, #eef0f8 100%)",
      padding: "36px 24px",
      fontFamily: "'Georgia', serif",
    }}>
      {/* top bar */}
      <div style={{ maxWidth: 1100, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: "#1a1a2e",
            letterSpacing: "-0.02em",
          }}>
            Team Board
          </h1>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#9ca3af",
            fontFamily: "monospace",
          }}>
            {totalDone}/{total} done
          </span>
        </div>
        <p style={{
          fontSize: 12, color: "#9ca3af", marginTop: 4,
          fontFamily: "monospace", letterSpacing: "0.03em",
        }}>
          Drag cards across columns to update their status
        </p>
      </div>

      {/* board */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", gap: 16,
        alignItems: "flex-start", flexWrap: "wrap",
      }}>
        {COLUMNS_ORDER.map(colId => (
          <Column
            key={colId}
            col={columns[colId]}
            dragging={dragging.current}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragOver={dragOver === colId}
          />
        ))}
      </div>
    </div>
  );
}