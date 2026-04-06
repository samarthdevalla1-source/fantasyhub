
import { useState, useEffect } from "react";
import { getPlayers, getPlayerTrend, getRoster, addToRoster } from "../api.js";
import { SelectDropdown } from "../components/Dropdown.jsx"
import "../css/players.css";

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

function TrendBadge({ player }) {
  const trend = getPlayerTrend(player)
  if (trend === "hot") return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: "var(--green)",
      background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.2)",
      borderRadius: 4, padding: "2px 6px", letterSpacing: 1, textTransform: "uppercase"
    }}>Trending 🔥</span>
  )
  if (trend === "cold") return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: "var(--accent2)",
      background: "rgba(255,61,87,0.1)", border: "1px solid rgba(255,61,87,0.2)",
      borderRadius: 4, padding: "2px 6px", letterSpacing: 1, textTransform: "uppercase"
    }}>📉 Cold</span>
  )
  return null
}

export default function Players({ userId, onPlayerClick }) {
  const [activeTab, setActiveTab] = useState("my-players");
  const [players, setPlayers] = useState([]);
  const [rosterIds, setRosterIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("proj")
  const [posFilter, setPosFilter] = useState("ALL")
  const [addedIds, setAddedIds] = useState(new Set())

  useEffect(() => {
    async function load() {
      const [data, roster] = await Promise.all([
        getPlayers(),
        userId ? getRoster(userId) : []
      ])
      setPlayers(data)
      setRosterIds(new Set(roster.map(r => r.player_id)))
    }
    load()
  }, [userId])

  async function handleAdd(e, playerId) {
    e.stopPropagation()
    await addToRoster(userId, playerId)
    setRosterIds(prev => new Set([...prev, playerId]))
    setAddedIds(prev => new Set([...prev, playerId]))
  }

  const filteredPlayers = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => posFilter === "ALL" || p.position === posFilter)
    .sort((a, b) => {
      if (sortBy === "name")  return a.name.localeCompare(b.name)
      if (sortBy === "most")  return Number(b.stats?.avg || 0) - Number(a.stats?.avg || 0)
      if (sortBy === "least") return Number(a.stats?.avg || 0) - Number(b.stats?.avg || 0)
      if (sortBy === "proj")  return Number(b.stats?.proj || 0) - Number(a.stats?.proj || 0)
      return 0
    })

  const sleeperPlayers = players
    .filter(p => !rosterIds.has(p.id))
    .filter(p => (p.stats?.avg || 0) > 0 && (p.stats?.trend || 0) > 0)
    .filter(p => posFilter === "ALL" || p.position === posFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .map(p => {
      const avg = p.stats?.avg || 0
      const trend = p.stats?.trend || 0
      const proj = p.stats?.proj || 0
      const momentum = avg > 0 ? ((trend - avg) / avg) * 100 : 0
      const sleeperScore = avg > 0 ? (trend / avg) * proj : 0
      return { ...p, momentum, sleeperScore }
    })
    .sort((a, b) => b.sleeperScore - a.sleeperScore)
    .slice(0, 48)

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Player Database</div>
        <div className="page-subtitle">Track performance, trends, and matchups across the league</div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          className="ai-input"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <SelectDropdown
          value={posFilter}
          onChange={setPosFilter}
          options={[
            { value: "ALL", label: "All Positions" },
            { value: "QB",  label: "QB" },
            { value: "RB",  label: "RB" },
            { value: "WR",  label: "WR" },
            { value: "TE",  label: "TE" },
            { value: "K",   label: "K" },
          ]}
        />
        {activeTab === "my-players" && (
          <SelectDropdown
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "proj",  label: "Sort: Projected" },
              { value: "most",  label: "Sort: Most Points" },
              { value: "least", label: "Sort: Least Points" },
              { value: "name",  label: "Sort: Name" },
            ]}
          />
        )}
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === "my-players" ? "active" : ""}`} onClick={() => setActiveTab("my-players")}>My Players</div>
        <div className={`tab ${activeTab === "sleepers"   ? "active" : ""}`} onClick={() => setActiveTab("sleepers")}>Sleeper Watch</div>
      </div>

      {activeTab === "my-players" && (
        <div className="player-grid" key={filteredPlayers.length}>
          {filteredPlayers.map((p, i) => (
            <div key={i} className="player-card" onClick={() => onPlayerClick(p)}>
              <div className="player-card-top">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={`https://sleepercdn.com/content/nfl/players/thumb/${p.id}.jpg`}
                    alt={p.name}
                    style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                    onError={e => e.target.style.display = "none"}
                  />
                  <div>
                    <div className="player-name">{p.name}</div>
                    <div className="player-meta">{p.team}</div>
                  </div>
                  <TrendBadge player={p} />
                </div>
                <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
              </div>
              <div className="player-stat-row">
                <div className="mini-stat">
                  <div className="mini-stat-val" style={{ color: "var(--accent)" }}>{p.stats?.proj || 0}</div>
                  <div className="mini-stat-lbl">Proj</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-val">{p.stats?.avg || 0}</div>
                  <div className="mini-stat-lbl">Avg</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-val" style={{ color: trendColor(p.stats?.trend || 0) }}>{p.stats?.trend || 0}</div>
                  <div className="mini-stat-lbl">Trend</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sleepers" && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
            Free agents ranked by upside — players not on your roster whose recent form outpaces their season average.
          </div>
          <div className="player-grid">
            {sleeperPlayers.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 13, gridColumn: "1/-1" }}>No sleepers found for this filter.</div>
            ) : sleeperPlayers.map((p, i) => {
              const isAdded = addedIds.has(p.id)
              const momentumPositive = p.momentum >= 0
              return (
                <div key={i} className="player-card sleeper" onClick={() => onPlayerClick(p)}>
                  <div className="player-card-top">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={`https://sleepercdn.com/content/nfl/players/thumb/${p.id}.jpg`}
                        alt={p.name}
                        style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                        onError={e => e.target.style.display = "none"}
                      />
                      <div>
                        <div className="player-name">{p.name}</div>
                        <div className="player-meta">{p.team}</div>
                      </div>
                    </div>
                    <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
                  </div>

                  <div className="player-stat-row">
                    <div className="mini-stat">
                      <div className="mini-stat-val" style={{ color: "var(--accent)" }}>{p.stats?.proj || 0}</div>
                      <div className="mini-stat-lbl">Proj</div>
                    </div>
                    <div className="mini-stat">
                      <div className="mini-stat-val">{p.stats?.avg || 0}</div>
                      <div className="mini-stat-lbl">Avg</div>
                    </div>
                    <div className="mini-stat">
                      <div className="mini-stat-val" style={{ color: momentumPositive ? "var(--green)" : "var(--accent2)" }}>
                        {momentumPositive ? "+" : ""}{Math.round(p.momentum)}%
                      </div>
                      <div className="mini-stat-lbl">Momentum</div>
                    </div>
                  </div>

                  <button
                    onClick={e => handleAdd(e, p.id)}
                    disabled={isAdded}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      padding: "6px 0",
                      background: isAdded ? "rgba(0,200,83,0.1)" : "rgba(0,229,255,0.08)",
                      border: `1px solid ${isAdded ? "rgba(0,200,83,0.3)" : "rgba(0,229,255,0.2)"}`,
                      color: isAdded ? "var(--green)" : "rgba(0,229,255,0.9)",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Rajdhani', sans-serif",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      cursor: isAdded ? "default" : "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {isAdded ? "Added" : "Add to Roster"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
