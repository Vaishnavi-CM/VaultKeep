import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";

// Signature element: a layered 3D "vault dial" made of concentric rotating
// rings (pure CSS 3D transforms, no WebGL needed) with a handful of
// floating "keycard" chips orbiting it representing saved entries. The
// whole thing tilts gently toward the cursor for a subtle parallax feel.
export default function Hero3D() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: py * -12, y: px * 16 });
    }
    const el = ref.current;
    el?.addEventListener("mousemove", handleMove);
    return () => el?.removeEventListener("mousemove", handleMove);
  }, []);

  const chips = [
    { label: "netflix.com", top: "6%", left: "-8%", delay: 0 },
    { label: "github.com", top: "70%", left: "-14%", delay: 0.4 },
    { label: "bank••••", top: "12%", left: "88%", delay: 0.8 },
    { label: "gmail.com", top: "76%", left: "92%", delay: 1.2 },
  ];

  return (
    <div
      ref={ref}
      className="relative w-full h-[420px] md:h-[520px] perspective-1000 flex items-center justify-center select-none"
    >
      {/* ambient glow */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan/20 blur-[100px]" />
      <div className="absolute w-72 h-72 rounded-full bg-violet/20 blur-[110px] translate-x-20" />

      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 60, damping: 12 }}
        className="relative preserve-3d w-64 h-64 md:w-80 md:h-80"
      >
        {/* outer ring */}
        <div className="absolute inset-0 rounded-full border border-cyan/30 animate-spinSlow preserve-3d">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan shadow-glow" />
        </div>
        {/* middle ring, opposite spin, offset in Z for depth */}
        <div
          className="absolute inset-6 rounded-full border border-violet/40 preserve-3d"
          style={{ animation: "spinSlow 12s linear infinite reverse", transform: "translateZ(30px)" }}
        >
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-violet shadow-glowViolet" />
        </div>
        {/* core vault */}
        <div
          className="absolute inset-16 rounded-full bg-gradient-to-br from-panel2 to-panel border border-line flex items-center justify-center shadow-2xl"
          style={{ transform: "translateZ(60px)" }}
        >
          <FiLock className="text-cyan drop-shadow-[0_0_12px_rgba(0,217,192,0.6)]" size={42} />
        </div>

        {/* floating keycards representing saved entries */}
        {chips.map((c) => (
          <motion.div
            key={c.label}
            className="absolute px-3 py-1.5 rounded-lg bg-panel/90 border border-line text-xs font-mono text-mist shadow-lg backdrop-blur-sm"
            style={{ top: c.top, left: c.left, transform: "translateZ(90px)" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {c.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
