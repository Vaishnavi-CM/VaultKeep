import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiHome, FiBookOpen, FiCreditCard, FiLock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const STATIC_PAGES = [
  { label: "Home", to: "/", icon: FiHome, public: true },
  { label: "Learn", to: "/learn", icon: FiBookOpen, public: false },
  { label: "Wallet Design", to: "/wallet", icon: FiCreditCard, public: false },
  { label: "My Vault", to: "/dashboard", icon: FiLock, public: false },
];

// Press Ctrl+K (or Cmd+K on Mac) anywhere to open. A fast way to jump
// between sections without hunting through the navbar.
export default function CommandPalette() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, openAuthGate, paletteOpen, closePalette } = useAuth();

  useEffect(() => {
    if (!paletteOpen) setQuery("");
  }, [paletteOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return STATIC_PAGES.filter((p) => p.label.toLowerCase().includes(q));
  }, [query]);

  function go(page) {
    closePalette();
    if (!page.public && !user) {
      openAuthGate("login");
      return;
    }
    navigate(page.to);
  }

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-[70] flex items-start justify-center pt-[15vh] px-4"
          onClick={closePalette}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <FiSearch className="text-mist shrink-0" size={16} />
              <input
                autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <kbd className="text-xs text-mist/60 border border-line rounded px-1.5 py-0.5">Esc</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto py-2">
              {results.length === 0 && <p className="px-4 py-3 text-sm text-mist">No matches.</p>}
              {results.map((p) => (
                <button
                  key={p.to} onClick={() => go(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-panel2 transition-colors"
                >
                  <p.icon size={15} className="text-cyan" /> {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
