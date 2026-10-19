import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { FiShield, FiLogOut, FiPlus, FiCommand, FiChevronDown } from "react-icons/fi";
import VaultForm from "./VaultForm.jsx";
import api from "../utils/api";
import { encryptField } from "../utils/vaultCrypto";

const NAV_LINKS = [
  { to: "/", label: "Home", public: true },
  { to: "/learn", label: "Learn", public: false },
  { to: "/wallet", label: "Wallet Design", public: false },
  { to: "/dashboard", label: "My Vault", public: false },
];

export default function Navbar() {
  const { user, vaultKey, logout, openAuthGate, togglePalette } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  function handleNavClick(e, link) {
    if (link.public || user) return; // normal navigation
    e.preventDefault();
    openAuthGate("login");
  }

  async function handleQuickAdd(form) {
    try {
      const payload = {
        ...form,
        password: await encryptField(vaultKey, form.password),
        notes: form.notes ? await encryptField(vaultKey, form.notes) : "",
      };
      await api.post("/vault", payload);
      setShowQuickAdd(false);
      navigate("/dashboard");
    } catch {
      alert("Could not save this entry.");
    }
  }

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-ink/70 border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-ink">
            <FiShield size={16} />
          </span>
          VaultKeep
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to} to={link.to} onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  active ? "text-cyan bg-cyan/10" : "text-mist hover:text-cloud"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePalette}
            className="hidden sm:flex items-center gap-1.5 text-xs text-mist px-3 py-2 rounded-lg border border-line hover:border-cyan/40 hover:text-cyan transition-colors"
            title="Search (Ctrl+K)"
          >
            <FiCommand size={12} /> <span className="font-mono">Ctrl K</span>
          </button>

          {user && (
            <button
              onClick={() => setShowQuickAdd(true)}
              className="p-2 rounded-lg bg-cyan text-ink hover:bg-cyan-dim transition-colors"
              aria-label="Quick add password"
              title="Quick add password"
            >
              <FiPlus size={16} />
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-line hover:border-cyan/40 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-ink text-xs font-semibold">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </span>
                <FiChevronDown size={12} className="text-mist" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-panel border border-line rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-line">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-mist truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); navigate("/"); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-mist hover:text-red-400 hover:bg-panel2 transition-colors"
                    >
                      <FiLogOut size={14} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm px-4 py-2 rounded-lg hover:text-cyan transition-colors">Log in</Link>
              <Link to="/register" className="text-sm px-4 py-2 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      {showQuickAdd && (
        <VaultForm onClose={() => setShowQuickAdd(false)} onSubmit={handleQuickAdd} />
      )}
    </nav>
  );
}
