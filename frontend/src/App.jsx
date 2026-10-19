import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Learn from "./pages/Learn.jsx";
import WalletDesign from "./pages/WalletDesign.jsx";
import Chatbot from "./components/Chatbot.jsx";
import UnlockVault from "./components/UnlockVault.jsx";
import AuthGateModal from "./components/AuthGateModal.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const IDLE_LOCK_MS = 5 * 60 * 1000; // auto-lock the vault after 5 minutes of inactivity

// Requires login only (no vault key) -- used for pages with no personal
// encrypted data, like the study guide.
function GatedRoute({ children }) {
  const { user, loading, openAuthGate } = useAuth();
  useEffect(() => {
    if (!loading && !user) openAuthGate("login");
  }, [loading, user]);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// Requires login AND an unlocked vault key -- used for pages with
// encrypted personal data.
function ProtectedRoute({ children }) {
  const { user, vaultKey, loading, openAuthGate } = useAuth();
  useEffect(() => {
    if (!loading && !user) openAuthGate("login");
  }, [loading, user]);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (!vaultKey) return <UnlockVault />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink text-mist">
      Loading your session…
    </div>
  );
}

// Auto-locks the vault after a period of inactivity, clearing just the
// in-memory vault key (not the whole session) -- see softLock in
// AuthContext. Only runs while a vault key actually exists to protect.
function useIdleLock() {
  const { vaultKey, softLock } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!vaultKey) return;

    function resetTimer() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(softLock, IDLE_LOCK_MS);
    }

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [vaultKey, softLock]);
}

function useCommandPaletteShortcut() {
  const { togglePalette } = useAuth();
  useEffect(() => {
    function handleKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [togglePalette]);
}

export default function App() {
  useIdleLock();
  useCommandPaletteShortcut();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/learn" element={<GatedRoute><Learn /></GatedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletDesign /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
      <AuthGateModal />
      <CommandPalette />
    </>
  );
}
