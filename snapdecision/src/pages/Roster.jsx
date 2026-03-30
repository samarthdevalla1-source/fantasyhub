import { useState, useEffect, useRef } from "react"
import { getRoster, addToRoster, removeFromRoster, getPlayers, saveLineup } from "../api.js"
import { calculateBestLineup, SLOT_LABELS, SLOT_ORDER } from "../lineup.js"
import { SearchDropdown } from "../components/Dropdown.jsx"
import "../css/roster.css"

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)"
}

export default function Roster({ userId, rosterVersion, onPlayerClick }) {
  const [roster, setRoster]         = useState([])
  const [players, setPlayers]       = useState([])
  const [search, setSearch]         = useState("")
  const [loading, setLoading]       = useState(true)
  const [swapping, setSwapping]     = useState(null)
  const inputRef                    = useRef(null)
  const [dropdownStyle, setDropdownStyle] = useState({})

  useEffect(() => {
    if (!userId) return
    loadRoster()
    getPlayers().then(data => setPlayers(data))
  }, [userId, rosterVersion])

  async function loadRoster() {
  setLoading(true)
  const data = await getRoster(userId)
  const hasSlots = data.some(r => r.slot && r.slot !== 'BENCH')
  if (!hasSlots) {
    const withLineup = calculateBestLineup(data)
    await saveLineup(userId, withLineup)
    setRoster(withLineup)
  } else {
    setRoster(data)
  }
  setLoading(false)
}

  async function handleAdd(playerId) {
    if (roster.some(r => r.player_id === playerId)) return
    await addToRoster(userId, playerId)
    await loadRoster()
    setSearch("")
  }

  async function handleDrop(playerId) {
    await removeFromRoster(userId, playerId)
    await loadRoster()
  }

  async function handleSwap(player) {
  if (swapping === null) {
    setSwapping(player)
    return
  }

  if (swapping.player_id === player.player_id) {
    setSwapping(null)
    return
  }

  const flexPositions = ['RB', 'WR', 'TE']
  const swappingPos = swapping.players?.position
  const targetPos = player.players?.position
  const swappingSlot = swapping.slot
  const targetSlot = player.slot

  const swappingIsFlexEligible = flexPositions.includes(swappingPos)
  const targetIsFlexEligible = flexPositions.includes(targetPos)

  const validSwap =
    swappingPos === targetPos ||
    (swappingSlot === 'FLEX' && targetIsFlexEligible) ||
    (targetSlot === 'FLEX' && swappingIsFlexEligible)

if (!validSwap) return
  

  const updatedRoster = roster.map(r => {
    if (r.player_id === swapping.player_id) {
      return { ...r, slot: player.slot, is_starter: player.is_starter }
    }
    if (r.player_id === player.player_id) {
      return { ...r, slot: swapping.slot, is_starter: swapping.is_starter }
    }
    return r
  })

  setRoster(updatedRoster)
  setSwapping(null)
  await saveLineup(userId, updatedRoster)
}

  const rosterPlayerIds = roster.map(r => r.player_id)

  const searchResults = search.length > 1
    ? players
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .filter(p => !rosterPlayerIds.includes(p.id))
        .slice(0, 8)
    : []

  const starters = SLOT_ORDER
    .filter(s => s !== 'BENCH')
    .map(slot => roster.find(r => r.slot === slot))

  const bench = roster.filter(r => r.slot === 'BENCH')

  function renderPlayerRow(r, showSlot = false) {
    if (!r) return (
      <tr style={{ opacity: 0.4 }}>
        <td colSpan="9" style={{ padding: "12px", fontSize: 12, color: "var(--muted)" }}>
          Empty slot
        </td>
      </tr>
    )

    const p = r.players
    const isSwapping = swapping?.player_id === r.player_id
    const flexPositions = ['RB', 'WR', 'TE']

    const isEligibleForSwap = swapping
      ? swapping.player_id === r.player_id ||
        swapping.players?.position === r.players?.position ||
        (swapping.slot === 'FLEX' && flexPositions.includes(r.players?.position)) ||
        (r.slot === 'FLEX' && flexPositions.includes(swapping.players?.position))
      : true

    return (
      <tr key={r?.player_id} style={{
  opacity: swapping && !isEligibleForSwap ? 0.25 : 1,
  transition: "opacity 0.2s",
  pointerEvents: swapping && !isEligibleForSwap ? "none" : "auto",
  background: isSwapping ? "rgba(245,166,35,0.08)" : "transparent",
  outline: isSwapping ? "1px solid rgba(245,166,35,0.3)" : "none"
}}>
        {showSlot && (
          <td style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted)",
            letterSpacing: 1,
            textTransform: "uppercase",
            width: 50
          }}>
            {SLOT_LABELS[r.slot]}
          </td>
        )}
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={`https://sleepercdn.com/content/nfl/players/thumb/${p.id}.jpg`}
              alt={p.name}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)"
              }}
              onError={e => e.target.style.display = "none"}
            />
            <span
              style={{ fontWeight: 600, cursor: "pointer", color: "var(--accent)" }}
              onClick={() => onPlayerClick(r.players)}
            >{p.name}</span>
          </div>
        </td>
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
        <td>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => handleSwap(r)}
              style={{
                background: isSwapping ? "var(--accent)" : "transparent",
                border: `1px solid ${isSwapping ? "var(--accent)" : "rgba(255,255,255,0.15)"}`,
                color: isSwapping ? "#000" : "var(--muted)",
                borderRadius: 4,
                padding: "4px 10px",
                fontSize: 11,
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.15s",
                letterSpacing: 1
              }}
            >
              {isSwapping ? "Cancel" : "Swap"}
            </button>
            <button className="drop-btn" onClick={() => handleDrop(p.id)}>Drop</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Roster</div>
        <div className="page-subtitle">Week 14 · {roster.length} players</div>
      </div>

      {swapping && (
        <div style={{
          background: "rgba(245,166,35,0.08)",
          border: "1px solid rgba(245,166,35,0.2)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: "var(--accent)"
        }}>
          Swapping <strong>{swapping.players?.name}</strong> — click another player to swap their slots
        </div>
      )}

      <div style={{ position: "relative", zIndex: 10 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Add Player</div>
          <input
            ref={inputRef}
            className="ai-input"
            style={{ width: "100%" }}
            placeholder="Search for a player to add..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect()
                setDropdownStyle({
                  position: "fixed",
                  top: rect.bottom + 6,
                  left: rect.left,
                  width: rect.width,
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  zIndex: 9999
                })
              }
            }}
          />
        </div>
      </div>

      {searchResults.length > 0 && (
        <SearchDropdown
          results={searchResults}
          onAdd={p => handleAdd(p.id)}
          style={dropdownStyle}
        />
      )}

      {/* STARTERS */}
      <div className="card" style={{ marginBottom: 20, position: "relative", zIndex: 1 }}>
        <div className="card-title">Starters</div>
        {loading ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Loading...</div>
        ) : (
          <table className="roster-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Slot</th>
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
              {starters.map((r, i) => renderPlayerRow(r, SLOT_ORDER[i]))}
            </tbody>
          </table>
        )}
      </div>

      {/* BENCH */}
      <div className="card" style={{ position: "relative", zIndex: 1 }}>
        <div className="card-title">Bench</div>
        {loading ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Loading...</div>
        ) : bench.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>No bench players.</div>
        ) : (
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
              {bench.map(r => renderPlayerRow(r, false))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}