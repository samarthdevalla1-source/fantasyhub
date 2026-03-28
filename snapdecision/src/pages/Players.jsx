
import { useState, useEffect } from "react";
import { getPlayers } from "../api.js";
import "../css/players.css";

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

export default function Players({ onPlayerClick }) {
  const [activeTab, setActiveTab] = useState("my-players");
const [players, setPlayers] = useState([]);
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("most")
const [posFilter, setPosFilter] = useState("ALL")

useEffect(() => {
  const load = async () => {
    const data = await getPlayers()
    setPlayers(data)
  }
  load()
}, [])

const filteredPlayers = players
  .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  .filter(p => posFilter === "ALL" || p.position === posFilter)
  .sort((a, b) => {
    if (sortBy === "name")  return a.name.localeCompare(b.name)
    if (sortBy === "most")  return Number(b.stats?.avg || 0) - Number(a.stats?.avg || 0)
    if (sortBy === "least") return Number(a.stats?.avg || 0) - Number(b.stats?.avg || 0)
    return 0
  })

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
  <select
    value={posFilter}
    onChange={e => setPosFilter(e.target.value)}
    style={{
      background: "var(--surface2)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      borderRadius: 6,
      padding: "9px 14px",
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      outline: "none",
      cursor: "pointer"
    }}
  >
    <option value="ALL">All Positions</option>
    <option value="QB">QB</option>
    <option value="RB">RB</option>
    <option value="WR">WR</option>
    <option value="TE">TE</option>
    <option value="K">K</option>
  </select>
  <select
    value={sortBy}
    onChange={e => setSortBy(e.target.value)}
    style={{
      background: "var(--surface2)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      borderRadius: 6,
      padding: "9px 14px",
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      outline: "none",
      cursor: "pointer"
    }}
  >
    <option value="most">Sort: Most Points</option>
    <option value="least">Sort: Least Points</option>
    <option value="name">Sort: Name</option>
  </select>
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
                <div>
                  <div className="player-name">{p.name}</div>
                  <div className="player-meta">{p.team}</div>
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
    </div>
  );
}