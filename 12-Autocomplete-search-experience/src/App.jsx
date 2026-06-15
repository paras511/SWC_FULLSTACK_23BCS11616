import { useState, useRef, useEffect, useCallback } from "react";

const ALL_SUGGESTIONS = [
  "react hooks tutorial",
  "react state management",
  "react router v6",
  "react context api",
  "react native vs flutter",
  "react performance optimization",
  "react testing library",
  "react useEffect cleanup",
  "javascript promises explained",
  "javascript async await",
  "javascript array methods",
  "javascript closure examples",
  "javascript event loop",
  "javascript map vs forEach",
  "javascript destructuring",
  "javascript spread operator",
  "typescript generics tutorial",
  "typescript vs javascript",
  "typescript interface vs type",
  "typescript utility types",
  "css flexbox guide",
  "css grid layout",
  "css animations tutorial",
  "css variables custom properties",
  "css responsive design",
  "how to center a div css",
  "node.js rest api tutorial",
  "node.js express framework",
  "python list comprehension",
  "python dictionary methods",
  "python decorators tutorial",
  "machine learning for beginners",
  "machine learning algorithms",
  "neural network explained",
  "deep learning tutorial",
  "git rebase vs merge",
  "git stash tutorial",
  "docker container tutorial",
  "kubernetes for beginners",
  "sql join types explained",
  "mongodb vs postgresql",
  "system design interview",
  "big o notation explained",
  "binary search tree",
  "dynamic programming tutorial",
  "web accessibility guidelines",
  "progressive web apps tutorial",
  "next.js app router",
  "tailwind css tutorial",
  "vite vs webpack",
];

function highlightMatch(text, query) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span style={styles.matchHighlight}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // Filter suggestions when query changes
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    const filtered = ALL_SUGGESTIONS
      .filter((s) => s.includes(q))
      .slice(0, 8);
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setActiveIndex(-1);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const selectSuggestion = useCallback((text) => {
    setQuery(text);
    setSelected(text);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen && e.key !== "Escape") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? -1 : prev - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          selectSuggestion(suggestions[activeIndex]);
        } else if (query.trim()) {
          setSelected(query.trim());
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const displayQuery = activeIndex >= 0 ? suggestions[activeIndex] : query;

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={{ color: "#4285F4" }}>G</span>
          <span style={{ color: "#EA4335" }}>o</span>
          <span style={{ color: "#FBBC05" }}>o</span>
          <span style={{ color: "#4285F4" }}>g</span>
          <span style={{ color: "#34A853" }}>l</span>
          <span style={{ color: "#EA4335" }}>e</span>
        </div>

        {/* Search Box */}
        <div style={styles.searchBox}>
          <div
            style={{
              ...styles.inputWrap,
              borderRadius: isOpen && suggestions.length > 0 ? "24px 24px 0 0" : 24,
              boxShadow: isOpen
                ? "0 1px 6px rgba(32,33,36,.28)"
                : "0 2px 8px rgba(32,33,36,.18)",
            }}
          >
            {/* Search Icon */}
            <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#9aa0a6" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <input
              ref={inputRef}
              value={displayQuery}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setIsOpen(true);
              }}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              placeholder="Search the web"
              style={styles.input}
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="list"
              aria-controls="suggestion-list"
              aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            />

            {/* Clear button */}
            {query && (
              <button onClick={handleClear} style={styles.clearBtn} tabIndex={-1}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#70757a">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}

            {/* Divider + Mic */}
            {query && <div style={styles.divider} />}
            <button style={styles.micBtn} tabIndex={-1}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#4285F4">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
            </button>
          </div>

          {/* Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <ul
              id="suggestion-list"
              ref={listRef}
              style={styles.dropdown}
              role="listbox"
            >
              <div style={styles.dropdownDivider} />
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  id={`suggestion-${i}`}
                  ref={(el) => (itemRefs.current[i] = el)}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  onMouseDown={() => selectSuggestion(s)}
                  style={{
                    ...styles.suggestionItem,
                    background: i === activeIndex ? "#f8f9fa" : "transparent",
                  }}
                >
                  {/* Search icon */}
                  <svg style={styles.suggItemIcon} viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="#bec1c7" strokeWidth="2" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#bec1c7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span style={styles.suggText}>{highlightMatch(s, query)}</span>
                  {/* Arrow icon (restore to input) */}
                  <svg
                    style={styles.arrowIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M18 13l-6-6-6 6" stroke="#bec1c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(135 12 12)" />
                  </svg>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Keyboard hint */}
        <div style={styles.hint}>
          <kbd style={styles.kbd}>↑</kbd>
          <kbd style={styles.kbd}>↓</kbd> navigate &nbsp;·&nbsp;
          <kbd style={styles.kbd}>Enter</kbd> select &nbsp;·&nbsp;
          <kbd style={styles.kbd}>Esc</kbd> close
        </div>

        {/* Selected result */}
        {selected && (
          <div style={styles.resultCard}>
            <div style={styles.resultLabel}>You searched for</div>
            <div style={styles.resultQuery}>"{selected}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 80,
    fontFamily: "arial, sans-serif",
  },
  wrapper: {
    width: "100%",
    maxWidth: 584,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 16px",
  },
  logo: {
    fontSize: 72,
    fontWeight: 400,
    letterSpacing: -2,
    marginBottom: 28,
    lineHeight: 1,
    fontFamily: "'Product Sans', arial, sans-serif",
  },
  searchBox: {
    width: "100%",
    position: "relative",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dfe1e5",
    background: "#fff",
    padding: "6px 14px",
    gap: 10,
    transition: "border-radius 0.1s",
    position: "relative",
    zIndex: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 16,
    color: "#202124",
    background: "transparent",
    padding: "6px 0",
    lineHeight: 1.5,
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    borderRadius: "50%",
  },
  divider: {
    width: 1,
    height: 28,
    background: "#dfe1e5",
    flexShrink: 0,
  },
  micBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    borderRadius: "50%",
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #dfe1e5",
    borderTop: "none",
    borderRadius: "0 0 24px 24px",
    boxShadow: "0 4px 6px rgba(32,33,36,.28)",
    listStyle: "none",
    margin: 0,
    padding: "0 0 8px",
    zIndex: 1,
    overflow: "hidden",
  },
  dropdownDivider: {
    height: 1,
    background: "#e8eaed",
    margin: "0 14px 8px",
  },
  suggestionItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 14px",
    cursor: "pointer",
    transition: "background 0.1s",
    userSelect: "none",
  },
  suggItemIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
  },
  suggText: {
    flex: 1,
    fontSize: 16,
    color: "#202124",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  matchHighlight: {
    fontWeight: 700,
    color: "#202124",
  },
  arrowIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
    opacity: 0.6,
  },
  hint: {
    marginTop: 16,
    color: "#70757a",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  kbd: {
    background: "#f1f3f4",
    border: "1px solid #dadce0",
    borderRadius: 4,
    padding: "1px 5px",
    fontSize: 12,
    color: "#5f6368",
    fontFamily: "monospace",
  },
  resultCard: {
    marginTop: 40,
    padding: "20px 24px",
    border: "1px solid #e8eaed",
    borderRadius: 12,
    width: "100%",
    boxSizing: "border-box",
    background: "#f8f9fa",
    textAlign: "center",
  },
  resultLabel: {
    fontSize: 13,
    color: "#70757a",
    marginBottom: 6,
  },
  resultQuery: {
    fontSize: 20,
    color: "#202124",
    fontWeight: 500,
  },
};