import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("vaultkeep_user");
    return raw ? JSON.parse(raw) : null;
  });
  // vaultKey is a CryptoKey -- deliberately kept ONLY in memory (React
  // state), never in localStorage/sessionStorage. Lost on refresh AND on
  // auto-lock (softLock) by design -- see UnlockVault.jsx.
  const [vaultKey, setVaultKey] = useState(null);
  const [loading, setLoading] = useState(true);
  // Controls the login/register popup shown when a logged-out visitor
  // clicks a gated nav link, instead of navigating away from the page.
  const [authGate, setAuthGate] = useState(null); // null | "login" | "register"
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vaultkeep_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("vaultkeep_user", JSON.stringify(data.user));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData, derivedVaultKey) {
    localStorage.setItem("vaultkeep_token", token);
    localStorage.setItem("vaultkeep_user", JSON.stringify(userData));
    setUser(userData);
    setVaultKey(derivedVaultKey);
  }

  // Re-supplies the in-memory vault key after it was cleared (refresh or
  // auto-lock) without a full re-login -- the session (JWT) is still valid.
  function unlock(derivedVaultKey) {
    setVaultKey(derivedVaultKey);
  }

  // Clears just the vault key, keeping the session alive -- used for
  // auto-lock after inactivity. The UnlockVault screen will ask for the
  // master password again to restore vaultKey.
  const softLock = useCallback(() => setVaultKey(null), []);

  function logout() {
    localStorage.removeItem("vaultkeep_token");
    localStorage.removeItem("vaultkeep_user");
    setUser(null);
    setVaultKey(null);
  }

  function openAuthGate(mode = "login") {
    setAuthGate(mode);
  }
  function closeAuthGate() {
    setAuthGate(null);
  }
  const togglePalette = useCallback(() => setPaletteOpen((o) => !o), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user, vaultKey, login, unlock, softLock, logout, loading,
        authGate, openAuthGate, closeAuthGate,
        paletteOpen, togglePalette, closePalette,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
