import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield } from "react-icons/fi";

// A technical "blueprint" style diagram -- dark navy background, white/cyan
// line-art, dimension arrows with measurements, labeled interior
// compartments -- same genre as an engineering spec sheet. Toggle between
// "Closed" and "Interior" to see the compartment layout, similar to a
// front-view / cutaway-view pair on a real spec drawing.

const BLUEPRINTS = {
  pocket: {
    title: "Bifold — Pocket Carry",
    closedDims: { w: "95mm", h: "115mm" },
    openDims: { w: "185mm", h: "115mm" },
    compartments: [
      { key: "id", label: "ID SLOT — PULL-TAB", x: 30, y: 20, w: 90, h: 40, tab: true,
        why: "A dedicated tab means one quick pull gets your ID out — no fumbling through a stack while standing on a moving bus." },
      { key: "cards", label: "CARD SLEEVES ×3", x: 30, y: 68, w: 90, h: 55, stripes: 3,
        why: "Separated sleeves keep everyday cards distinct from your ID, so you're not searching past them when you're in a hurry." },
      { key: "shield", label: "RFID-SHIELDED POCKET", x: 130, y: 20, w: 100, h: 45, shielded: true,
        why: "Blocks wireless skimming of tap-to-pay cards without needing to remove them from the wallet at all." },
      { key: "cash", label: "CASH FOLD", x: 130, y: 73, w: 100, h: 50,
        why: "A separate fold keeps cash from bulking out the card side, and stops notes sliding out with a card by accident." },
    ],
  },
  bag: {
    title: "Slim Clutch — Bag Carry",
    closedDims: { w: "160mm", h: "80mm" },
    openDims: { w: "230mm", h: "130mm" },
    compartments: [
      { key: "id", label: "ID SLOT — PULL-TAB", x: 25, y: 18, w: 95, h: 38, tab: true,
        why: "Same quick-access idea as the pocket version — reaching into a bag is already slower, so the ID shouldn't add a second delay." },
      { key: "shield", label: "RFID-SHIELDED POCKET", x: 25, y: 62, w: 95, h: 55, shielded: true,
        why: "A bag sits closer to crowds for longer stretches (queues, transit), so shielding matters even more here." },
      { key: "coin", label: "COIN POCKET (ZIP)", x: 135, y: 18, w: 90, h: 45, rounded: true,
        why: "Loose change has nowhere to escape to in a bag's main compartment, so a zipped pocket keeps it contained." },
      { key: "cash", label: "CASH FOLD", x: 135, y: 70, w: 90, h: 47,
        why: "Kept flat and separate so bag contents don't crease or bend cash over time." },
    ],
  },
};

export default function WalletBlueprint({ variant }) {
  const data = BLUEPRINTS[variant];
  const [view, setView] = useState("closed"); // "closed" | "open"
  const [hovered, setHovered] = useState(null);

  return (
    <div className="rounded-xl border border-line overflow-hidden" style={{ background: "#0a1628" }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="text-[10px] font-mono text-cyan tracking-widest">{data.title.toUpperCase()}</span>
        <div className="flex gap-1 bg-black/30 rounded-md p-0.5">
          {["closed", "open"].map((v) => (
            <button
              key={v} onClick={() => setView(v)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded transition-colors ${
                view === v ? "bg-cyan text-ink" : "text-white/50 hover:text-white/80"
              }`}
            >
              {v === "closed" ? "CLOSED" : "INTERIOR"}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 260 170" className="w-full h-56">
        <defs>
          <pattern id={`grid-${variant}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="rgba(255,255,255,0.08)" />
          </pattern>
          <marker id={`arrow-${variant}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke="white" strokeWidth="1.5" />
          </marker>
        </defs>
        <rect width="260" height="170" fill={`url(#grid-${variant})`} />

        <AnimatePresence mode="wait">
          {view === "closed" ? (
            <motion.g key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <rect x="65" y="30" width="130" height="90" rx="6" fill="none" stroke="white" strokeWidth="1.2" />
              <line x1="130" y1="30" x2="130" y2="120" stroke="white" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5" />
              {/* width dimension */}
              <line x1="65" y1="135" x2="195" y2="135" stroke="white" strokeWidth="0.8"
                markerStart={`url(#arrow-${variant})`} markerEnd={`url(#arrow-${variant})`} />
              <text x="130" y="147" textAnchor="middle" fontSize="7" fill="white" fontFamily="monospace">{data.closedDims.w}</text>
              {/* height dimension */}
              <line x1="210" y1="30" x2="210" y2="120" stroke="white" strokeWidth="0.8"
                markerStart={`url(#arrow-${variant})`} markerEnd={`url(#arrow-${variant})`} />
              <text x="219" y="78" textAnchor="middle" fontSize="7" fill="white" fontFamily="monospace" transform="rotate(90 219 78)">{data.closedDims.h}</text>
              <text x="130" y="20" textAnchor="middle" fontSize="7" fill="#00d9c0" fontFamily="monospace" letterSpacing="1">FOLDED SILHOUETTE</text>
            </motion.g>
          ) : (
            <motion.g key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <rect x="15" y="10" width="230" height="130" rx="6" fill="none" stroke="white" strokeWidth="1.2" />
              {data.compartments.map((c) => (
                <g key={c.key} onMouseEnter={() => setHovered(c.key)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                  <rect
                    x={c.x} y={c.y} width={c.w} height={c.h}
                    rx={c.rounded ? 10 : 3}
                    fill={hovered === c.key ? "rgba(0,217,192,0.12)" : "none"}
                    stroke={hovered === c.key ? "#00d9c0" : c.shielded ? "#7c5cff" : "white"}
                    strokeWidth="1"
                    strokeDasharray={c.shielded ? "3,2" : undefined}
                  />
                  {c.tab && (
                    <rect x={c.x - 6} y={c.y + c.h / 2 - 6} width="8" height="12" rx="2" fill="none" stroke="white" strokeWidth="0.8" />
                  )}
                  {c.stripes &&
                    Array.from({ length: c.stripes }).map((_, i) => (
                      <line key={i} x1={c.x + 6} y1={c.y + 14 + i * 14} x2={c.x + c.w - 6} y2={c.y + 14 + i * 14} stroke="white" strokeWidth="0.6" opacity="0.5" />
                    ))}
                  <text x={c.x + c.w / 2} y={c.y + c.h + 9} textAnchor="middle" fontSize="5.5" fill={hovered === c.key ? "#00d9c0" : "rgba(255,255,255,0.75)"} fontFamily="monospace">
                    {c.label}
                  </text>
                </g>
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] font-mono text-white/50">
        <span>SCALE 1:2 · TOLERANCE ±2mm</span>
        <span className="flex items-center gap-1"><FiShield size={10} className="text-violet" /> shielded pocket</span>
      </div>

      {view === "open" && (
        <div className="px-4 py-3 border-t border-white/10 bg-black/20 min-h-[52px]">
          {hovered ? (
            <p className="text-xs text-cyan leading-relaxed">
              <span className="font-mono text-[10px] text-cyan/70 block mb-0.5">
                {data.compartments.find((c) => c.key === hovered)?.label}
              </span>
              {data.compartments.find((c) => c.key === hovered)?.why}
            </p>
          ) : (
            <p className="text-xs text-white/40">Hover a compartment above to see why it's designed that way.</p>
          )}
        </div>
      )}
    </div>
  );
}
