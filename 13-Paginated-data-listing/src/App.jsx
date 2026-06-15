import { useState } from "react";

const PRODUCTS = Array.from({ length: 73 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  category: ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports"][i % 5],
  price: (Math.random() * 4900 + 99).toFixed(2),
  rating: (Math.random() * 2 + 3).toFixed(1),
  reviews: Math.floor(Math.random() * 4000 + 20),
  badge: i % 7 === 0 ? "Best Seller" : i % 11 === 0 ? "New" : null,
}));

const ITEMS_PER_PAGE = 10;

const stars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return Array.from({ length: 5 }, (_, i) =>
    i < full ? "★" : i === full && half ? "½" : "☆"
  ).join("");
};

const categoryColors = {
  Electronics: "#3b82f6",
  Clothing: "#ec4899",
  Books: "#f59e0b",
  "Home & Kitchen": "#10b981",
  Sports: "#8b5cf6",
};

export default function PaginatedListing() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = PRODUCTS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>All Products</h1>
          <p style={styles.subtitle}>
            Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, PRODUCTS.length)} of{" "}
            <strong>{PRODUCTS.length}</strong> results
          </p>
        </div>
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Sort by:</span>
          <select style={styles.select}>
            <option>Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Avg. Customer Review</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div style={styles.list}>
        {currentItems.map((product, idx) => (
          <div key={product.id} style={styles.card}>
            {/* Thumbnail */}
            <div style={styles.thumb}>
              <div
                style={{
                  ...styles.thumbInner,
                  background: `hsl(${(product.id * 37) % 360}, 60%, 88%)`,
                }}
              >
                <span style={styles.thumbIcon}>
                  {["📱", "👕", "📚", "🍳", "🏋️"][product.id % 5]}
                </span>
              </div>
              {product.badge && (
                <span
                  style={{
                    ...styles.badge,
                    background: product.badge === "New" ? "#10b981" : "#f59e0b",
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={styles.info}>
              <div style={styles.topRow}>
                <span
                  style={{
                    ...styles.category,
                    background: categoryColors[product.category] + "18",
                    color: categoryColors[product.category],
                  }}
                >
                  {product.category}
                </span>
                <span style={styles.itemNum}>#{startIndex + idx + 1}</span>
              </div>
              <p style={styles.productName}>{product.name}</p>
              <div style={styles.ratingRow}>
                <span style={styles.stars}>{stars(parseFloat(product.rating))}</span>
                <span style={styles.ratingVal}>{product.rating}</span>
                <span style={styles.reviews}>({product.reviews.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Price & Action */}
            <div style={styles.priceCol}>
              <p style={styles.price}>₹{parseFloat(product.price).toLocaleString("en-IN")}</p>
              <p style={styles.freeShip}>FREE Delivery</p>
              <button style={styles.addBtn}>Add to Cart</button>
              <button style={styles.wishBtn}>♡ Wishlist</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          style={{ ...styles.navBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>

        <div style={styles.pageNumbers}>
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} style={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goTo(page)}
                style={{
                  ...styles.pageBtn,
                  ...(page === currentPage ? styles.activePage : {}),
                }}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          style={{ ...styles.navBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>

      <p style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: 900,
    margin: "0 auto",
    padding: "24px 16px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#1a202c",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6b7280",
  },
  sortRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  select: {
    fontSize: 13,
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    display: "flex",
    gap: 16,
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    alignItems: "center",
    transition: "box-shadow 0.2s",
  },
  thumb: {
    position: "relative",
    flexShrink: 0,
  },
  thumbInner: {
    width: 72,
    height: 72,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbIcon: {
    fontSize: 32,
  },
  badge: {
    position: "absolute",
    top: -6,
    left: -6,
    fontSize: 9,
    fontWeight: 700,
    color: "#fff",
    padding: "2px 5px",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  category: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  itemNum: {
    fontSize: 11,
    color: "#9ca3af",
  },
  productName: {
    margin: "2px 0 6px",
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  stars: {
    color: "#f59e0b",
    fontSize: 13,
    letterSpacing: 1,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  reviews: {
    fontSize: 12,
    color: "#9ca3af",
  },
  priceCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
    minWidth: 120,
  },
  price: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#1a202c",
  },
  freeShip: {
    margin: 0,
    fontSize: 11,
    color: "#10b981",
    fontWeight: 500,
  },
  addBtn: {
    marginTop: 4,
    padding: "7px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  wishBtn: {
    padding: "5px 14px",
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
    width: "100%",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    flexWrap: "wrap",
  },
  navBtn: {
    padding: "8px 18px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: "#374151",
    transition: "all 0.15s",
  },
  pageNumbers: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pageBtn: {
    width: 36,
    height: 36,
    border: "1px solid #e5e7eb",
    borderRadius: 7,
    background: "#fff",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  activePage: {
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "#fff",
    fontWeight: 700,
  },
  ellipsis: {
    fontSize: 14,
    color: "#9ca3af",
    padding: "0 4px",
  },
  pageInfo: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 10,
  },
};