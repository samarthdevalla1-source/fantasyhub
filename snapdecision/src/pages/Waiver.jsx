import { ROSTER, WAIVER } from "../data.js";
import "../css/waiver.css";

export default function Waiver() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Waiver Wire</div>
        <div className="page-subtitle">AI-ranked pickups based on your roster needs</div>
      </div>

      <div className="card">
        <div className="card-title">Top Pickups This Week</div>
        {WAIVER.map((p, i) => (
          <div key={i} className="waiver-row">
            <div className="waiver-left">
              <span className={`pos-badge pos-${p.pos}`}>{p.pos}</span>
              <div>
                <div className="waiver-name">{p.name}</div>
                <div className="waiver-meta">{p.team} · {p.owned} owned</div>
              </div>
            </div>
            <div className="waiver-right">
              <div>
                <div className="waiver-pts-val">{p.pts}</div>
                <div className="waiver-pts-lbl">Avg Pts</div>
              </div>
              <div className="waiver-trend">{p.trend}</div>
              <button className="add-btn">Add</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Drop Candidates</div>
        {ROSTER.filter(p => p.trend < 72).map((p, i) => (
          <div key={i} className="waiver-row">
            <div className="waiver-left">
              <span className={`pos-badge pos-${p.pos}`}>{p.pos}</span>
              <div>
                <div className="waiver-name">{p.name}</div>
                <div className="waiver-meta">{p.team} · Trend: {p.trend}/100</div>
              </div>
            </div>
            <button className="drop-btn">Drop</button>
          </div>
        ))}
      </div>
    </div>
  );
}