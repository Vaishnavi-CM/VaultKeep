import { useState } from "react";
import { motion } from "framer-motion";
import { FiLock, FiAlertCircle } from "react-icons/fi";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import { deriveFromPassword, unwrapVaultKey } from "../utils/vaultCrypto";

// Shown when a valid session (JWT) exists but the in-memory vault key is
// gone -- happens on every page refresh AND after the auto-lock timer
// fires (see useIdleLock in App.jsx), both by design. Re-entering the
// master password re-derives the wrapping key locally, fetches the
// wrapped vault key (already stored from registration), and unwraps it --
// no full re-login needed since the session is still valid.
export default function UnlockVault() {
  const { user, unlock, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/auth/vault-key");
      const { wrappingKey } = await deriveFromPassword(password, data.salt);
      // Throws if the password is wrong (AES-GCM auth tag mismatch) --
      // that's our correctness check, no separate server round trip needed.
      const vaultKey = await unwrapVaultKey(wrappingKey, data.vaultKeyWrappedByPassword);
      unlock(vaultKey);
    } catch (err) {
      setError("That master password doesn't match this account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 bg-grid bg-[size:44px_44px]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="bg-panel border border-line rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center mb-5">
            <FiLock className="text-ink" size={20} />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1">Vault locked</h1>
          <p className="text-mist text-sm mb-6">
            Welcome back, {user?.name?.split(" ")[0]}. Your vault's encryption key isn't kept in this
            browser between sessions or after a period of inactivity — re-enter your master password
            to unlock it.
          </p>

          {error && (
            <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 mb-4">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password" required autoFocus value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
              placeholder="Master password"
            />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors disabled:opacity-60">
              {loading ? "Unlocking…" : "Unlock vault"}
            </button>
          </form>

          <button onClick={logout} className="w-full text-center text-xs text-mist hover:text-cloud transition-colors mt-4">
            Not you? Log out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
