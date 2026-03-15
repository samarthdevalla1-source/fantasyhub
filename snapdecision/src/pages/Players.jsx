import { useState } from "react";
import { ROSTER, SLEEPERS } from "../data.js";
import "../css/players.css";

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

export default function Players() {
  const [activeTab, setActiveTab] = useState("my-players");

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Player Database</div>
        <div className="page-subtitle">Track performance, trends, and matchups across the league</div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === "my-players" ? "active" : ""}`} onClick={() => setActiveTab("my-players")}>My Players</div>
        <div className={`tab ${activeTab === "sleepers"   ? "active" : ""}`} onClick={() => setActiveTab("sleepers")}>Sleeper Watch</div>
      </div>

      {activeTab === "my-players" && (
        <div className="player-grid">
          {ROSTER.map((p, i) => (
            <div key={i} className="player-card">
              <div className="player-card-top">
                <div>
                  <div className="player-name">{p.name}</div>
                  <div className="player-meta">{p.team} · {p.opp}</div>
                </div>
                <span className={`pos-badge pos-${p.pos}`}>{p.pos}</span>
              </div>
              <div className="player-stat-row">
                <div className="mini-stat">
                  <div className="mini-stat-val" style={{ color: "var(--accent)" }}>{p.proj}</div>
                  <div className="mini-stat-lbl">Proj</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-val">{p.pts}</div>
                  <div className="mini-stat-lbl">Avg</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-val" style={{ color: trendColor(p.trend) }}>{p.trend}</div>
                  <div className="mini-stat-lbl">Trend</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sleepers" && (
        <div className="player-grid">
          {SLEEPERS.map((p, i) => (
            <div key={i} className="player-card sleeper">
              <div className="player-card-top">
                <div>
                  <div className="player-name">{p.name}</div>
                  <div className="player-meta">{p.team} · {p.games} game sample</div>
                </div>
                <span className={`pos-badge pos-${p.pos}`}>{p.pos}</span>
              </div>
              <div className="player-stat-row">
                <div className="mini-stat">
                  <div className="mini-stat-val" style={{ color: "var(--accent3)" }}>{p.pts}</div>
                  <div className="mini-stat-lbl">Avg Pts</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-stat-val" style={{ color: "var(--green)" }}>{p.trend}</div>
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