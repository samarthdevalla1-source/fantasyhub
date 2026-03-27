import { useState, useEffect } from "react"
import { getSession, getProfile, signOut } from "./auth.js"
import Login from "./pages/Login.jsx"

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
  const [activePage, setActivePage] = useState("dashboard")
  const [session, setSession]       = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    getSession().then(async s => {
      setSession(s)
      if (s) {
        const p = await getProfile(s.user.id)
        setProfile(p)
      }
      setLoading(false)
    })
  }, [])

  async function handleLogin() {
    const s = await getSession()
    setSession(s)
    if (s) {
      const p = await getProfile(s.user.id)
      setProfile(p)
    }
  }

  async function handleSignOut() {
    await signOut()
    setSession(null)
    setProfile(null)
    setActivePage("dashboard")
  }

  if (loading) return <div className="loading-screen">Loading...</div>
  if (!session) return <Login onLogin={handleLogin} />

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
          <div className="avatar">{profile?.username?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div className="user-name">{profile?.username || "Coach"}</div>
            <div className="user-meta">{profile?.team_name || "My Team"}</div>
          </div>
          <button onClick={handleSignOut} style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--muted)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.15s"
          }}>Sign Out</button>
        </div>
      </nav>

      <main className="main">
        {PAGES[activePage]}
      </main>
    </div>
  )
}