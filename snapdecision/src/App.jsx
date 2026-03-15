import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Roster    from "./pages/Roster.jsx";
import Players   from "./pages/Players.jsx";
import Waiver    from "./pages/Waiver.jsx";
import AI        from "./pages/AI.jsx";
import "./css/base.css";

const NAV = [
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "roster",    icon: "🏈", label: "My Roster" },
  { id: "players",   icon: "📊", label: "Players" },
  { id: "waiver",    icon: "🔍", label: "Waiver Wire" },
  { id: "ai",        icon: "🤖", label: "AI Analyst" },
];

const PAGES = {
  dashboard: <Dashboard />,
  roster:    <Roster />,
  players:   <Players />,
  waiver:    <Waiver />,
  ai:        <AI />,
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-text">SnapDecision</div>
          <div className="logo-sub">Fantasy Intelligence</div>
        </div>
        <nav>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${activePage === n.id ? "active" : ""}`} onClick={() => setActivePage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="avatar">JD</div>
            <div>
              <div className="user-name">Coach JD</div>
              <div className="user-meta">Week 14 · 7-5</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        {PAGES[activePage]}
      </main>
    </div>
  );
}