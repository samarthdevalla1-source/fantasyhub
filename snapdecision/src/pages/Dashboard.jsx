import { useState, useEffect } from "react";
import "../css/dashboard.css";
import { getRoster } from "../api.js"

function trendColor(t) {
  return t > 80 ? "var(--green)" : t > 60 ? "var(--accent)" : "var(--accent3)";
}

export default function Dashboard({ userId, rosterVersion, onPlayerClick }) {
  const [messages, setMessages] = useState([{ 
  role: "assistant", 
  content: "Welcome back, Coach. Add some players to your roster and I'll give you real personalized advice!" }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [roster, setRoster] = useState([]);

  function buildSystemPrompt() {
  if (roster.length === 0) return "You are an elite Fantasy Football AI analyst. Be concise, direct, and data-driven."

  const rosterContext = roster.map(r => {
    const p = r.players
    return `${p.name} (${p.position}, ${p.team}): avg ${p.stats?.avg || 0} pts, projected ${p.stats?.proj || 0} pts, trend score ${p.stats?.trend || 0}/100, status: ${p.status}`
  }).join("\n")

  return `You are an elite Fantasy Football AI analyst. You have access to the user's real roster data. Be concise, direct, and data-driven. Give specific actionable advice. Keep responses under 4 sentences unless a deeper breakdown is requested.

Current Roster:
${rosterContext}

Base all recommendations on this real roster data.`
}
/* Loads user profile from login session, then loads roster and player data for the dashboard and AI context */
  useEffect(() => {
    if (!userId) return
    getRoster(userId).then(data => setRoster(data))
  }, [userId, rosterVersion])
/* simulates a personalized welcome message based on the user's roster, and sets up the system prompt for the AI to have real roster context for advice */
  useEffect(() => {
  if (roster.length === 0) return
  const top = roster
    .slice()
    .sort((a, b) => (b.players?.stats?.avg || 0) - (a.players?.stats?.avg || 0))[0]?.players
  setMessages([{
    role: "assistant",
    content: `Welcome back, Coach. Your roster has ${roster.length} players. Your top performer is ${top?.name} averaging ${top?.stats?.avg || 0} pts. Ask me anything about your roster!`
  }])
}, [roster])

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
       body: JSON.stringify({ 
  model: "claude-sonnet-4-20250514", 
  max_tokens: 1000, 
  system: buildSystemPrompt(), 
  messages: next 
}),
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
  <div className="stat-card cyan">
    <div className="stat-label">Proj. Points</div>
    <div className="stat-value">
      {roster.filter(r => r.is_starter).reduce((sum, r) => sum + (r.players?.stats?.proj || 0), 0).toFixed(1)}
    </div>
    <div className="stat-change">{roster.length} players on roster</div>
  </div>
  <div className="stat-card yellow">
    <div className="stat-label">Top Performer</div>
    <div className="stat-value" style={{ fontSize: 22, paddingTop: 6 }}>
      {roster.length > 0
        ? roster.reduce((best, r) =>
            (r.players?.stats?.avg || 0) > (best.players?.stats?.avg || 0) ? r : best
          , roster[0])?.players?.name?.split(" ")[1] || "—"
        : "—"}
    </div>
    <div className="stat-change">Highest avg this season</div>
  </div>
  <div className="stat-card green">
    <div className="stat-label">Avg Pts/Player</div>
    <div className="stat-value">
      {roster.length > 0
        ? (roster.reduce((sum, r) => sum + (r.players?.stats?.avg || 0), 0) / roster.length).toFixed(1)
        : 0}
    </div>
    <div className="stat-change">Across all positions</div>
  </div>
  <div className="stat-card red">
    <div className="stat-label">Injuries</div>
    <div className="stat-value">
      {roster.filter(r => r.players?.status !== "active").length}
    </div>
    <div className="stat-change">Players questionable or out</div>
  </div>
</div>

      <div className="three-col">
        <div className="card">
          <div className="card-title">Start/Sit Recommendations</div>
        
         {roster.slice().sort((a, b) => (b.players?.stats?.avg || 0) - (a.players?.stats?.avg || 0)).slice(0, 4).map((r, i) => {
  const p = r.players
  const avg = p?.stats?.avg || 0
  const rec = avg > 15 ? "start" : avg > 8 ? "flex" : "sit"
  const label = avg > 15 ? "START" : avg > 8 ? "FLEX" : "SIT"
  const reason = avg > 15 ? `Averaging ${avg} pts — strong start candidate` : avg > 8 ? `Averaging ${avg} pts — consider as flex` : `Averaging ${avg} pts — risky start this week`
  return (
    <div key={i} className="rec-row">
      <div>
        <div className="rec-name" style={{ cursor: "pointer", color: "var(--accent)" }} onClick={() => onPlayerClick(r.players)}>{p?.name}</div>
        <div className="rec-reason">{reason}</div>
      </div>
      <div className={`rec-badge ${rec}`}>{label}</div>
    </div>
  )
})}
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
         
          {roster.slice(0, 6).map((r, i) => {
  const p = r.players
  const trend = p?.stats?.trend || 0
  return (
    <div key={i} className="trend-bar-wrap">
      <div className="trend-bar-header">
        <span className="name">{p?.name}</span>
        <span className="score">{trend}/100</span>
      </div>
      <div className="trend-bar-track">
        <div className="trend-bar-fill" style={{ width: `${trend}%`, background: trendColor(trend) }} />
      </div>
    </div>
  )
})}

        </div>
      </div>
    </div>
  );
}