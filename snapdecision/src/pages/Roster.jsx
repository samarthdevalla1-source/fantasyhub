import { ROSTER } from "../data.js";
import "../css/roster.css";

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

export default function Roster() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">My Roster</div>
        <div className="page-subtitle">Week 14 · 8 players · 138.2 projected</div>
      </div>

      <div className="card">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Player</th><th>Pos</th><th>Matchup</th><th>Status</th><th>Avg Pts</th><th>Proj</th><th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {ROSTER.map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className={`pos-badge pos-${p.pos}`}>{p.pos}</span></td>
                <td style={{ color: "var(--muted)", fontSize: 12 }}>{p.opp}</td>
                <td>
                  <span className={`status-dot ${p.status}`} />
                  <span style={{ fontSize: 12, textTransform: "capitalize" }}>{p.status}</span>
                </td>
                <td><span className="proj-pts">{p.pts}</span></td>
                <td style={{ color: "var(--accent)", fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 700 }}>{p.proj}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: "var(--border)", borderRadius: 2 }}>
                      <div style={{ width: `${p.trend}%`, height: "100%", background: trendColor(p.trend), borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{p.trend}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}