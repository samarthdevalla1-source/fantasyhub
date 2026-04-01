import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { getPlayers, getSimilarPlayers, getPlayerTrend } from "../api.js"

export default function PlayerProfile({ player, onClose }) {
  if (!player) return null

  const weekly = player.stats?.weeklyPoints || []
  const avg    = player.stats?.avg || 0
  const proj   = player.stats?.proj || 0
  const trend  = player.stats?.trend || 0
  const max    = Math.max(...weekly, 1)

  return createPortal(
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 500
    }} onClick={onClose}>
      <div style={{
        background: "rgba(15,15,15,0.98)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 48,
        width: "100%",
        maxWidth: 900,
        maxHeight: "85vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 24
      }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <img
             src={`https://sleepercdn.com/content/nfl/players/thumb/${player.id}.jpg`}
             alt={player.name}
             style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent)" }}
             onError={e => e.target.style.display = "none"}
            />
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 32,
              fontWeight: 700,
              color: "var(--text)",
              textTransform: "uppercase",
              letterSpacing: 1
            }}>{player.name}</div>
            {(() => {
  const trend = getPlayerTrend(player)
  if (trend === "hot") return <span style={{
    fontSize: 11,
    fontWeight: 700,
    color: "var(--green)",
    background: "rgba(0,200,83,0.1)",
    border: "1px solid rgba(0,200,83,0.2)",
    borderRadius: 4,
    padding: "3px 8px",
    letterSpacing: 1,
    textTransform: "uppercase"
  }}>🔥 Trending Up</span>
  if (trend === "cold") return <span style={{
    fontSize: 11,
    fontWeight: 700,
    color: "var(--accent2)",
    background: "rgba(255,61,87,0.1)",
    border: "1px solid rgba(255,61,87,0.2)",
    borderRadius: 4,
    padding: "3px 8px",
    letterSpacing: 1,
    textTransform: "uppercase"
  }}>📉 Trending Down</span>
  return null
})()}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span className={`pos-badge pos-${player.position}`}>{player.position}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{player.team}</span>
              <span className={`status-dot ${player.status}`} />
              <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>{player.status}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--muted)",
            borderRadius: 8,
            padding: "6px 14px",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            fontSize: 12
          }}>Close</button>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Avg Points",  value: avg,   color: "var(--accent)" },
            { label: "Projected",   value: proj,  color: "var(--accent3)" },
            { label: "Trend Score", value: trend, color: trend > 80 ? "var(--green)" : trend > 60 ? "var(--accent)" : "var(--accent3)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: 16,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* WEEKLY CHART */}
        {weekly.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
              Weekly Points — 2025 Season
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
              {weekly.map((pts, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: `${(pts / max) * 70}px`,
                    background: pts > avg ? "var(--accent)" : "rgba(255,255,255,0.15)",
                    borderRadius: 3,
                    transition: "height 0.3s ease",
                    minHeight: pts > 0 ? 3 : 0
                  }} />
                  <div style={{ fontSize: 8, color: "var(--muted)" }}>W{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEASON STATS */}
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
            Season Summary
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Games Played",   value: weekly.filter(p => p > 0).length },
              { label: "Best Game",      value: weekly.length > 0 ? Math.max(...weekly).toFixed(1) : 0 },
              { label: "Worst Game",     value: weekly.filter(p => p > 0).length > 0 ? Math.min(...weekly.filter(p => p > 0)).toFixed(1) : 0 },
              { label: "20+ Pt Games",   value: weekly.filter(p => p >= 20).length },
              { label: "Sub 10 Pt Games", value: weekly.filter(p => p > 0 && p < 10).length },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: 13
              }}>
                <span style={{ color: "var(--muted)" }}>{s.label}</span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>,
    document.getElementById("portal")
  )
}