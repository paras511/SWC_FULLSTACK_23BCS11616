import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   FAKE DATA
   ══════════════════════════════════════════════════════════════ */
const AUTHORS = [
  { name: "Sarah Chen",    title: "Senior Engineer @ Meta",        initials: "SC", color: "#4f46e5" },
  { name: "Marcus Webb",   title: "Product Designer @ Figma",      initials: "MW", color: "#0891b2" },
  { name: "Priya Nair",    title: "CTO @ Vercel",                  initials: "PN", color: "#7c3aed" },
  { name: "James Okafor",  title: "ML Researcher @ DeepMind",      initials: "JO", color: "#b45309" },
  { name: "Elena Russo",   title: "Frontend Lead @ Stripe",        initials: "ER", color: "#047857" },
  { name: "David Kim",     title: "Founder @ BuildFast",           initials: "DK", color: "#be185d" },
  { name: "Aisha Patel",   title: "Staff Engineer @ Shopify",      initials: "AP", color: "#0e7490" },
  { name: "Tom Larsen",    title: "VP Engineering @ Notion",       initials: "TL", color: "#c2410c" },
];

const SNIPPETS = [
  "After 3 years, I'm finally shipping something I'm genuinely proud of. The hardest part wasn't the code — it was learning to say no to features that didn't matter.",
  "Hot take: code reviews are more about culture than correctness. The comments you leave tell your team exactly what you value.",
  "Just finished a 6-month refactor. 40,000 lines deleted. The app is faster, the team is happier, and nobody can tell from the outside. That's the job.",
  "Reminder: 'move fast and break things' was never about breaking your users' trust. Speed and care aren't opposites.",
  "We ran an A/B test expecting a 5% lift. Got 47%. Sometimes you genuinely don't know what's going to work until you ship it.",
  "The most underrated skill in engineering: writing the sentence that explains *why* a decision was made, not just what it was.",
  "Interviewing 100 users taught me more about our product than 2 years of looking at analytics. Numbers tell you what; people tell you why.",
  "Unpopular opinion: the best engineers I've worked with were also the best writers. Clarity of thought shows up everywhere.",
  "Our on-call rotation used to be dreaded. One year later — zero P0 incidents. Here's what changed: we treated every alert as a product failure, not an ops problem.",
  "Spent a day pair-programming with a junior engineer. Walked away having learned more than they did. Teaching is the best learning.",
  "We deprecated a feature that 200 users relied on. Sent personal emails to every one of them. Three became our biggest enterprise customers.",
  "System design interview prep made me a better engineer, not because of the answers — because of the questions it taught me to ask upfront.",
];

const TIMES = [
  "2m ago", "11m ago", "34m ago", "1h ago", "2h ago",
  "3h ago", "5h ago", "8h ago", "12h ago", "1d ago",
];

const TAGS = ["#engineering", "#product", "#design", "#startups", "#leadership", "#webdev", "#career", "#ux"];

let _id = 0;
function makePosts(count = 7) {
  return Array.from({ length: count }, () => {
    const author = AUTHORS[_id % AUTHORS.length];
    const post = {
      id: ++_id,
      author,
      time: TIMES[_id % TIMES.length],
      content: SNIPPETS[_id % SNIPPETS.length],
      tag: TAGS[_id % TAGS.length],
      likes: 40 + Math.floor(Math.random() * 960),
      comments: 4 + Math.floor(Math.random() * 80),
      reposts: 2 + Math.floor(Math.random() * 40),
    };
    return post;
  });
}

/** Simulated API — resolves after 1.2 s */
function apiFetch() {
  return new Promise((resolve) => setTimeout(() => resolve(makePosts(7)), 1200));
}

/* ══════════════════════════════════════════════════════════════
   SKELETON CARD
   ══════════════════════════════════════════════════════════════ */
const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
`;

function Skeleton() {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e9eaf0", padding: "20px 20px 16px",
    }}>
      <style>{shimmer}</style>
      {[
        { w: "42%", h: 12, mb: 10, mt: 0 },
        { w: "28%", h: 10, mb: 18, mt: 0 },
        { w: "100%", h: 11, mb: 7,  mt: 0 },
        { w: "90%",  h: 11, mb: 7,  mt: 0 },
        { w: "65%",  h: 11, mb: 18, mt: 0 },
        { w: "35%",  h: 10, mb: 0,  mt: 0 },
      ].map((bar, i) => (
        <div key={i} style={{
          width: bar.w, height: bar.h,
          marginBottom: bar.mb, marginTop: bar.mt,
          borderRadius: 6,
          background: "linear-gradient(90deg, #f0f2f5 0px, #e4e6ea 150px, #f0f2f5 300px)",
          backgroundSize: "600px 100%",
          animation: "shimmer 1.4s infinite linear",
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   POST CARD
   ══════════════════════════════════════════════════════════════ */
function fmtNum(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = () => {
    setLiked((p) => !p);
    setLikes((n) => liked ? n - 1 : n + 1);
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e9eaf0",
      padding: "20px 20px 14px",
      transition: "box-shadow 0.18s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: post.author.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "monospace",
          letterSpacing: "0.03em",
        }}>
          {post.author.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 700, color: "#0f172a",
            margin: 0, fontFamily: "'Georgia', serif",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {post.author.name}
          </p>
          <p style={{
            fontSize: 11.5, color: "#64748b", margin: "2px 0 0",
            fontFamily: "monospace",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {post.author.title}
          </p>
        </div>
        <span style={{
          fontSize: 11, color: "#94a3b8", fontFamily: "monospace",
          flexShrink: 0,
        }}>
          {post.time}
        </span>
      </div>

      {/* Content */}
      <p style={{
        fontSize: 14, color: "#1e293b", lineHeight: 1.65,
        margin: "0 0 12px", fontFamily: "'Georgia', serif",
      }}>
        {post.content}
      </p>

      {/* Tag */}
      <span style={{
        fontSize: 11.5, color: "#4f46e5", fontFamily: "monospace",
        fontWeight: 600,
      }}>
        {post.tag}
      </span>

      {/* Divider */}
      <div style={{ height: 1, background: "#f1f5f9", margin: "12px 0 10px" }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 4 }}>
        {[
          {
            icon: liked ? "♥" : "♡",
            label: fmtNum(likes),
            color: liked ? "#e11d48" : "#64748b",
            onClick: toggleLike,
          },
          { icon: "◇", label: fmtNum(post.comments), color: "#64748b" },
          { icon: "↗", label: fmtNum(post.reposts),  color: "#64748b" },
        ].map(({ icon, label, color, onClick }) => (
          <button key={label + icon}
            onClick={onClick}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              padding: "5px 10px", borderRadius: 6,
              fontSize: 12, color, fontFamily: "monospace", fontWeight: 600,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <span style={{ fontSize: 14 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOADER DOTS
   ══════════════════════════════════════════════════════════════ */
function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "20px 0" }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
      `}</style>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#4f46e5",
          animation: `bounce 1.2s infinite ease-in-out`,
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEED
   ══════════════════════════════════════════════════════════════ */
const MAX_PAGES = 6; // stop after ~42 posts

export default function Feed() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initial, setInitial] = useState(true); // first load → show skeletons

  /* Refs prevent stale closure issues and duplicate fetches */
  const loadingRef = useRef(false);
  const pageRef    = useRef(0);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    /* ── Guard: block if already fetching or exhausted ── */
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const newPosts = await apiFetch();

    setPosts((prev) => [...prev, ...newPosts]);
    pageRef.current += 1;
    loadingRef.current = false;
    setLoading(false);
    setInitial(false);

    if (pageRef.current >= MAX_PAGES) {
      hasMoreRef.current = false;
      setHasMore(false);
    }
  }, []); // ← stable: all mutable state lives in refs

  /* Initial fetch */
  useEffect(() => { loadMore(); }, [loadMore]);

  /* IntersectionObserver on sentinel div at bottom */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" } // trigger 200px before it's visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f7",
      padding: "28px 16px 60px",
      fontFamily: "'Georgia', serif",
    }}>

      {/* Header */}
      <div style={{ maxWidth: 600, margin: "0 auto 24px" }}>
        <h1 style={{
          fontSize: 20, fontWeight: 700, color: "#0f172a",
          margin: 0, letterSpacing: "-0.02em",
        }}>
          Your Feed
        </h1>
        <p style={{
          fontSize: 11.5, color: "#94a3b8", marginTop: 4,
          fontFamily: "monospace",
        }}>
          Infinite scroll · single IntersectionObserver · duplicate-fetch guard
        </p>
      </div>

      {/* Post list */}
      <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Skeleton placeholders during initial load */}
        {initial && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}

        {/* Real posts */}
        {posts.map((post) => <PostCard key={post.id} post={post} />)}

        {/* Bottom loader (subsequent pages) */}
        {loading && !initial && <Loader />}

        {/* End of feed */}
        {!hasMore && (
          <div style={{
            textAlign: "center", padding: "24px 0",
            fontSize: 12, color: "#94a3b8", fontFamily: "monospace",
          }}>
            ── you're all caught up ──
          </div>
        )}

        {/* Sentinel: invisible div watched by IntersectionObserver */}
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />
      </div>
    </div>
  );
}