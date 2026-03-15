import { useState } from "react";
import { SYSTEM_PROMPT, WELCOME_MESSAGE } from "../data.js";
import "../css/ai.css";

export default function AI() {
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME_MESSAGE }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);

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
        <div className="page-title">AI Analyst</div>
        <div className="page-subtitle">Your personal fantasy football intelligence engine</div>
      </div>

      <div className="ai-panel ai-fullpage">
        <div className="ai-header">
          <div className="ai-dot" />
          <div className="ai-title">SnapDecision AI · Powered by Claude</div>
        </div>
        <div className="ai-messages">
          {messages.map((m, i) => <div key={i} className={`ai-message ${m.role}`}>{m.content}</div>)}
          {loading && <div className="ai-message assistant"><div className="loading-dots"><span>•</span><span>•</span><span>•</span></div></div>}
        </div>
        <div className="ai-input-area">
          <input className="ai-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask about matchups, start/sit decisions, waiver targets..." />
          <button className="ai-btn" onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}