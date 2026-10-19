import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiRotateCw } from "react-icons/fi";

export default function Flashcards({ deck }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[index];

  function go(delta) {
    setFlipped(false);
    setIndex((i) => (i + delta + deck.length) % deck.length);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="perspective-1000 w-full max-w-md h-56">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full cursor-pointer preserve-3d relative"
            onClick={() => setFlipped((f) => !f)}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute inset-0 preserve-3d"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* front */}
              <div
                className="absolute inset-0 backface-hidden rounded-2xl border border-line bg-panel p-6 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-xs font-mono text-violet mb-3">QUESTION</span>
                <p className="font-display text-lg">{card.q}</p>
                <span className="text-xs text-mist mt-4">Click to flip</span>
              </div>
              {/* back */}
              <div
                className="absolute inset-0 backface-hidden rounded-2xl border border-cyan/40 bg-panel2 p-6 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <span className="text-xs font-mono text-cyan mb-3">ANSWER</span>
                <p className="text-sm text-cloud leading-relaxed">{card.a}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 mt-5">
        <button onClick={() => go(-1)} className="p-2 rounded-lg border border-line hover:border-cyan/50 transition-colors">
          <FiChevronLeft />
        </button>
        <span className="text-xs text-mist font-mono">{index + 1} / {deck.length}</span>
        <button onClick={() => setFlipped((f) => !f)} className="p-2 rounded-lg border border-line hover:border-cyan/50 transition-colors">
          <FiRotateCw />
        </button>
        <button onClick={() => go(1)} className="p-2 rounded-lg border border-line hover:border-cyan/50 transition-colors">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
