import { createPortal } from "react-dom"
import { useState, useRef, useEffect } from "react"

export function SearchDropdown({ results, onAdd }) {
  return createPortal(
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      pointerEvents: "none"
    }}>
      <div id="dropdown-anchor" style={{
        position: "absolute",
        pointerEvents: "all"
      }}>
        {results.map((p, i) => (
          <div key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "#111",
              cursor: "pointer",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            onMouseLeave={e => e.currentTarget.style.background = "#111"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.team} · {p.stats?.avg || 0} avg pts</div>
              </div>
            </div>
            <button className="add-btn" onClick={() => onAdd(p)}>Add</button>
          </div>
        ))}
      </div>
    </div>,
    document.getElementById("portal")
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