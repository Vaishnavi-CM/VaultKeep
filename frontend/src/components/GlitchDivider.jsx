import { useState } from "react";
import { motion } from "framer-motion";

// A lightweight, CSS-only take on the RGB-split "glitch cut" transition
// style (seen in agency showreels) -- plays once when scrolled into view.
// No WebGL/shaders needed: it's a text element duplicated three times in
// red/cyan/white, briefly offset and clipped, then settling into place.
export default function GlitchDivider({ text }) {
  const [played, setPlayed] = useState(false);

  return (
    <motion.div
      onViewportEnter={() => setPlayed(true)}
      viewport={{ once: true, amount: 0.6 }}
      className="relative py-16 flex items-center justify-center overflow-hidden"
    >
      <div className="relative font-display text-3xl md:text-5xl font-bold tracking-tight">
        <GlitchLayer text={text} played={played} color="#ff2d55" offset={-1} delay={0} />
        <GlitchLayer text={text} played={played} color="#00d9c0" offset={1} delay={0.04} />
        <span className="relative text-cloud">{text}</span>
      </div>
    </motion.div>
  );
}

function GlitchLayer({ text, played, color, offset, delay }) {
  return (
    <motion.span
      aria-hidden
      className="absolute inset-0"
      style={{ color, mixBlendMode: "screen" }}
      initial={{ x: 0, opacity: 0, clipPath: "inset(0 0 0 0)" }}
      animate={
        played
          ? {
              x: [0, offset * 14, offset * -6, 0],
              opacity: [0, 0.9, 0.9, 0],
              clipPath: [
                "inset(10% 0 60% 0)",
                "inset(60% 0 5% 0)",
                "inset(20% 0 40% 0)",
                "inset(0 0 100% 0)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.5, delay, times: [0, 0.3, 0.7, 1], ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}
