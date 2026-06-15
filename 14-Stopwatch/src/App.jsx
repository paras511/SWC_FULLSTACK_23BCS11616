import { useState, useRef, useEffect } from "react";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return {
      main: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      sub: `.${String(centiseconds).padStart(2, "0")}`,
    };
  }
  return {
    main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    sub: `.${String(centiseconds).padStart(2, "0")}`,
  };
}

export default function App() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const savedElapsedRef = useRef(0);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(savedElapsedRef.current + (Date.now() - startTimeRef.current));
      }, 30);
    } else {
      clearInterval(intervalRef.current);
      savedElapsedRef.current = elapsed;
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = () => setRunning(true);

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    savedElapsedRef.current = 0;
  };

  const handleLap = () => {
    setLaps((prev) => {
      const lapTime = elapsed - (prev.length > 0 ? prev[prev.length - 1].total : 0);
      return [...prev, { total: elapsed, split: lapTime, index: prev.length + 1 }];
    });
  };

  const { main, sub } = formatTime(elapsed);

  // Find fastest and slowest laps
  const splitTimes = laps.map((l) => l.split);
  const minSplit = laps.length > 1 ? Math.min(...splitTimes) : null;
  const maxSplit = laps.length > 1 ? Math.max(...splitTimes) : null;

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.windowDots}>
            <span style={{ ...s.dot, background: "#ff5f57" }} />
            <span style={{ ...s.dot, background: "#febc2e" }} />
            <span style={{ ...s.dot, background: "#28c840" }} />
          </div>
          <span style={s.headerTitle}>Stopwatch</span>
        </div>

        {/* Clock Face */}
        <div style={s.clockFace}>
          <svg style={s.ring} viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke={running ? "#3b82f6" : elapsed > 0 ? "#64748b" : "#1e293b"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - ((elapsed / 1000) % 60) / 60)}`}
              transform="rotate(-90 100 100)"
              style={{ transition: "stroke 0.3s" }}
            />
          </svg>

          <div style={s.timeDisplay}>
            <span style={s.mainTime}>{main}</span>
            <span style={s.subTime}>{sub}</span>
          </div>
        </div>

        {/* Status */}
        <div style={s.statusRow}>
          <span style={{
            ...s.statusDot,
            background: running ? "#22c55e" : elapsed > 0 ? "#f59e0b" : "#475569",
            boxShadow: running ? "0 0 8px #22c55e" : "none",
          }} />
          <span style={s.statusText}>
            {running ? "Running" : elapsed > 0 ? "Paused" : "Ready"}
          </span>
        </div>

        {/* Controls */}
        <div style={s.controls}>
          {/* Lap — only visible when running */}
          <button
            onClick={handleLap}
            disabled={!running}
            style={{
              ...s.btn,
              ...s.btnGhost,
              opacity: running ? 1 : 0.3,
              cursor: running ? "pointer" : "default",
            }}
          >
            Lap
          </button>

          {/* Start / Pause */}
          {!running ? (
            <button onClick={handleStart} style={{ ...s.btn, ...s.btnPrimary }}>
              {elapsed === 0 ? "Start" : "Resume"}
            </button>
          ) : (
            <button onClick={handlePause} style={{ ...s.btn, ...s.btnWarning }}>
              Pause
            </button>
          )}

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={elapsed === 0}
            style={{
              ...s.btn,
              ...s.btnGhost,
              opacity: elapsed > 0 ? 1 : 0.3,
              cursor: elapsed > 0 ? "pointer" : "default",
            }}
          >
            Reset
          </button>
        </div>

        {/* Lap List */}
        {laps.length > 0 && (
          <div style={s.lapSection}>
            <div style={s.lapHeader}>
              <span>Lap</span>
              <span>Split</span>
              <span>Total</span>
            </div>
            <div style={s.lapList}>
              {[...laps].reverse().map((lap) => {
                const isFastest = lap.split === minSplit;
                const isSlowest = lap.split === maxSplit;
                return (
                  <div
                    key={lap.index}
                    style={{
                      ...s.lapRow,
                      color: isFastest ? "#22c55e" : isSlowest ? "#ef4444" : "#cbd5e1",
                    }}
                  >
                    <span style={s.lapNum}>
                      {isFastest && <span style={s.lapTag("green")}>▲</span>}
                      {isSlowest && <span style={s.lapTag("red")}>▼</span>}
                      Lap {lap.index}
                    </span>
                    <span>{formatTime(lap.split).main}{formatTime(lap.split).sub}</span>
                    <span style={{ color: "#64748b" }}>{formatTime(lap.total).main}{formatTime(lap.total).sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 24,
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 20,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
    boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    borderBottom: "1px solid #1e293b",
    background: "#0d1424",
  },
  windowDots: { display: "flex", gap: 6 },
  dot: { width: 12, height: 12, borderRadius: "50%", display: "inline-block" },
  headerTitle: { color: "#64748b", fontSize: 13, fontWeight: 500, letterSpacing: 0.5 },
  clockFace: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0 20px",
  },
  ring: {
    width: 200,
    height: 200,
    position: "absolute",
  },
  timeDisplay: {
    display: "flex",
    alignItems: "baseline",
    gap: 2,
    position: "relative",
    zIndex: 1,
  },
  mainTime: {
    fontSize: 52,
    fontWeight: 200,
    color: "#f1f5f9",
    letterSpacing: -1,
    fontVariantNumeric: "tabular-nums",
    fontFamily: "'Segoe UI', monospace",
  },
  subTime: {
    fontSize: 28,
    fontWeight: 200,
    color: "#3b82f6",
    fontVariantNumeric: "tabular-nums",
    fontFamily: "'Segoe UI', monospace",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
    transition: "all 0.4s",
  },
  statusText: {
    color: "#475569",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: 500,
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    padding: "0 24px 28px",
  },
  btn: {
    padding: "10px 22px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: 0.3,
  },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  btnWarning: { background: "#f59e0b", color: "#000" },
  btnGhost: {
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
  },
  lapSection: {
    borderTop: "1px solid #1e293b",
  },
  lapHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    padding: "10px 20px",
    fontSize: 11,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: 600,
    background: "#0d1424",
  },
  lapList: {
    maxHeight: 200,
    overflowY: "auto",
  },
  lapRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    padding: "10px 20px",
    fontSize: 13,
    borderBottom: "1px solid #1e293b",
    fontVariantNumeric: "tabular-nums",
    alignItems: "center",
  },
  lapNum: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  lapTag: (color) => ({
    fontSize: 10,
    color: color === "green" ? "#22c55e" : "#ef4444",
  }),
};