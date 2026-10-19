import { useRef, useState } from "react";
import { motion } from "framer-motion";

// A genuine full-360 orbitable 3D box (six real faces via CSS 3D transforms,
// not a two-sided flip card) -- drag freely on both axes, like rotating a
// product photo on Amazon/Flipkart's 360 viewer. Color swatches restyle the
// faces live.

const COLORS = [
  { name: "Midnight", hex: "#151b2e", accent: "#00d9c0" },
  { name: "Charcoal", hex: "#2a2a2e", accent: "#7c5cff" },
  { name: "Deep Teal", hex: "#0f2e2c", accent: "#00d9c0" },
  { name: "Oxblood", hex: "#2e1420", accent: "#ff6b6b" },
  { name: "Sand", hex: "#3a3226", accent: "#e8c07d" },
];

export default function WalletProduct3D({ label, width = 200, height = 130, depth = 16 }) {
  const [rot, setRot] = useState({ x: -18, y: -28 });
  const [color, setColor] = useState(COLORS[0]);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  function onDown(e) {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }
  function onMove(e) {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setRot((r) => ({
      x: Math.max(-70, Math.min(70, r.x - dy * 0.4)),
      y: r.y + dx * 0.4,
    }));
  }
  function onUp() {
    dragging.current = false;
  }

  const faceStyle = {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.15)",
    background: `linear-gradient(135deg, ${color.hex}, ${color.hex}dd)`,
  };

  return (
    <div>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="relative h-64 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ perspective: 900 }}
      >
        <motion.div
          animate={{ rotateX: rot.x, rotateY: rot.y }}
          transition={{ type: dragging.current ? false : "spring", stiffness: 60, damping: 14 }}
          style={{ transformStyle: "preserve-3d", width, height, position: "relative" }}
        >
          {/* front */}
          <div style={{ ...faceStyle, width, height, transform: `translateZ(${depth / 2}px)`, borderRadius: 10 }}>
            <span className="font-display font-semibold text-sm" style={{ color: color.accent }}>VaultKeep</span>
          </div>
          {/* back */}
          <div style={{ ...faceStyle, width, height, transform: `translateZ(-${depth / 2}px) rotateY(180deg)`, borderRadius: 10 }}>
            <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>CONCEPT — NOT A REAL PRODUCT</span>
          </div>
          {/* top */}
          <div style={{ ...faceStyle, width, height: depth, transform: `rotateX(90deg) translateZ(${height / 2}px)` }} />
          {/* bottom */}
          <div style={{ ...faceStyle, width, height: depth, transform: `rotateX(-90deg) translateZ(${height / 2}px)` }} />
          {/* left */}
          <div style={{ ...faceStyle, width: depth, height, transform: `rotateY(-90deg) translateZ(${width / 2}px)` }} />
          {/* right */}
          <div style={{ ...faceStyle, width: depth, height, transform: `rotateY(90deg) translateZ(${width / 2}px)` }} />
        </motion.div>
      </div>
      <p className="text-center text-xs text-mist/60 -mt-1 mb-3">Drag to rotate 360°</p>

      <div className="flex items-center justify-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => setColor(c)}
            title={c.name}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{ background: c.hex, borderColor: color.name === c.name ? c.accent : "transparent" }}
            aria-label={`Color: ${c.name}`}
          />
        ))}
      </div>
      <p className="text-center text-[11px] text-mist mt-1.5">{color.name}</p>
    </div>
  );
}
