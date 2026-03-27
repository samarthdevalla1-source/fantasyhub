import { useState } from "react"
import { signIn, signUp } from "../auth.js"
import "../css/login.css"

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp]     = useState(false)
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [username, setUsername]     = useState("")
  const [teamName, setTeamName]     = useState("")
  const [error, setError]           = useState("")
  const [loading, setLoading]       = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError("")

    if (isSignUp) {
      if (!username || !teamName) {
        setError("Please fill in all fields")
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, username, teamName)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await signIn(email, password)
      if (error) { setError(error.message); setLoading(false); return }
    }

    setLoading(false)
    onLogin()
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">WINNER</div>
        <div className="login-sub">Fantasy Intelligence</div>

        <div className="login-tabs">
          <div className={`login-tab ${!isSignUp ? "active" : ""}`} onClick={() => setIsSignUp(false)}>Sign In</div>
          <div className={`login-tab ${isSignUp ? "active" : ""}`} onClick={() => setIsSignUp(true)}>Sign Up</div>
        </div>

        <div className="login-fields">
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {isSignUp && (
            <>
              <input
                className="login-input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                className="login-input"
                type="text"
                placeholder="Team Name"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
              />
            </>
          )}
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </div>
    </div>
  )
}