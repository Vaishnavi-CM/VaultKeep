import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import AuthForms from "./AuthForms.jsx";

// Shown when a logged-out visitor clicks a gated nav link (anything
// besides Home). Instead of navigating away, this pops up over the
// current page so they can log in or create a vault without losing their
// place.
export default function AuthGateModal() {
  const { authGate, closeAuthGate } = useAuth();

  return (
    <AnimatePresence>
      {authGate && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/85 backdrop-blur-md z-[60] flex items-center justify-center px-4"
          onClick={closeAuthGate}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-panel border border-line rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-display font-semibold text-lg">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-ink">
                  <FiShield size={16} />
                </span>
                VaultKeep
              </div>
              <button onClick={closeAuthGate} className="text-mist hover:text-cloud transition-colors">
                <FiX size={18} />
              </button>
            </div>
            <p className="text-sm text-mist mb-5">Log in or create a vault to continue.</p>
            <AuthForms initialTab={authGate} onSuccess={closeAuthGate} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
