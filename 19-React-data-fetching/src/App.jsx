import { useState, useEffect, useCallback } from "react";

const API_URL = "https://fakestoreapi.com/products";

const CATEGORIES = ["all", "electronics", "jewelery", "men's clothing", "women's clothing"];

function SkeletonCard() {
  return (
    <div style={s.card}>
      <div style={{ ...s.skeleton, height: 160, borderRadius: 10, marginBottom: 12 }} />
      <div style={{ ...s.skeleton, height: 12, width: "60%", marginBottom: 8 }} />
      <div style={{ ...s.skeleton, height: 14, width: "90%", marginBottom: 6 }} />
      <div style={{ ...s.skeleton, height: 14, width: "75%", marginBottom: 14 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ ...s.skeleton, height: 18, width: "35%" }} />
        <div style={{ ...s.skeleton, height: 32, width: "40%", borderRadius: 8 }} />
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: 12 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function ProductCard({ product }) {
  return (
    <div style={s.card}>
      <div style={s.imgWrap}>
        <img src={product.image} alt={product.title} style={s.img} loading="lazy" />
      </div>
      <span style={s.catBadge}>{product.category}</span>
      <p style={s.productTitle}>{product.title}</p>
      <div style={s.ratingRow}>
        <Stars rating={product.rating.rate} />
        <span style={s.ratingCount}>({product.rating.count})</span>
      </div>
      <div style={s.cardFooter}>
        <span style={s.price}>${product.price.toFixed(2)}</span>
        <button style={s.addBtn}>Add to Cart</button>
      </div>
    </div>
  );
}

export default function DataFetchingUI() {
  const [products, setProducts] = useState([]);
  const [status, setStatus]     = useState("idle");   // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");

  const fetchProducts = useCallback(async (forceError = false) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      if (forceError) throw new Error("Network request failed. Please check your connection.");
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setProducts(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const visible = products.filter((p) => {
    const matchCat  = category === "all" || p.category === category;
    const matchSrch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <div>
          <h1 style={s.heading}>Product Catalogue</h1>
          {status === "success" && (
            <p style={s.resultCount}>{visible.length} of {products.length} products</p>
          )}
        </div>
        <button style={s.errorSimBtn} onClick={() => fetchProducts(true)}>
          Simulate Error
        </button>
      </div>

      {/* Filters */}
      {status === "success" && (
        <div style={s.filterRow}>
          <input
            style={s.searchInput}
            placeholder="🔍  Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.tabs}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{ ...s.tab, ...(category === c ? s.activeTab : {}) }}
              >
                {c === "all" ? "All" : c.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <div style={s.grid}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div style={s.errorBox}>
          <div style={s.errorIcon}>⚠️</div>
          <h2 style={s.errorTitle}>Something went wrong</h2>
          <p style={s.errorDesc}>{errorMsg}</p>
          <button style={s.retryBtn} onClick={() => fetchProducts()}>
            ↺ Retry
          </button>
        </div>
      )}

      {/* Success — results */}
      {status === "success" && visible.length > 0 && (
        <div style={s.grid}>
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Success — empty */}
      {status === "success" && visible.length === 0 && (
        <div style={s.emptyBox}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={s.emptyTitle}>No products match your search</p>
          <p style={s.emptyDesc}>Try a different keyword or category.</p>
          <button style={s.retryBtn} onClick={() => { setSearch(""); setCategory("all"); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

const ANIM = `
  @keyframes shimmer {
    0%   { background-position: -400px 0 }
    100% { background-position:  400px 0 }
  }
`;

const s = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    padding: "24px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  heading: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  resultCount: { fontSize: 13, color: "#6b7280", marginTop: 3 },
  errorSimBtn: {
    fontSize: 12, padding: "7px 14px",
    background: "#fee2e2", color: "#dc2626",
    border: "1px solid #fecaca", borderRadius: 8,
    cursor: "pointer", fontWeight: 600,
  },
  filterRow: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
  },
  searchInput: {
    padding: "10px 14px",
    fontSize: 14,
    border: "1.5px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    color: "#111827",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  tab: {
    padding: "6px 14px", fontSize: 12, fontWeight: 500,
    border: "1px solid #e5e7eb", borderRadius: 20,
    background: "#fff", color: "#6b7280", cursor: "pointer",
    transition: "all 0.15s",
  },
  activeTab: {
    background: "#2563eb", color: "#fff",
    borderColor: "#2563eb", fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  imgWrap: {
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    padding: 12,
  },
  img: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" },
  catBadge: {
    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
    color: "#6b7280", letterSpacing: "0.5px", marginBottom: 6,
  },
  productTitle: {
    fontSize: 13, color: "#111827", fontWeight: 500,
    lineHeight: 1.45, marginBottom: 8,
    display: "-webkit-box", WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical", overflow: "hidden",
    flex: 1,
  },
  ratingRow: { display: "flex", alignItems: "center", gap: 5, marginBottom: 12 },
  ratingCount: { fontSize: 11, color: "#9ca3af" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 16, fontWeight: 700, color: "#111827" },
  addBtn: {
    padding: "6px 12px", fontSize: 12, fontWeight: 600,
    background: "#2563eb", color: "#fff",
    border: "none", borderRadius: 7, cursor: "pointer",
  },
  skeleton: {
    background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.4s infinite linear",
    borderRadius: 6,
  },
  errorBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: 320, textAlign: "center",
    background: "#fff", borderRadius: 16, padding: 40,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  errorIcon:  { fontSize: 52, marginBottom: 14 },
  errorTitle: { fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 },
  errorDesc:  { fontSize: 14, color: "#6b7280", marginBottom: 24, maxWidth: 340 },
  retryBtn: {
    padding: "10px 24px", background: "#2563eb", color: "#fff",
    border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  emptyBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: 280, textAlign: "center",
    background: "#fff", borderRadius: 16, padding: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: 600, color: "#374151", marginBottom: 6 },
  emptyDesc:  { fontSize: 13, color: "#9ca3af", marginBottom: 20 },
};