import { useState, useEffect, useRef } from "react";
import { getRoster, addToRoster, removeFromRoster, getPlayers } from "../api.js";
import "../css/roster.css";
import Dropdown from "../components/Dropdown.jsx";

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

export default function Roster({ userId, rosterVersion, onPlayerClick }) {
  const [roster, setRoster]   = useState([])
  const [players, setPlayers] = useState([])
  const [search, setSearch]   = useState("")
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)
const [dropdownStyle, setDropdownStyle] = useState({})

  useEffect(() => {
    if (!userId) return
    loadRoster()
    getPlayers().then(data => setPlayers(data))
  }, [userId, rosterVersion])

  async function loadRoster() {
    setLoading(true)
    const data = await getRoster(userId)
    setRoster(data)
    setLoading(false)
  }

  async function handleAdd(playerId) {
  if (rosterPlayerIds.includes(playerId)) return
  await addToRoster(userId, playerId)
  await loadRoster()
  setSearch("")
}
  async function handleDrop(playerId) {
    await removeFromRoster(userId, playerId)
    await loadRoster()
  }

  const rosterPlayerIds = roster.map(r => r.player_id)

  const searchResults = search.length > 1
    ? players
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .filter(p => !rosterPlayerIds.includes(p.id))
        .slice(0, 8)
    : []

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Roster</div>
        <div className="page-subtitle">Week 14 · {roster.length} players</div>
      </div>

      <div className="card" style={{ marginBottom: 20, zIndex: 100000 }}>
        <div className="card-title">Add Player</div>
        <div style={{ position: "relative" }}>
          <input
          ref = {inputRef}
            className="ai-input"
            style={{ width: "100%" }}
            placeholder="Search for a player to add..."
            value={search}
            onChange={e => {
  setSearch(e.target.value)
  if (inputRef.current) {
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
    })
  }
}}
          />
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((p, i) => (
                <div key={i} className="search-result-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.team} · {p.stats?.avg || 0} avg pts</div>
                    </div>
                  </div>
                  <button className="add-btn" onClick={() => handleAdd(p.id)}>Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>Team</th>
              <th>Status</th>
              <th>Avg Pts</th>
              <th>Proj</th>
              <th>Trend</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>Loading roster...</td></tr>
            ) : roster.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>No players on your roster yet. Search above to add some!</td></tr>
            ) : (
              roster.map((r, i) => {
                const p = r.players
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, cursor: "pointer", color: "var(--accent)" }} onClick={() => onPlayerClick(r.players)}>{p.name}</td>
                    <td><span className={`pos-badge pos-${p.position}`}>{p.position}</span></td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{p.team}</td>
                    <td>
                      <span className={`status-dot ${p.status}`} />
                      <span style={{ fontSize: 12, textTransform: "capitalize" }}>{p.status}</span>
                    </td>
                    <td><span className="proj-pts">{p.stats?.avg || 0}</span></td>
                    <td style={{ color: "var(--accent)", fontFamily: "'Rajdhani'", fontSize: 16, fontWeight: 700 }}>{p.stats?.proj || 0}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 4, background: "var(--border)", borderRadius: 2 }}>
                          <div style={{ width: `${p.stats?.trend || 0}%`, height: "100%", background: trendColor(p.stats?.trend || 0), borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{p.stats?.trend || 0}</span>
                      </div>
                    </td>
                    <td><button className="drop-btn" onClick={() => handleDrop(p.id)}>Drop</button></td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {searchResults.length > 0 && (
      <Dropdown
        results={searchResults}
        onAdd={p => handleAdd(p.id)}
        style={dropdownStyle}
      />
    )}

    </div>
  )
}