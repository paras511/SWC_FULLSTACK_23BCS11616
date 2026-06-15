import { useState, useRef, useCallback } from "react";

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .gif, .svg";

export default function ImageUploadPreview() {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = (file) => {
    setError("");
    setUploaded(false);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`❌ Invalid file type. Only images are allowed (JPG, PNG, WEBP, GIF, SVG).`);
      setPreview(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`❌ File too large. Max size is ${MAX_SIZE_MB}MB. Your file is ${formatSize(file.size)}.`);
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setFileName(file.name);
      setFileSize(formatSize(file.size));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleUpload = () => {
    if (!preview) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1800);
  };

  const handleReset = () => {
    setPreview(null);
    setFileName("");
    setFileSize("");
    setError("");
    setUploaded(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.avatar}>📸</div>
          <div>
            <h2 style={s.title}>Upload Photo</h2>
            <p style={s.subtitle}>JPG, PNG, WEBP, GIF or SVG · Max {MAX_SIZE_MB}MB</p>
          </div>
        </div>

        {/* Drop Zone */}
        {!preview && (
          <div
            style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
            onClick={() => inputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div style={s.dropIcon}>{dragging ? "📂" : "🖼️"}</div>
            <p style={s.dropTitle}>{dragging ? "Drop it here!" : "Drag & drop your image"}</p>
            <p style={s.dropOr}>or</p>
            <button style={s.browseBtn} onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
              Browse Files
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={s.errorBox}>
            <span>{error}</span>
            <button style={s.errorClose} onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div style={s.previewSection}>
            <div style={s.previewWrapper}>
              <img src={preview} alt="Preview" style={s.previewImg} />
              {uploaded && (
                <div style={s.uploadedOverlay}>
                  <span style={s.checkMark}>✓</span>
                </div>
              )}
              <button style={s.removeBtn} onClick={handleReset} title="Remove">✕</button>
            </div>

            <div style={s.fileMeta}>
              <div style={s.metaRow}>
                <span style={s.metaLabel}>File name</span>
                <span style={s.metaValue}>{fileName}</span>
              </div>
              <div style={s.metaRow}>
                <span style={s.metaLabel}>Size</span>
                <span style={s.metaValue}>{fileSize}</span>
              </div>
              <div style={s.metaRow}>
                <span style={s.metaLabel}>Status</span>
                <span style={{ ...s.metaValue, color: uploaded ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
                  {uploaded ? "✓ Uploaded" : "Ready to upload"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={s.actions}>
              <button style={s.changeBtn} onClick={() => inputRef.current.click()}>
                🔄 Change Photo
              </button>
              {!uploaded ? (
                <button
                  style={{ ...s.uploadBtn, opacity: uploading ? 0.7 : 1 }}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              ) : (
                <button style={s.resetBtn} onClick={handleReset}>
                  Upload Another
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Hints */}
      <div style={s.hints}>
        <span style={s.hint}>✔ Only image files accepted</span>
        <span style={s.hint}>✔ Max size: {MAX_SIZE_MB}MB</span>
        <span style={s.hint}>✔ Drag & drop supported</span>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  avatar: {
    width: 52,
    height: 52,
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#9ca3af",
  },
  dropZone: {
    border: "2px dashed #d1d5db",
    borderRadius: 14,
    padding: "40px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#fafafa",
  },
  dropZoneActive: {
    borderColor: "#667eea",
    background: "#f0f0ff",
    transform: "scale(1.01)",
  },
  dropIcon: { fontSize: 48, marginBottom: 12 },
  dropTitle: { margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#374151" },
  dropOr: { margin: "0 0 14px", fontSize: 13, color: "#9ca3af" },
  browseBtn: {
    padding: "9px 22px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "12px 14px",
    marginTop: 16,
    fontSize: 13,
    color: "#dc2626",
    gap: 10,
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  previewSection: { marginTop: 4 },
  previewWrapper: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    background: "#f3f4f6",
    maxHeight: 260,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: {
    width: "100%",
    maxHeight: 260,
    objectFit: "contain",
    display: "block",
  },
  uploadedOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(16,185,129,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 60,
    color: "#fff",
    fontWeight: 700,
    textShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    border: "none",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  fileMeta: {
    background: "#f9fafb",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
  },
  metaLabel: { color: "#9ca3af" },
  metaValue: {
    color: "#374151",
    fontWeight: 500,
    maxWidth: "60%",
    textAlign: "right",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  changeBtn: {
    flex: 1,
    padding: "10px 0",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  uploadBtn: {
    flex: 2,
    padding: "10px 0",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  resetBtn: {
    flex: 2,
    padding: "10px 0",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  hints: {
    display: "flex",
    gap: 16,
    marginTop: 18,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  hint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
};