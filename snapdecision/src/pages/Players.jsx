
import { useState, useEffect } from "react";
import { getPlayers } from "../api.js";
import { SelectDropdown } from "../components/Dropdown.jsx"
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
  <SelectDropdown
    value={sortBy}
    onChange={setSortBy}
    options={[
      { value: "most",  label: "Sort: Most Points" },
      { value: "least", label: "Sort: Least Points" },
      { value: "name",  label: "Sort: Name" },
    ]}
  />
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
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)"
        }}
        onError={e => e.target.style.display = "none"}
      />
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