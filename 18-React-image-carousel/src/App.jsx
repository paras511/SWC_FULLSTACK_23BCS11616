import { useState, useEffect, useRef, useCallback } from "react";

// ── Demo data ─────────────────────────────────────────────────
const DEMO_IMAGES = [
  { id: 1, src: "https://picsum.photos/seed/alpine/900/520",    alt: "Alpine Landscape"   },
  { id: 2, src: "https://picsum.photos/seed/oceanwave/900/520", alt: "Ocean Wave"          },
  { id: 3, src: "https://picsum.photos/seed/forestpath/900/520",alt: "Forest Path"         },
  { id: 4, src: "https://picsum.photos/seed/desertdune/900/520",alt: "Desert Dune"         },
  { id: 5, src: "https://picsum.photos/seed/citylights/900/520",alt: "City Lights"         },
];

const INTERVAL = 3500;

// ── Carousel component ────────────────────────────────────────
function Carousel({ images = DEMO_IMAGES, autoSlideInterval = INTERVAL }) {
  const [current, setCurrent]   = useState(0);
  const [paused,  setPaused]    = useState(false);
  const [fade,    setFade]      = useState(true);
  const [progress, setProgress] = useState(0);

  const timerRef    = useRef(null);
  const progressRef = useRef(null);
  const startRef    = useRef(null);
  const total       = images.length;

  // Navigate with fade
  const goTo = useCallback((index) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(((index % total) + total) % total);
      setFade(true);
      setProgress(0);
      startRef.current = Date.now();
    }, 220);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Auto-slide
  useEffect(() => {
    if (paused) { clearInterval(timerRef.current); return; }
    startRef.current = Date.now();
    timerRef.current = setInterval(next, autoSlideInterval);
    return () => clearInterval(timerRef.current);
  }, [paused, next, autoSlideInterval]);

  // Progress bar animation
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    startRef.current = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / autoSlideInterval) * 100, 100));
    }, 30);
    return () => clearInterval(progressRef.current);
  }, [paused, current, autoSlideInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  return (
    <div style={s.carousel}>

      {/* ── Main stage ── */}
      <div
        style={s.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Image */}
        <img
          key={current}
          src={images[current].src}
          alt={images[current].alt}
          style={{ ...s.mainImg, opacity: fade ? 1 : 0 }}
          draggable={false}
        />

        {/* Gradient overlays */}
        <div style={s.gradientLeft}  />
        <div style={s.gradientRight} />
        <div style={s.gradientBottom}/>

        {/* Caption */}
        <div style={{ ...s.caption, opacity: fade ? 1 : 0 }}>
          <span style={s.captionIndex}>{current + 1} / {total}</span>
          <span style={s.captionText}>{images[current].alt}</span>
        </div>

        {/* Pause badge */}
        {paused && (
          <div style={s.pauseBadge}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <rect x="6"  y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
            Paused
          </div>
        )}

        {/* Prev button */}
        <button onClick={prev} style={{ ...s.navBtn, left: 16 }} aria-label="Previous">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Next button */}
        <button onClick={next} style={{ ...s.navBtn, right: 16 }} aria-label="Next">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots */}
        <div style={s.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                ...s.dot,
                width:   i === current ? 24 : 8,
                background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={s.progressTrack}>
        <div
          style={{
            ...s.progressFill,
            width: paused ? `${progress}%` : `${progress}%`,
            transition: paused ? "none" : "width 30ms linear",
            background: paused ? "#94a3b8" : "#6366f1",
          }}
        />
      </div>

      {/* ── Thumbnails ── */}
      <div style={s.thumbRow}>
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => goTo(i)}
            style={{
              ...s.thumb,
              outline: i === current ? "2px solid #6366f1" : "2px solid transparent",
              outlineOffset: 2,
              opacity: i === current ? 1 : 0.55,
            }}
            aria-label={`View ${img.alt}`}
          >
            <img src={img.src} alt={img.alt} style={s.thumbImg} draggable={false} />
            {i === current && <div style={s.thumbActive} />}
          </button>
        ))}
      </div>

    </div>
  );
}

// ── App wrapper ───────────────────────────────────────────────
export default function App() {
  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Image Carousel</h1>
          <p style={s.pageSubtitle}>
            Hover to pause · Click thumbnails or arrows to navigate · Use ← → keys
          </p>
        </div>
        <Carousel images={DEMO_IMAGES} autoSlideInterval={INTERVAL} />
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 720,
  },
  pageHeader: {
    marginBottom: 20,
    textAlign: "center",
  },
  pageTitle: {
    color: "#f1f5f9",
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  pageSubtitle: {
    color: "#64748b",
    fontSize: 13,
    margin: 0,
  },

  // Carousel
  carousel: {
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
    background: "#1e293b",
  },

  // Stage
  stage: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
    cursor: "pointer",
    userSelect: "none",
  },
  mainImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "opacity 0.22s ease",
  },
  gradientLeft: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 30%)",
    pointerEvents: "none",
  },
  gradientRight: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to left, rgba(0,0,0,0.35) 0%, transparent 30%)",
    pointerEvents: "none",
  },
  gradientBottom: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
    pointerEvents: "none",
  },

  // Caption
  caption: {
    position: "absolute",
    bottom: 48,
    left: 20,
    right: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "opacity 0.22s ease",
    pointerEvents: "none",
  },
  captionIndex: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    letterSpacing: 0.5,
    border: "1px solid rgba(255,255,255,0.2)",
  },
  captionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
  },

  // Pause badge
  pauseBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    gap: 5,
    letterSpacing: 0.3,
    border: "1px solid rgba(255,255,255,0.15)",
  },

  // Nav buttons
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
    zIndex: 2,
  },

  // Dots
  dots: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    zIndex: 2,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "width 0.3s ease, background 0.3s ease",
  },

  // Progress bar
  progressTrack: {
    height: 3,
    background: "#1e293b",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  // Thumbnails
  thumbRow: {
    display: "flex",
    gap: 8,
    padding: "12px 14px",
    overflowX: "auto",
    background: "#1e293b",
  },
  thumb: {
    position: "relative",
    flexShrink: 0,
    width: 80,
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "opacity 0.2s, outline 0.2s",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  thumbActive: {
    position: "absolute",
    inset: 0,
    background: "rgba(99,102,241,0.2)",
    borderRadius: 8,
  },
};