import { useState, useEffect, useRef } from "react";

const SLIDES = [
  { id: 1, src: "https://picsum.photos/id/10/800/500",  label: "Forest trail at dawn" },
  { id: 2, src: "https://picsum.photos/id/43/800/500",  label: "Mountain lake" },
  { id: 3, src: "https://picsum.photos/id/62/800/500",  label: "City skyline" },
  { id: 4, src: "https://picsum.photos/id/76/800/500",  label: "Coastal cliffs" },
  { id: 5, src: "https://picsum.photos/id/96/800/500",  label: "Desert dunes" },
];

const DELAY = 3000;
const n = SLIDES.length;

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor"/>
      <rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor"/>
    </svg>
  );
}

export default function ImageCarousel() {
  const [cur, setCur]       = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProg] = useState(0);
  const rafRef               = useRef(null);
  const startRef             = useRef(null);
  const pausedRef            = useRef(paused);
  pausedRef.current          = paused;

  const goTo = (idx) => setCur(((idx % n) + n) % n);
  const next = ()    => setCur(c => (c + 1) % n);
  const prev = ()    => goTo(cur - 1);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCur(c => (c + 1) % n), DELAY);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    if (paused) { setProg(0); return; }
    cancelAnimationFrame(rafRef.current);
    setProg(0);
    startRef.current = performance.now();
    const tick = (now) => {
      if (pausedRef.current) return;
      const elapsed = now - startRef.current;
      setProg(Math.min(elapsed / DELAY, 1));
      if (elapsed < DELAY) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, cur]);

  const arrowBtn = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    background: "rgba(255,255,255,0.88)",
    border: "0.5px solid rgba(0,0,0,0.08)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#1a1a1a",
  };

  return (
    <div style={{ padding: "1.5rem 0", maxWidth: 600 }}>

      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{
          borderRadius: "var(--border-radius-lg)",
          overflow: "hidden",
          background: "var(--color-background-secondary)",
          aspectRatio: "8/5",
          position: "relative",
        }}>
          <div style={{
            display: "flex",
            height: "100%",
            transform: `translateX(-${cur * 100}%)`,
            transition: "transform 0.48s cubic-bezier(0.4,0,0.2,1)",
            willChange: "transform",
          }}>
            {SLIDES.map((s) => (
              <img
                key={s.id}
                src={s.src}
                alt={s.label}
                draggable={false}
                style={{ minWidth: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
              />
            ))}
          </div>

          <button onClick={prev} aria-label="Previous" style={{ ...arrowBtn, left: 12 }}><ChevronLeft /></button>
          <button onClick={next} aria-label="Next"     style={{ ...arrowBtn, right: 12 }}><ChevronRight /></button>

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
            background: "rgba(255,255,255,0.25)",
          }}>
            <div style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "#fff",
              transition: paused ? "none" : "width 0.05s linear",
            }} />
          </div>

          <div style={{
            position: "absolute", bottom: 10, right: 12,
            background: "rgba(0,0,0,0.42)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            padding: "3px 9px",
            borderRadius: 99,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}>
            {paused && <PauseIcon />}
            <span>{cur + 1} / {n}</span>
          </div>

          <div style={{
            position: "absolute", bottom: 10, left: 12,
            background: "rgba(0,0,0,0.38)",
            color: "#fff",
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 99,
            maxWidth: "55%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {SLIDES[cur].label}
          </div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
        }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === cur ? 22 : 7,
                height: 7,
                borderRadius: 99,
                background: i === cur ? "#1D9E75" : "var(--color-border-secondary)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: 8,
        marginTop: 14,
        paddingBottom: 4,
        overflowX: "auto",
      }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`View ${s.label}`}
            style={{
              flexShrink: 0,
              width: 72,
              height: 48,
              padding: 0,
              borderRadius: "var(--border-radius-md)",
              overflow: "hidden",
              border: i === cur ? "2px solid #1D9E75" : "2px solid transparent",
              cursor: "pointer",
              opacity: i === cur ? 1 : 0.55,
              transition: "opacity 0.2s ease, border-color 0.2s ease",
              outline: "none",
            }}
          >
            <img
              src={s.src}
              alt={s.label}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}