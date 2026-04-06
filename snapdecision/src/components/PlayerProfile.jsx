import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { getPlayers, getSimilarPlayers, getPlayerTrend, getPlayerWeeklyStats, getRoster, addToRoster, removeFromRoster } from "../api.js"

export default function PlayerProfile({ player, userId, onClose, onRosterChange }) {
  if (!player) return null

  const avg    = player.stats?.avg || 0
  const proj   = player.stats?.proj || 0
  const trend  = player.stats?.trend || 0
const [weeklyStats, setWeeklyStats] = useState([])
const [allPlayers, setAllPlayers] = useState([])
const [onRoster, setOnRoster] = useState(false)
const [rosterActionLoading, setRosterActionLoading] = useState(false)

useEffect(() => {
  getPlayers().then(data => setAllPlayers(data))
}, [])

useEffect(() => {
  if (!player) return
  getPlayerWeeklyStats(player.id).then(data => setWeeklyStats(data))
}, [player])

useEffect(() => {
  if (!userId || !player) return
  getRoster(userId).then(roster => {
    setOnRoster(roster.some(r => r.player_id === player.id))
  })
}, [userId, player])

async function handleRosterAction() {
  if (!userId || rosterActionLoading) return
  setRosterActionLoading(true)
  if (onRoster) {
    await removeFromRoster(userId, player.id)
    setOnRoster(false)
  } else {
    await addToRoster(userId, player.id)
    setOnRoster(true)
  }
  onRosterChange?.()
  setRosterActionLoading(false)
}

const similarPlayers = allPlayers.length > 0
  ? getSimilarPlayers(player, allPlayers)
  : [] 

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
          <div style={{ display: "flex", gap: 8 }}>
            {userId && (
              <button onClick={handleRosterAction} disabled={rosterActionLoading} style={{
                background: onRoster ? "rgba(255,61,87,0.08)" : "rgba(0,200,83,0.08)",
                border: `1px solid ${onRoster ? "rgba(255,61,87,0.3)" : "rgba(0,200,83,0.3)"}`,
                color: onRoster ? "var(--accent2)" : "var(--green)",
                borderRadius: 8,
                padding: "6px 14px",
                cursor: rosterActionLoading ? "default" : "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                transition: "all 0.15s",
                opacity: rosterActionLoading ? 0.6 : 1
              }}>
                {rosterActionLoading ? "..." : onRoster ? "Drop" : "Add"}
              </button>
            )}
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
        {weeklyStats.length > 0 && (
  <div>
    <div style={{
      fontSize: 11,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 12
    }}>
      Weekly Points — 2025 Season
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
      {weeklyStats.map((w, i) => {
        const max = Math.max(...weeklyStats.map(s => s.points), 1)
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 9, color: "var(--muted)" }}>{w.points.toFixed(1)}</div>
            <div style={{
  width: "100%",
  height: `${(w.points / max) * 70}px`,
  background: w.injured 
    ? "rgba(255,61,87,0.3)"
    : w.points > (player.stats?.avg || 0) 
    ? "var(--accent)" 
    : "rgba(255,255,255,0.15)",
  borderRadius: 3,
  transition: "height 0.3s ease",
  minHeight: w.injured ? 3 : 3,
  border: w.injured ? "1px solid var(--accent2)" : "none"
}} />
            <div style={{ fontSize: 9, color: "var(--muted)" }}>W{w.week}</div>
          </div>
        )
      })}
    </div>
  </div>
)}

        {/* SEASON STATS */}
        <div>
  <div style={{
    fontSize: 11,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12
  }}>
    Season Summary
  </div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {[
      { label: "Games Played",    value: weeklyStats.length },
      { label: "Best Game",       value: weeklyStats.length > 0 ? Math.max(...weeklyStats.map(w => w.points)).toFixed(1) : 0 },
      { label: "Worst Game",      value: weeklyStats.length > 0 ? Math.min(...weeklyStats.map(w => w.points)).toFixed(1) : 0 },
      { label: "20+ Pt Games",    value: weeklyStats.filter(w => w.points >= 20).length },
      { label: "Sub 10 Pt Games", value: weeklyStats.filter(w => w.points < 10).length },
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

{/*SIMILAR PLAYERS*/}
      {similarPlayers.length > 0 && (
  <div>
    <div style={{
      fontSize: 11,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 12
    }}>
      Similar Players
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {similarPlayers.map((p, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          cursor: "pointer",
          transition: "border-color 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={`https://sleepercdn.com/content/nfl/players/thumb/${p.id}.jpg`}
              alt={p.name}
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)"
              }}
              onError={e => e.target.style.display = "none"}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.team} · {p.stats?.avg || 0} avg pts</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {(() => {
              const trend = getPlayerTrend(p)
              if (trend === "hot") return <span style={{ fontSize: 10, color: "var(--green)" }}>🔥</span>
              if (trend === "cold") return <span style={{ fontSize: 10, color: "var(--accent2)" }}>📉</span>
              return null
            })()}
            <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
    </div>,
    document.getElementById("portal")
  )
}