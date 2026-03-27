import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Roster    from "./pages/Roster.jsx";
import Players   from "./pages/Players.jsx";
import AI        from "./pages/AI.jsx";
import "./css/base.css";

const NAV = [
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "roster",    icon: "🏈", label: "My Roster" },
  { id: "players",   icon: "📊", label: "Players" },
  { id: "ai",        icon: "🤖", label: "AI Analyst" },
];

const PAGES = {
  dashboard: <Dashboard />,
  roster:    <Roster />,
  players:   <Players />,
  ai:        <AI />,
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
  <div className="app">
    <nav className="topnav">
      <div className="topnav-logo">WINNER</div>
      <div className="topnav-links">
        {NAV.map(n => (
          <div key={n.id} className={`topnav-item ${activePage === n.id ? "active" : ""}`} onClick={() => setActivePage(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </div>
        ))}
      </div>
      <div className="topnav-user">
        <div className="avatar">JD</div>
        <div>
          <div className="user-name">Coach JD</div>
          <div className="user-meta">Week 14 · 7-5</div>
        </div>
      </div>
    </nav>

    <main className="main">
      {PAGES[activePage]}
    </main>
  </div>
)
}