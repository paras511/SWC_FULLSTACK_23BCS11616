import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { id: "len",   label: "At least 8 characters",       test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter (A–Z)",   test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter (a–z)",   test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "One number (0–9)",             test: (p) => /\d/.test(p) },
  { id: "spec",  label: "One special character (!@#…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const strength = (password) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { label: "Weak",   color: "#ef4444", width: "20%" };
  if (passed === 2) return { label: "Fair",   color: "#f97316", width: "40%" };
  if (passed === 3) return { label: "Good",   color: "#eab308", width: "60%" };
  if (passed === 4) return { label: "Strong", color: "#22c55e", width: "80%" };
  return               { label: "Very Strong", color: "#10b981", width: "100%" };
};

export default function ControlledForm() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [touched, setTouch] = useState({ email: false, password: false });
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = EMAIL_REGEX.test(form.email);
  const pwRules    = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(form.password) }));
  const pwValid    = pwRules.every((r) => r.passed);
  const canSubmit  = emailValid && pwValid;

  const handle = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const blur = (field) => () =>
    setTouch((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const reset = () => {
    setForm({ email: "", password: "" });
    setTouch({ email: false, password: false });
    setSubmitted(false);
    setShowPw(false);
  };

  const str = strength(form.password);
  const emailError = touched.email && !emailValid && form.email !== "";

  if (submitted) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.successIcon}>✓</div>
          <h2 style={s.successTitle}>You're signed in!</h2>
          <p style={s.successSub}>{form.email}</p>
          <button style={s.backBtn} onClick={reset}>Back to Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>🔐</div>
        <h1 style={s.title}>Sign in</h1>
        <p style={s.sub}>to continue to your account</p>

        <form onSubmit={handleSubmit} noValidate style={s.form}>
          {/* Email */}
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={form.email}
                onChange={handle("email")}
                onBlur={blur("email")}
                placeholder="you@example.com"
                style={{
                  ...s.input,
                  borderColor: emailError ? "#ef4444"
                    : touched.email && emailValid ? "#22c55e"
                    : "#d1d5db",
                }}
                autoComplete="email"
              />
              {touched.email && form.email !== "" && (
                <span style={s.inputIcon}>
                  {emailValid ? "✓" : "✕"}
                </span>
              )}
            </div>
            {emailError && (
              <p style={s.errorMsg}>Enter a valid email (e.g. name@domain.com)</p>
            )}
            {touched.email && emailValid && (
              <p style={s.okMsg}>Looks good!</p>
            )}
          </div>

          {/* Password */}
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={handle("password")}
                onBlur={blur("password")}
                placeholder="Create a password"
                style={{
                  ...s.input,
                  borderColor: touched.password && form.password
                    ? pwValid ? "#22c55e" : "#f97316"
                    : "#d1d5db",
                  paddingRight: 44,
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={s.eyeBtn}
                title={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div style={s.strengthWrap}>
                <div style={s.strengthTrack}>
                  <div style={{ ...s.strengthFill, width: str.width, background: str.color }} />
                </div>
                <span style={{ ...s.strengthLabel, color: str.color }}>{str.label}</span>
              </div>
            )}

            {/* Rules checklist */}
            {(touched.password || form.password) && (
              <ul style={s.ruleList}>
                {pwRules.map((r) => (
                  <li key={r.id} style={{ ...s.ruleItem, color: r.passed ? "#16a34a" : "#9ca3af" }}>
                    <span style={s.ruleDot}>{r.passed ? "✓" : "○"}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            style={{ ...s.submitBtn, opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? "pointer" : "not-allowed" }}
          >
            Sign In
          </button>
        </form>

        <p style={s.footer}>
          New here? <span style={s.link}>Create an account</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  logo: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 },
  sub: { fontSize: 14, color: "#6b7280", marginTop: 4, marginBottom: 28 },
  form: { textAlign: "left" },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    color: "#111827",
    background: "#fff",
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    pointerEvents: "none",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 2,
  },
  errorMsg: { fontSize: 12, color: "#ef4444", marginTop: 5, marginBottom: 0 },
  okMsg:    { fontSize: 12, color: "#16a34a", marginTop: 5, marginBottom: 0 },
  strengthWrap: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 },
  strengthTrack: { flex: 1, height: 5, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" },
  strengthFill: { height: "100%", borderRadius: 999, transition: "all 0.35s ease" },
  strengthLabel: { fontSize: 12, fontWeight: 600, minWidth: 72 },
  ruleList: { listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 5 },
  ruleItem: { fontSize: 12, display: "flex", alignItems: "center", gap: 7, transition: "color 0.2s" },
  ruleDot: { fontSize: 12, width: 14, textAlign: "center", flexShrink: 0 },
  submitBtn: {
    width: "100%",
    padding: "12px 0",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 15,
    fontWeight: 700,
    marginTop: 8,
    transition: "opacity 0.2s",
    letterSpacing: "0.2px",
  },
  footer: { fontSize: 13, color: "#6b7280", marginTop: 22 },
  link: { color: "#2563eb", fontWeight: 600, cursor: "pointer" },
  successIcon: {
    width: 64, height: 64, borderRadius: "50%",
    background: "#dcfce7", color: "#16a34a",
    fontSize: 30, display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 16px",
  },
  successTitle: { fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 },
  successSub: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  backBtn: {
    padding: "10px 24px", background: "#2563eb", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
};