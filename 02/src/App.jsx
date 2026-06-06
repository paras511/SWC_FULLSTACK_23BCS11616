import { useState } from "react";

const MAX = 200;
const WARN = 0.8;
const DANGER = 0.9;

function Ring({ used, max }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(used / max, 1);
  const fill = circ * (1 - pct);

  const color =
    pct >= 1 ? "#E24B4A" :
    pct >= DANGER ? "#E24B4A" :
    pct >= WARN ? "#EF9F27" :
    "#1D9E75";

  const remaining = max - used;
  const showNumber = pct >= WARN;

  return (
    <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--color-border-tertiary)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.15s ease, stroke 0.2s ease" }}
        />
      </svg>
      {showNumber && (
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: pct >= 1 ? 10 : 11,
          fontWeight: 500,
          color,
          transition: "color 0.2s ease",
        }}>
          {pct >= 1 ? "0" : remaining}
        </span>
      )}
    </div>
  );
}

export default function CharLimitInput() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);

  const used = text.length;
  const pct = used / MAX;
  const remaining = MAX - used;
  const atLimit = used >= MAX;

  const borderColor =
    pct >= DANGER ? "var(--color-border-danger)" :
    pct >= WARN   ? "var(--color-border-warning)" :
    "var(--color-border-secondary)";

  const countColor =
    pct >= DANGER ? "var(--color-text-danger)" :
    pct >= WARN   ? "var(--color-text-warning)" :
    "var(--color-text-tertiary)";

  const handleChange = (e) => {
    if (e.target.value.length <= MAX) setText(e.target.value);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    setHistory([{ id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...history]);
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div style={{ padding: "1.5rem 0", maxWidth: 520 }}>
      <h2 style={{ visibilityClass: "sr-only", position: "absolute", left: -9999, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        Character-limited text input with live counter
      </h2>

      <div style={{
        background: "var(--color-background-primary)",
        border: `0.5px solid var(--color-border-tertiary)`,
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
      }}>
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          maxLength={MAX}
          rows={5}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: 15,
            lineHeight: 1.6,
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
            borderBottom: `1.5px solid ${borderColor}`,
            transition: "border-color 0.2s ease",
          }}
        />

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Ring used={used} max={MAX} />
            <span style={{
              fontSize: 13,
              color: countColor,
              fontWeight: pct >= WARN ? 500 : 400,
              transition: "color 0.2s ease",
            }}>
              {pct >= 1
                ? "Limit reached"
                : pct >= DANGER
                ? `${remaining} left`
                : pct >= WARN
                ? `${remaining} remaining`
                : `${used} / ${MAX}`}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {text.length > 0 && (
              <button
                onClick={() => setText("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--color-text-tertiary)",
                  padding: "6px 8px",
                  borderRadius: "var(--border-radius-md)",
                }}
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitted}
              style={{
                padding: "7px 18px",
                fontSize: 14,
                fontWeight: 500,
                borderRadius: "var(--border-radius-md)",
                border: "none",
                cursor: text.trim() && !submitted ? "pointer" : "not-allowed",
                background: submitted ? "var(--color-background-success)" : text.trim() ? "#1D9E75" : "var(--color-background-secondary)",
                color: submitted ? "var(--color-text-success)" : text.trim() ? "#fff" : "var(--color-text-tertiary)",
                transition: "background 0.2s ease, color 0.2s ease",
                fontFamily: "var(--font-sans)",
              }}
            >
              {submitted ? "Posted" : "Post"}
            </button>
          </div>
        </div>
      </div>

      {atLimit && (
        <p style={{
          fontSize: 12,
          color: "var(--color-text-danger)",
          marginTop: 6,
          paddingLeft: 2,
          fontFamily: "var(--font-sans)",
        }}>
          Character limit reached. Please shorten your message.
        </p>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginBottom: 10, fontFamily: "var(--font-sans)" }}>
            Submitted
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((item) => (
              <div key={item.id} style={{
                background: "var(--color-background-secondary)",
                borderRadius: "var(--border-radius-md)",
                padding: "10px 14px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#1D9E75",
                  flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.5, fontFamily: "var(--font-sans)", wordBreak: "break-word" }}>
                    {item.text}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" }}>
                    {item.text.length} chars · {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}