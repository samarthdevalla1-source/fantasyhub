import { createPortal } from "react-dom"

export default function Dropdown({ results, onAdd, style }) {
  return createPortal(
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      pointerEvents: "none"
    }}>
      <div style={{
        position: "absolute",
        pointerEvents: "all",
        background: "#111",
        ...style
      }}>
        {results.map((p, i) => (
          <div key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`pos-badge pos-${p.position}`}>{p.position}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.stats?.avg || 0} avg pts</div>
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