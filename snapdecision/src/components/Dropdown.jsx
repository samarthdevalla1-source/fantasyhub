import { createPortal } from "react-dom"
import { useState, useRef, useEffect } from "react"
import { getPlayerTrend } from "../api.js"

function TrendPill({ player }) {
  const trend = getPlayerTrend(player)
  if (trend === "hot") return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: "var(--green)",
      background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.2)",
      borderRadius: 4, padding: "2px 6px", letterSpacing: 1, textTransform: "uppercase",
      whiteSpace: "nowrap"
    }}>🔥 Hot</span>
  )
  if (trend === "cold") return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: "var(--accent2)",
      background: "rgba(255,61,87,0.1)", border: "1px solid rgba(255,61,87,0.2)",
      borderRadius: 4, padding: "2px 6px", letterSpacing: 1, textTransform: "uppercase",
      whiteSpace: "nowrap"
    }}>📉 Cold</span>
  )
  return null
}

function StatusDot({ status }) {
  const color = status === "active" ? "var(--green)" : status === "questionable" ? "var(--accent)" : "var(--accent2)"
  return <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: color, marginRight: 4 }} />
}

export function SearchDropdown({ results, rosterPlayerIds = [], onAdd, onDrop, onViewProfile, style }) {
  return createPortal(
    <div style={{ ...style, position: "fixed", zIndex: 9999, pointerEvents: "all" }}>
      {results.map((p, i) => {
        const onRoster = rosterPlayerIds.includes(p.id)
        return (
        <div key={i} style={{
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          transition: "background 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            {/* Left: photo + identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <img
                src={`https://sleepercdn.com/content/nfl/players/thumb/${p.id}.jpg`}
                alt={p.name}
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", flexShrink: 0 }}
                onError={e => e.target.style.display = "none"}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{ fontWeight: 600, fontSize: 13, cursor: onViewProfile ? "pointer" : "default", color: onViewProfile ? "var(--accent)" : "var(--text)" }}
                    onClick={() => onViewProfile?.(p)}
                  >{p.name}</span>
                  <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
                  <TrendPill player={p} />
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  <StatusDot status={p.status} />
                  {p.team} · <span style={{ textTransform: "capitalize" }}>{p.status}</span>
                </div>
              </div>
            </div>

            {/* Right: stats + add */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", color: "var(--accent)" }}>{p.stats?.proj || 0}</div>
                <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Proj</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{p.stats?.avg || 0}</div>
                <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Avg</div>
              </div>
              {onRoster
                ? <button className="drop-btn" onClick={() => onDrop(p)}>Drop</button>
                : <button className="add-btn" onClick={() => onAdd(p)}>Add</button>
              }
            </div>
          </div>
        </div>
        )
      })}
    </div>,
    document.body
  )
}

export function SelectDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const [dropStyle, setDropStyle] = useState({})
  const btnRef = useRef(null)


useEffect(() => {
    function handleClick() { setOpen(false) }
    if (open) document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [open])

  const selected = options.find(o => o.value === value)

function handleOpen(e) {
  e.stopPropagation()
  if (!open && btnRef.current) {
    const rect = btnRef.current.getBoundingClientRect()
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999
    })
  }
  setOpen(o => !o)
}
  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "var(--text)",
          borderRadius: 6,
          padding: "9px 14px",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "border-color 0.15s",
          whiteSpace: "nowrap"
        }}
      >
        {selected?.label}
        <span style={{ color: "var(--muted)", fontSize: 10 }}>▼</span>
      </button>

      {open && createPortal(
        <div style={{
          ...dropStyle,
          background: "#111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
        }}>
          {options.map((o, i) => (
            <div key={i}
              onClick={() => { onChange(o.value); setOpen(false) }}
              style={{
                padding: "10px 14px",
                fontSize: 13,
                color: o.value === value ? "var(--accent)" : "var(--text)",
                background: o.value === value ? "rgba(245,166,35,0.08)" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
                borderBottom: "1px solid rgba(255,255,255,0.04)"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = o.value === value ? "rgba(245,166,35,0.08)" : "transparent"}
            >
              {o.label}
            </div>
          ))}
        </div>,
        document.getElementById("portal")
      )}
    </>
  )
}