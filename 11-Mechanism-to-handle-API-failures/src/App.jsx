import { useState, useRef } from "react";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, shouldFail, onAttempt, signal) {
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    if (signal.aborted) throw new Error("Aborted");

    onAttempt(attempt);

    try {
      if (shouldFail) throw new Error("Simulated network failure");

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      return await res.json();
    } catch (err) {
      if (signal.aborted) throw new Error("Aborted");
      if (attempt > MAX_RETRIES) throw err;

      // Wait before retry, with backoff
      const delay = RETRY_DELAY_MS * attempt;
      await sleep(delay);
    }
  }
}

const STATUS = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function App() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [simulateFail, setSimulateFail] = useState(false);
  const abortRef = useRef(null);

  const addLog = (msg, type = "info") =>
    setLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), msg, type, time: new Date().toLocaleTimeString() },
    ]);

  const handleFetch = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(STATUS.LOADING);
    setData(null);
    setLogs([]);
    setCurrentAttempt(0);

    const url = "https://jsonplaceholder.typicode.com/posts/1";

    try {
      const result = await fetchWithRetry(
        url,
        simulateFail,
        (attempt) => {
          setCurrentAttempt(attempt);
          if (attempt === 1) {
            addLog("Sending request...", "info");
          } else {
            addLog(`Retry ${attempt - 1} of ${MAX_RETRIES}...`, "warn");
          }
        },
        controller.signal
      );
      addLog("Request succeeded!", "success");
      setData(result);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      if (err.message === "Aborted") return;
      addLog(`All ${MAX_RETRIES} retries exhausted. Request failed.`, "error");
      setStatus(STATUS.ERROR);
    }
  };

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort();
    setStatus(STATUS.IDLE);
    setData(null);
    setLogs([]);
    setCurrentAttempt(0);
  };

  const isLoading = status === STATUS.LOADING;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>Netflix-style Resilience</div>
          <h1 style={styles.title}>API Failure Handler</h1>
          <p style={styles.subtitle}>
            Automatically retries failed requests up to <strong>{MAX_RETRIES} times</strong> with
            exponential backoff.
          </p>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <label style={styles.toggle}>
            <div
              style={{ ...styles.switchTrack, background: simulateFail ? "#ef4444" : "#d1d5db" }}
              onClick={() => !isLoading && setSimulateFail((v) => !v)}
            >
              <div
                style={{
                  ...styles.switchThumb,
                  transform: simulateFail ? "translateX(20px)" : "translateX(2px)",
                }}
              />
            </div>
            <span style={styles.toggleLabel}>
              {simulateFail ? "🔴 Simulating failure" : "🟢 API is healthy"}
            </span>
          </label>

          <div style={styles.btnRow}>
            <button
              onClick={handleFetch}
              disabled={isLoading}
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: isLoading ? 0.6 : 1 }}
            >
              {isLoading ? `Attempt ${currentAttempt} of ${MAX_RETRIES + 1}...` : "Send Request"}
            </button>
            {status !== STATUS.IDLE && (
              <button onClick={handleReset} style={{ ...styles.btn, ...styles.btnSecondary }}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Retry Progress */}
        {isLoading && (
          <div style={styles.progressWrap}>
            {Array.from({ length: MAX_RETRIES + 1 }).map((_, i) => (
              <div key={i} style={styles.progressStep}>
                <div
                  style={{
                    ...styles.progressDot,
                    background:
                      i + 1 < currentAttempt
                        ? "#ef4444"
                        : i + 1 === currentAttempt
                        ? "#f59e0b"
                        : "#e5e7eb",
                    transform: i + 1 === currentAttempt ? "scale(1.3)" : "scale(1)",
                    transition: "all 0.3s",
                  }}
                />
                <span style={styles.progressLabel}>
                  {i === 0 ? "Initial" : `Retry ${i}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Log Console */}
        {logs.length > 0 && (
          <div style={styles.console}>
            <div style={styles.consoleBar}>
              <span style={styles.consoleDot("#ef4444")} />
              <span style={styles.consoleDot("#f59e0b")} />
              <span style={styles.consoleDot("#22c55e")} />
              <span style={styles.consoleTitle}>Console</span>
            </div>
            <div style={styles.consoleLogs}>
              {logs.map((l) => (
                <div key={l.id} style={{ ...styles.logLine, color: logColor(l.type) }}>
                  <span style={styles.logTime}>{l.time}</span>
                  <span>{logIcon(l.type)} {l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {status === STATUS.SUCCESS && data && (
          <div style={{ ...styles.result, borderColor: "#22c55e", background: "#f0fdf4" }}>
            <p style={{ ...styles.resultTitle, color: "#15803d" }}>✅ Response received</p>
            <pre style={styles.resultPre}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        {status === STATUS.ERROR && (
          <div style={{ ...styles.result, borderColor: "#ef4444", background: "#fef2f2" }}>
            <p style={{ ...styles.resultTitle, color: "#dc2626" }}>
              ❌ Request failed after {MAX_RETRIES} retries
            </p>
            <p style={styles.resultBody}>
              All retry attempts were exhausted. This is where you'd show a user-facing error or
              fallback content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const logColor = (type) =>
  ({ success: "#22c55e", warn: "#f59e0b", error: "#ef4444", info: "#94a3b8" }[type] || "#94a3b8");

const logIcon = (type) =>
  ({ success: "✓", warn: "↺", error: "✗", info: "→" }[type] || "→");

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: "#1e293b",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 560,
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
    border: "1px solid #334155",
  },
  header: { marginBottom: 28 },
  badge: {
    display: "inline-block",
    background: "#e50914",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    padding: "3px 10px",
    borderRadius: 4,
    marginBottom: 12,
  },
  title: { color: "#f1f5f9", fontSize: 24, fontWeight: 700, margin: "0 0 8px" },
  subtitle: { color: "#94a3b8", fontSize: 14, margin: 0, lineHeight: 1.6 },
  controls: { marginBottom: 24 },
  toggle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    marginBottom: 16,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    position: "relative",
    cursor: "pointer",
    transition: "background 0.3s",
    flexShrink: 0,
  },
  switchThumb: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.3s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  },
  toggleLabel: { color: "#cbd5e1", fontSize: 14 },
  btnRow: { display: "flex", gap: 10 },
  btn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  btnPrimary: { background: "#3b82f6", color: "#fff" },
  btnSecondary: {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #475569",
  },
  progressWrap: {
    display: "flex",
    gap: 0,
    alignItems: "flex-start",
    marginBottom: 20,
    padding: "16px",
    background: "#0f172a",
    borderRadius: 10,
    justifyContent: "space-around",
  },
  progressStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  progressDot: { width: 14, height: 14, borderRadius: "50%" },
  progressLabel: { color: "#64748b", fontSize: 11 },
  console: {
    background: "#0d1117",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    border: "1px solid #21262d",
  },
  consoleBar: {
    background: "#161b22",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderBottom: "1px solid #21262d",
  },
  consoleDot: (c) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: c,
    display: "inline-block",
  }),
  consoleTitle: { color: "#8b949e", fontSize: 12, marginLeft: 6 },
  consoleLogs: { padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 },
  logLine: {
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    display: "flex",
    gap: 10,
    alignItems: "baseline",
  },
  logTime: { color: "#4b5563", fontSize: 11, flexShrink: 0 },
  result: {
    border: "1px solid",
    borderRadius: 10,
    padding: 16,
  },
  resultTitle: { fontWeight: 700, margin: "0 0 8px", fontSize: 15 },
  resultBody: { color: "#6b7280", fontSize: 14, margin: 0 },
  resultPre: {
    background: "#0f172a",
    color: "#86efac",
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    overflow: "auto",
    margin: 0,
    fontFamily: "'Courier New', monospace",
  },
};