import { useState, useEffect } from "react"
import { getSession, getProfile, signOut } from "./auth.js"
import { syncPlayers, syncStats, syncTeams, getRoster } from "./api.js"
import Login from "./pages/Login.jsx"
import RosterSetup from "./components/RosterSetup.jsx"
import PlayerProfile from "./components/PlayerProfile.jsx"
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



export default function App() {
  const [activePage, setActivePage] = useState("dashboard")
  const [session, setSession]       = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [showRosterSetup, setShowRosterSetup] = useState(false)
  const [rosterVersion, setRosterVersion] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

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

  useEffect(() => {
  const lastSync = localStorage.getItem('lastSync')
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000

  if (!lastSync || now - parseInt(lastSync) > oneDay) {
    syncTeams()
    syncPlayers().then(() => syncStats()).then(() => {
      localStorage.setItem('lastSync', now.toString())
      setRosterVersion(v => v + 1)
    })
  }
}, [])

  async function handleLogin() {
  const s = await getSession()
  setSession(s)
  if (s) {
    const p = await getProfile(s.user.id)
    setProfile(p)
    const roster = await getRoster(s.user.id)
    console.log("roster length:", roster.length)
    if (roster.length === 0) setShowRosterSetup(true)
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

  const PAGES = {
  dashboard: <Dashboard userId={session?.user?.id} rosterVersion={rosterVersion} onPlayerClick={setSelectedPlayer} />,
  roster:    <Roster userId={session?.user?.id} rosterVersion={rosterVersion} onPlayerClick={setSelectedPlayer} />,
  players:   <Players userId={session?.user?.id} onPlayerClick={setSelectedPlayer} />,
  ai:        <AI />,
}

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
     {showRosterSetup && (
  <RosterSetup
    userId={session?.user?.id}
    onComplete={() => {
      setShowRosterSetup(false)
      setRosterVersion(v => v + 1)
    }}
  />
)}
<PlayerProfile
  player={selectedPlayer}
  userId={session?.user?.id}
  onClose={() => setSelectedPlayer(null)}
  onRosterChange={() => setRosterVersion(v => v + 1)}
/>
    </div>
  )
}