import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ── Data ─────────────────────────────────────────────────────── */
const monthlyData = [
  { month: "Jan", revenue: 42, users: 8.2 },
  { month: "Feb", revenue: 38, users: 7.8 },
  { month: "Mar", revenue: 51, users: 9.4 },
  { month: "Apr", revenue: 47, users: 10.2 },
  { month: "May", revenue: 53, users: 11.0 },
  { month: "Jun", revenue: 61, users: 12.4 },
  { month: "Jul", revenue: 58, users: 11.8 },
  { month: "Aug", revenue: 67, users: 13.2 },
  { month: "Sep", revenue: 72, users: 14.1 },
  { month: "Oct", revenue: 69, users: 13.6 },
  { month: "Nov", revenue: 78, users: 15.2 },
  { month: "Dec", revenue: 84, users: 16.8 },
];

const trafficData = [
  { source: "Organic Search", pct: 38, color: "#34d399" },
  { source: "Paid Ads",       pct: 24, color: "#60a5fa" },
  { source: "Social Media",   pct: 19, color: "#a78bfa" },
  { source: "Direct",         pct: 13, color: "#fbbf24" },
  { source: "Referral",       pct:  6, color: "#f87171" },
];

const transactions = [
  { id: "ORD-7291", customer: "Sarah Chen",    product: "Enterprise", amount: 1200, status: "completed", date: "Jun 5, 2026" },
  { id: "ORD-7290", customer: "Marcus Webb",   product: "Pro Plan",   amount:  299, status: "completed", date: "Jun 5, 2026" },
  { id: "ORD-7289", customer: "Priya Nair",    product: "Starter",    amount:   49, status: "pending",   date: "Jun 4, 2026" },
  { id: "ORD-7288", customer: "James Okafor",  product: "Pro Plan",   amount:  299, status: "completed", date: "Jun 4, 2026" },
  { id: "ORD-7287", customer: "Elena Russo",   product: "Enterprise", amount: 1200, status: "failed",    date: "Jun 3, 2026" },
  { id: "ORD-7286", customer: "David Kim",     product: "Pro Plan",   amount:  299, status: "completed", date: "Jun 3, 2026" },
  { id: "ORD-7285", customer: "Aisha Patel",   product: "Starter",    amount:   49, status: "pending",   date: "Jun 2, 2026" },
  { id: "ORD-7284", customer: "Tom Larsen",    product: "Enterprise", amount: 1200, status: "completed", date: "Jun 2, 2026" },
];

const KPIS = [
  { label: "Total Revenue",    value: "$248,392", change: +12.5, sub: "vs last month",  accent: "#34d399" },
  { label: "Active Users",     value: "14,832",   change: +8.2,  sub: "vs last month",  accent: "#60a5fa" },
  { label: "Conversion Rate",  value: "3.64%",    change: -0.8,  sub: "vs last month",  accent: "#f87171" },
  { label: "Avg Order Value",  value: "$94.20",   change: +5.1,  sub: "vs last month",  accent: "#fbbf24" },
];

/* ── Tooltip ──────────────────────────────────────────────────── */
function ChartTip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f1a2e", border: "1px solid #1e3a5f",
      borderRadius: 8, padding: "10px 14px",
    }}>
      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontFamily: "monospace" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ fontSize: 13, fontWeight: 700, color: p.color, fontFamily: "monospace" }}>
          {prefix}{p.value}{suffix}
        </p>
      ))}
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────── */
const STATUS = {
  completed: { bg: "#052e16", color: "#4ade80", dot: "#22c55e", label: "Completed" },
  pending:   { bg: "#1c1700", color: "#facc15", dot: "#eab308", label: "Pending"   },
  failed:    { bg: "#2d0a0a", color: "#f87171", dot: "#ef4444", label: "Failed"    },
};
function Badge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      padding: "3px 10px", borderRadius: 20, fontFamily: "monospace",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ kpi }) {
  const up = kpi.change >= 0;
  return (
    <div style={{
      background: "#0b1221",
      border: "1px solid #1a2744",
      borderRadius: 12,
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: 3,
        background: `linear-gradient(90deg, ${kpi.accent}99, transparent)`,
      }} />
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#475569", fontFamily: "monospace", textTransform: "uppercase" }}>
        {kpi.label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em", fontFamily: "'Georgia', serif" }}>
        {kpi.value}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontSize: 11.5, fontWeight: 700, fontFamily: "monospace",
          color: up ? "#34d399" : "#f87171",
          background: up ? "#052e16" : "#2d0a0a",
          padding: "2px 8px", borderRadius: 12,
        }}>
          {up ? "▲" : "▼"} {Math.abs(kpi.change)}%
        </span>
        <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>{kpi.sub}</span>
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const COLS = [
    { key: "id",       label: "Order ID"  },
    { key: "customer", label: "Customer"  },
    { key: "product",  label: "Product"   },
    { key: "amount",   label: "Amount"    },
    { key: "status",   label: "Status"    },
    { key: "date",     label: "Date"      },
  ];

  const sorted = [...transactions].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === "amount") return sortDir === "asc" ? va - vb : vb - va;
    return sortDir === "asc"
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

  const handleSort = (key) => {
    if (sortField === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(key); setSortDir("asc"); }
  };

  const S = {
    root: {
      minHeight: "100vh",
      background: "#070c18",
      color: "#e2e8f0",
      padding: "28px 20px 48px",
      fontFamily: "'Georgia', serif",
    },
    wrap: { maxWidth: 1180, margin: "0 auto" },
    // header
    header: {
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap",
      gap: 12, marginBottom: 32,
    },
    title: { fontSize: 22, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" },
    badge: {
      fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em",
      background: "#0f2744", color: "#60a5fa",
      border: "1px solid #1e3a5f",
      padding: "5px 14px", borderRadius: 20,
    },
    // KPI grid
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      gap: 14, marginBottom: 24,
    },
    // chart row
    chartRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: 14, marginBottom: 24,
    },
    panel: {
      background: "#0b1221", border: "1px solid #1a2744",
      borderRadius: 12, padding: "20px 22px",
    },
    panelTitle: {
      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#475569",
      fontFamily: "monospace", marginBottom: 20,
    },
    // table
    tableWrap: {
      background: "#0b1221", border: "1px solid #1a2744",
      borderRadius: 12, overflow: "hidden",
    },
    tableHeader: {
      fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "#475569", fontFamily: "monospace",
    },
    th: {
      padding: "13px 16px", textAlign: "left",
      background: "#0d1628", borderBottom: "1px solid #1a2744",
      cursor: "pointer", whiteSpace: "nowrap",
      userSelect: "none",
    },
    td: {
      padding: "13px 16px", borderBottom: "1px solid #111e35",
      fontSize: 13, color: "#94a3b8",
      fontFamily: "monospace",
    },
  };

  return (
    <div style={S.root}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Analytics</h1>
            <p style={{ fontSize: 12, color: "#334155", fontFamily: "monospace", marginTop: 3 }}>
              Jun 2026 · Updated just now
            </p>
          </div>
          <span style={S.badge}>LIVE</span>
        </div>

        {/* KPI Grid */}
        <div style={S.kpiGrid}>
          {KPIS.map(k => <KpiCard key={k.label} kpi={k} />)}
        </div>

        {/* Charts row */}
        <div style={S.chartRow}>

          {/* Revenue area chart */}
          <div style={S.panel}>
            <p style={S.panelTitle}>Revenue & Users (K) — 2026</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="usr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a2744" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip prefix="$" suffix="K" />} cursor={{ stroke: "#1e3a5f" }}/>
                <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} fill="url(#rev)" dot={false}/>
                <Area type="monotone" dataKey="users"   stroke="#60a5fa" strokeWidth={2} fill="url(#usr)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
              {[["#34d399","Revenue"],["#60a5fa","Users"]].map(([c,l]) => (
                <span key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#475569", fontFamily:"monospace" }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:c }}/>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Traffic sources */}
          <div style={S.panel}>
            <p style={S.panelTitle}>Traffic Sources</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 4 }}>
              {trafficData.map(t => (
                <div key={t.source}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 5 }}>
                    <span style={{ fontSize:12, color:"#94a3b8", fontFamily:"monospace" }}>{t.source}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:t.color, fontFamily:"monospace" }}>{t.pct}%</span>
                  </div>
                  <div style={{ height:5, background:"#1a2744", borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", width:`${t.pct}%`,
                      background: t.color,
                      borderRadius:4,
                      transition:"width 0.6s ease",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Transactions table */}
        <div style={S.tableWrap}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #1a2744", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ ...S.panelTitle, marginBottom:0 }}>Recent Transactions</p>
            <span style={{ fontSize:11, color:"#334155", fontFamily:"monospace" }}>{transactions.length} orders</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth: 580 }}>
              <thead>
                <tr style={S.tableHeader}>
                  {COLS.map(c => (
                    <th key={c.key} style={S.th} onClick={() => handleSort(c.key)}>
                      {c.label}
                      {sortField === c.key && (
                        <span style={{ marginLeft:5, color:"#60a5fa" }}>
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((tx, i) => (
                  <tr key={tx.id}
                    style={{ background: i % 2 === 0 ? "transparent" : "#080e1c" }}
                  >
                    <td style={{ ...S.td, color:"#60a5fa", fontWeight:600 }}>#{tx.id}</td>
                    <td style={{ ...S.td, color:"#cbd5e1", fontFamily:"Georgia, serif", fontStyle:"italic" }}>{tx.customer}</td>
                    <td style={S.td}>{tx.product}</td>
                    <td style={{ ...S.td, color:"#f1f5f9", fontWeight:700 }}>
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td style={S.td}><Badge status={tx.status}/></td>
                    <td style={S.td}>{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}