// ========================= UI SYSTEM =========================

// Overlay (tối + blur nền kiểu Apple)
const overlay = document.createElement("div");
Object.assign(overlay.style, {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(1px)",
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.4s ease",
  zIndex: 998,
});
document.body.appendChild(overlay);

// Container chứa 2 panel
const panelContainer = document.createElement("div");
Object.assign(panelContainer.style, {
  position: "fixed",
  left: "50%",
  bottom: "-600px",
  transform: "translateX(-50%)",
  width: "90%",
  maxWidth: "900px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  transition: "bottom 0.6s cubic-bezier(.22,1,.36,1)",
  zIndex: 999,
});
document.body.appendChild(panelContainer);

// ===== PANEL NHỎ =====
const smallPanel = document.createElement("div");
Object.assign(smallPanel.style, {
  background: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "30px",
  padding: "18px 30px",
  color: "white",
  fontSize: "18px",
  fontWeight: "600",
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
});
panelContainer.appendChild(smallPanel);

// ===== PANEL LỚN =====
const largePanel = document.createElement("div");
Object.assign(largePanel.style, {
  background: "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "40px",
  padding: "40px",
  color: "white",
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  lineHeight: "1.7",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
});
panelContainer.appendChild(largePanel);

// ========================= FUNCTIONS =========================

export function openPanel(title, content) {
  smallPanel.innerHTML = title;
  largePanel.innerHTML = content;

  panelContainer.style.bottom = "40px";
  overlay.style.opacity = 1;
  overlay.style.pointerEvents = "auto";
}

export function closePanel() {
  panelContainer.style.bottom = "-600px";
  overlay.style.opacity = 0;
  overlay.style.pointerEvents = "none";
}

export { overlay };