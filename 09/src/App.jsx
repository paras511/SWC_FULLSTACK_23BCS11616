import { useState, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   VALIDATION ENGINE  (reusable — import anywhere)
   ══════════════════════════════════════════════════════════════ */

/** Primitive rule factories */
const V = {
  required: (label = "This field") => (v) =>
    !v || !String(v).trim() ? `${label} is required` : null,

  email: () => (v) =>
    v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? "Enter a valid email address"
      : null,

  minLength: (n) => (v) =>
    v && v.length < n ? `Must be at least ${n} characters` : null,

  hasUpper: () => (v) =>
    v && !/[A-Z]/.test(v) ? "Needs an uppercase letter" : null,

  hasNumber: () => (v) =>
    v && !/\d/.test(v) ? "Needs a number" : null,

  hasSpecial: () => (v) =>
    v && !/[!@#$%^&*()\-_=+{};:,<.>?]/.test(v)
      ? "Needs a special character (!@#…)"
      : null,
};

/** Run rules in order; pass `ctx` (all field values) for cross-field checks */
function runRules(rules, value, ctx = {}) {
  for (const rule of rules) {
    const err = rule(value, ctx);
    if (err) return err;
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════
   useForm HOOK
   ══════════════════════════════════════════════════════════════ */
function useForm(schema) {
  const [fields, setFields] = useState(() =>
    Object.fromEntries(
      Object.keys(schema).map((k) => [k, { value: "", error: null, touched: false }])
    )
  );

  // Always-current snapshot for cross-field ctx
  const snap = useRef(fields);
  snap.current = fields;

  const getCtx = () =>
    Object.fromEntries(Object.entries(snap.current).map(([k, f]) => [k, f.value]));

  const touch = (name, value) => ({
    value,
    touched: true,
    error: runRules(schema[name], value, getCtx()),
  });

  const onChange = (name, value) =>
    setFields((p) => ({
      ...p,
      [name]: p[name].touched ? touch(name, value) : { ...p[name], value },
    }));

  const onBlur = (name) =>
    setFields((p) => ({ ...p, [name]: touch(name, p[name].value) }));

  /** Validates everything; returns true if clean */
  const submitGuard = () => {
    const ctx = getCtx();
    let valid = true;
    const next = {};
    for (const name of Object.keys(schema)) {
      const value = fields[name].value;
      const error = runRules(schema[name], value, ctx);
      next[name] = { value, touched: true, error };
      if (error) valid = false;
    }
    setFields(next);
    return valid;
  };

  const vals = Object.entries(fields);
  const isValid =
    vals.every(([, f]) => f.touched) &&
    vals.every(([k, f]) => !runRules(schema[k], f.value, getCtx()));

  return { fields, onChange, onBlur, submitGuard, isValid };
}

/* ══════════════════════════════════════════════════════════════
   PASSWORD STRENGTH HELPER
   ══════════════════════════════════════════════════════════════ */
const RULES_META = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter",  test: (v) => /[A-Z]/.test(v) },
  { label: "One number",            test: (v) => /\d/.test(v) },
  { label: "One special character", test: (v) => /[!@#$%^&*()\-_=+{};:,<.>?]/.test(v) },
];

function getStrength(pw) {
  if (!pw) return { pct: 0, label: "", color: "#e2e8f0" };
  const score = RULES_META.filter((r) => r.test(pw)).length;
  const map = [
    { pct: 10,  label: "",             color: "#e2e8f0" },
    { pct: 30,  label: "Weak",         color: "#ef4444" },
    { pct: 55,  label: "Fair",         color: "#f97316" },
    { pct: 78,  label: "Good",         color: "#eab308" },
    { pct: 100, label: "Strong  ✓",    color: "#22c55e" },
  ];
  return map[score] ?? map[0];
}

/* ══════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ══════════════════════════════════════════════════════════════ */
const C = {
  bg:      "#f7f8fc",
  card:    "#ffffff",
  border:  "#e2e8f0",
  focus:   "#4f46e5",
  text:    "#0f172a",
  muted:   "#64748b",
  error:   "#dc2626",
  errBg:   "#fef2f2",
  success: "#16a34a",
  succBg:  "#f0fdf4",
};

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} style={{
      display: "block", fontSize: 12.5, fontWeight: 600,
      color: C.text, marginBottom: 6, letterSpacing: "0.02em",
      fontFamily: "monospace",
    }}>
      {children}
    </label>
  );
}

function Field({ label, id, type = "text", value, error, touched, onChange, onBlur, placeholder, suffix }) {
  const [focused, setFocused] = useState(false);
  const showErr = touched && error;
  return (
    <div style={{ marginBottom: 18 }}>
      <Label htmlFor={id}>{label}</Label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => { setFocused(false); onBlur(); }}
          onFocus={() => setFocused(true)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: suffix ? "10px 42px 10px 13px" : "10px 13px",
            fontSize: 13.5, fontFamily: "monospace",
            background: showErr ? C.errBg : "#fafbff",
            border: `1.5px solid ${showErr ? C.error : focused ? C.focus : C.border}`,
            borderRadius: 8, color: C.text, outline: "none",
            transition: "border-color 0.18s, background 0.18s",
          }}
        />
        {suffix && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: C.muted, fontSize: 13, cursor: "pointer",
          }}>
            {suffix}
          </span>
        )}
      </div>
      {showErr && (
        <p style={{
          margin: "5px 0 0", fontSize: 11.5, color: C.error,
          fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4,
        }}>
          <span>✕</span> {error}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCHEMA  (defined once — reuse across pages)
   ══════════════════════════════════════════════════════════════ */
const SCHEMA = {
  name: [V.required("Full name")],
  email: [
    V.required("Email"),
    V.email(),
  ],
  password: [
    V.required("Password"),
    V.minLength(8),
    V.hasUpper(),
    V.hasNumber(),
    V.hasSpecial(),
  ],
  confirm: [
    V.required("Confirm password"),
    (v, ctx) => v !== ctx.password ? "Passwords do not match" : null,
  ],
};

/* ══════════════════════════════════════════════════════════════
   FORM COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function SignupForm() {
  const { fields, onChange, onBlur, submitGuard, isValid } = useForm(SCHEMA);
  const [showPw, setShowPw]       = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pw = fields.password.value;
  const strength = getStrength(pw);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitGuard()) setSubmitted(true);
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{
          background: C.card, borderRadius: 16, padding: "44px 40px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)", textAlign: "center", maxWidth: 420, width: "100%",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: C.succBg, border: `2px solid ${C.success}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, margin: "0 auto 20px",
          }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>Account Created!</h2>
          <p style={{ fontSize: 13, color: C.muted, fontFamily: "monospace", marginBottom: 24 }}>
            Welcome, <strong style={{ color: C.text }}>{fields.name.value}</strong>
          </p>
          <button
            onClick={() => setSubmitted(false)}
            style={{
              background: C.focus, color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 28px", fontSize: 13,
              fontFamily: "monospace", fontWeight: 600, cursor: "pointer",
            }}
          >
            Back to form
          </button>
        </div>
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{
        background: C.card, borderRadius: 16, padding: "40px 36px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)", width: "100%", maxWidth: 440,
      }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 5, fontFamily: "'Georgia', serif" }}>
            Create your account
          </h1>
          <p style={{ fontSize: 12.5, color: C.muted, fontFamily: "monospace" }}>
            All fields are required · validation runs on blur
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <Field
            label="Full Name"
            id="name"
            placeholder="Jane Smith"
            value={fields.name.value}
            error={fields.name.error}
            touched={fields.name.touched}
            onChange={(v) => onChange("name", v)}
            onBlur={() => onBlur("name")}
          />

          {/* Email */}
          <Field
            label="Email Address"
            id="email"
            type="email"
            placeholder="jane@example.com"
            value={fields.email.value}
            error={fields.email.error}
            touched={fields.email.touched}
            onChange={(v) => onChange("email", v)}
            onBlur={() => onBlur("email")}
          />

          {/* Password */}
          <Field
            label="Password"
            id="password"
            type={showPw ? "text" : "password"}
            placeholder="Min 8 chars, upper, number, symbol"
            value={pw}
            error={fields.password.error}
            touched={fields.password.touched}
            onChange={(v) => onChange("password", v)}
            onBlur={() => onBlur("password")}
            suffix={
              <span onClick={() => setShowPw((x) => !x)} style={{ fontSize: 12 }}>
                {showPw ? "Hide" : "Show"}
              </span>
            }
          />

          {/* Strength bar */}
          {pw && (
            <div style={{ marginTop: -12, marginBottom: 16 }}>
              <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                <div style={{
                  height: "100%", width: `${strength.pct}%`,
                  background: strength.color, borderRadius: 4,
                  transition: "width 0.35s ease, background 0.35s ease",
                }} />
              </div>
              {/* Requirements checklist */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                {RULES_META.map((r) => {
                  const ok = r.test(pw);
                  return (
                    <span key={r.label} style={{
                      fontSize: 11, fontFamily: "monospace",
                      color: ok ? C.success : C.muted,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <span style={{ fontSize: 10 }}>{ok ? "✓" : "○"}</span>
                      {r.label}
                    </span>
                  );
                })}
              </div>
              {strength.label && (
                <p style={{ fontSize: 11, fontFamily: "monospace", color: strength.color, marginTop: 6, fontWeight: 700 }}>
                  Strength: {strength.label}
                </p>
              )}
            </div>
          )}

          {/* Confirm password */}
          <Field
            label="Confirm Password"
            id="confirm"
            type={showCfm ? "text" : "password"}
            placeholder="Repeat your password"
            value={fields.confirm.value}
            error={fields.confirm.error}
            touched={fields.confirm.touched}
            onChange={(v) => onChange("confirm", v)}
            onBlur={() => onBlur("confirm")}
            suffix={
              <span onClick={() => setShowCfm((x) => !x)} style={{ fontSize: 12 }}>
                {showCfm ? "Hide" : "Show"}
              </span>
            }
          />

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: "100%", padding: "12px",
              background: isValid ? C.focus : "#c7d2fe",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 700, fontFamily: "monospace",
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              marginTop: 4,
            }}
          >
            {isValid ? "Create Account →" : "Complete all fields to continue"}
          </button>

        </form>

        {/* Engine note */}
        <div style={{
          marginTop: 20, padding: "12px 14px", background: "#f8faff",
          border: "1px solid #e0e7ff", borderRadius: 8,
        }}>
          <p style={{ fontSize: 11, color: "#6366f1", fontFamily: "monospace", lineHeight: 1.6 }}>
            <strong>Reusable engine:</strong> schema → <code>useForm(schema)</code> hook →
            rules run on blur, re-validate on change once touched,
            full sweep on submit. Cross-field (confirmPassword) via ctx object.
          </p>
        </div>

      </div>
    </div>
  );
}