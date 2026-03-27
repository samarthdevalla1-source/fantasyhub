import { useState, useEffect } from "react";
import { syncPlayers, syncStats } from '../api.js'
import { ROSTER, SYSTEM_PROMPT, WELCOME_MESSAGE } from "../data.js";
import "../css/dashboard.css";

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

const RECS = [
  { name: "CeeDee Lamb",    rec: "start", label: "START", reason: "3-game 24+ pt streak vs weak PHI secondary" },
  { name: "Tyreek Hill",    rec: "sit",   label: "SIT",   reason: "Questionable (knee) — high risk this week" },
  { name: "Saquon Barkley", rec: "start", label: "START", reason: "Workhorse role, high volume expected" },
  { name: "Sam LaPorta",    rec: "flex",  label: "FLEX",  reason: "Matchup favorable, moderate upside" },
];

export default function Dashboard() {
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME_MESSAGE }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);

useEffect(() => {
  syncPlayers().then(() => syncStats())
}, [])

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: next }),
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, couldn't process that.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="week-badge">Week 14</div>
        <div className="page-title">Your Dashboard</div>
        <div className="page-subtitle">Sunday 1:00 PM kickoff · 3 days away</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card card1"><div className="stat-label">Proj. Points</div><div className="stat-value">138.2</div><div className="stat-change">↑ +4.1 from last week</div></div>
        <div className="stat-card card2"><div className="stat-label">Season Record</div><div className="stat-value">7–5</div><div className="stat-change">3rd in league</div></div>
        <div className="stat-card card3"><div className="stat-label">Avg Pts/Wk</div><div className="stat-value">121.4</div><div className="stat-change">↑ +8.2 last 4 weeks</div></div>
        <div className="stat-card card4"><div className="stat-label">Injuries</div><div className="stat-value">1</div><div className="stat-change">Tyreek Hill — Q</div></div>
      </div>

      <div className="three-col">
        <div className="card">
          <div className="card-title">Start/Sit Recommendations</div>
          {RECS.map((r, i) => (
            <div key={i} className="rec-row">
              <div>
                <div className="rec-name">{r.name}</div>
                <div className="rec-reason">{r.reason}</div>
              </div>
              <div className={`rec-badge ${r.rec}`}>{r.label}</div>
            </div>
          ))}
        </div>

        <div className="ai-panel">
          <div className="ai-header">
            <div className="ai-dot" />
            <div className="ai-title">AI Analyst</div>
          </div>
          <div className="ai-messages">
            {messages.map((m, i) => <div key={i} className={`ai-message ${m.role}`}>{m.content}</div>)}
            {loading && <div className="ai-message assistant"><div className="loading-dots"><span>•</span><span>•</span><span>•</span></div></div>}
          </div>
          <div className="ai-input-area">
            <input className="ai-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask about your roster..." />
            <button className="ai-btn" onClick={sendMessage} disabled={loading}>Ask</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Player Trends</div>
        <div className="trends-grid">
          {ROSTER.slice(0, 6).map((p, i) => (
            <div key={i} className="trend-bar-wrap">
              <div className="trend-bar-header">
                <span className="name">{p.name}</span>
                <span className="score">{p.trend}/100</span>
              </div>
              <div className="trend-bar-track">
                <div className="trend-bar-fill" style={{ width: `${p.trend}%`, background: trendColor(p.trend) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}