import { useState, useEffect } from "react"
import { getPlayers, addToRoster, removeFromRoster } from "../api.js"

export default function RosterSetup({ userId, onComplete }) {
  const [players, setPlayers]   = useState([])
  const [search, setSearch]     = useState("")
  const [roster, setRoster]     = useState([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    getPlayers().then(data => setPlayers(data))
  }, [])

  const rosterIds = roster.map(p => p.id)

  const searchResults = search.length > 1
    ? players
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .filter(p => !rosterIds.includes(p.id))
        .slice(0, 6)
    : []

 async function handleAdd(player) {
  if (rosterIds.includes(player.id)) return
  await addToRoster(userId, player.id)
  setRoster(prev => [...prev, player])
  setSearch("")
}

  async function handleRemove(player) {
    await removeFromRoster(userId, player.id)
    setRoster(prev => prev.filter(p => p.id !== player.id))
  }

  async function handleDone() {
    if (roster.length === 0) return
    setLoading(true)
    onComplete()
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200
    }}>
      <div style={{
        background: "rgba(15,15,15,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 40,
        width: "100%",
        maxWidth: 560,
        maxHeight: "85vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 24
      }}>
        <div>
         <div style={{
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 22,
  fontWeight: 700,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: 3,
  marginBottom: 8
}}>Welcome to Winner Intelligence</div>
<div style={{
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: 28,
  fontWeight: 700,
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: 2
}}>Build Your Roster</div>
<div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
  Search for players and add them to get started. You need at least 1 player to continue.
</div>
        </div>

        <div style={{ position: "relative" }}>
          <input
            className="ai-input"
            style={{ width: "100%" }}
            placeholder="Search for a player..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {searchResults.length > 0 && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0, right: 0,
              background: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              overflow: "hidden",
              zIndex: 50,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
            }}>
              {searchResults.map((p, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.team} · {p.stats?.avg || 0} avg pts</div>
                    </div>
                  </div>
                  <button className="add-btn" onClick={() => handleAdd(p)}>Add</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {roster.length > 0 && (
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "var(--muted)",
              marginBottom: 12
            }}>
              Added ({roster.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {roster.map((p, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.team}</div>
                    </div>
                  </div>
                  <button className="drop-btn" onClick={() => handleRemove(p)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="login-btn"
          onClick={handleDone}
          disabled={roster.length === 0 || loading}
          style={{ marginTop: "auto" }}
        >
          {loading ? "..." : `Done — Let's Go (${roster.length} players added)`}
        </button>
      </div>
    </div>
  )
}