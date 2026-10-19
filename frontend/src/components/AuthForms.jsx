import { useRef, useState } from "react";
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiCopy, FiKey } from "react-icons/fi";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import { scorePassword } from "../utils/password";
import CaptchaChallenge from "./CaptchaChallenge.jsx";
import {
  generateSaltHex, generateRecoveryKey, deriveFromPassword, deriveFromRecoveryKey,
  generateVaultKey, wrapVaultKey, unwrapVaultKey,
} from "../utils/vaultCrypto";
// Shared form logic for login, register, and forgot-password -- used both
// as a full page (Login.jsx / Register.jsx) and inside the popup gate
// (AuthGateModal.jsx) so the logic only exists in one place.
export default function AuthForms({ initialTab = "login", onSuccess }) {
  const [tab, setTab] = useState(initialTab); // "login" | "register" | "forgot"
  const { login } = useAuth();

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-panel2 rounded-lg p-1">
        {["login", "register"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-sm py-2 rounded-md transition-colors capitalize ${
              tab === t ? "bg-cyan text-ink font-medium" : "text-mist hover:text-cloud"
            }`}
          >
            {t === "login" ? "Log in" : "Create vault"}
          </button>
        ))}
      </div>

      {tab === "login" && <LoginForm onSuccess={onSuccess} onForgot={() => setTab("forgot")} />}
      {tab === "register" && <RegisterForm onSuccess={onSuccess} />}
      {tab === "forgot" && <ForgotPasswordForm onSuccess={onSuccess} onBack={() => setTab("login")} />}
    </div>
  );
}

function LoginForm({ onSuccess, onForgot }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: saltData } = await api.get("/auth/salt", { params: { email: form.email } });
      const { authKeyHex, wrappingKey } = await deriveFromPassword(form.password, saltData.salt);
      const captchaPayload = captchaRef.current?.getPayload();

      const { data } = await api.post("/auth/login", {
        email: form.email,
        authKey: authKeyHex,
        ...captchaPayload,
      });

      const vaultKey = await unwrapVaultKey(wrappingKey, data.vaultKeyWrappedByPassword);
      login(data.token, data.user, vaultKey);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Could not log in. Try again.");
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2">
          <FiAlertCircle size={14} /> {error}
        </div>
      )}
      <div>
        <label className="text-xs text-mist mb-1 block">Email</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={16} />
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-panel2 border border-line rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-mist mb-1 block">Master password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={16} />
          <input
            type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-panel2 border border-line rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>
      <CaptchaChallenge ref={captchaRef} />
      <button
        type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors disabled:opacity-60"
      >
        {loading ? "Unlocking…" : "Log in"}
      </button>
      <button type="button" onClick={onForgot} className="w-full text-center text-xs text-mist hover:text-cyan transition-colors">
        Forgot your master password?
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const captchaRef = useRef(null);
  const pendingLoginRef = useRef(null);
  const { login } = useAuth();
  const strength = scorePassword(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const salt = generateSaltHex();
      const recovery = generateRecoveryKey();
      const recoverySalt = generateSaltHex();

      const { authKeyHex, wrappingKey: wrapByPassword } = await deriveFromPassword(form.password, salt);
      const { authKeyHex: recoveryAuthKeyHex, wrappingKey: wrapByRecovery } = await deriveFromRecoveryKey(recovery, recoverySalt);
      const { cryptoKey: vaultKey, rawBytes: vaultKeyRaw } = await generateVaultKey();
      const vaultKeyWrappedByPassword = await wrapVaultKey(wrapByPassword, vaultKeyRaw);
      const vaultKeyWrappedByRecovery = await wrapVaultKey(wrapByRecovery, vaultKeyRaw);
      const captchaPayload = captchaRef.current?.getPayload();

      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        authKey: authKeyHex,
        salt,
        vaultKeyWrappedByPassword,
        recoveryAuthKey: recoveryAuthKeyHex,
        recoverySalt,
        vaultKeyWrappedByRecovery,
        ...captchaPayload,
      });

      // Don't log the user in yet -- first make them see and confirm the
      // recovery key, since it's shown exactly once and can't be retrieved
      // again later.
      pendingLoginRef.current = { token: data.token, user: data.user, vaultKey };
      setRecoveryKey(recovery);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create your account.");
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  }

  function finishRegistration() {
    const pending = pendingLoginRef.current;
    if (pending) login(pending.token, pending.user, pending.vaultKey);
    onSuccess?.();
  }

  function copyRecoveryKey() {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (recoveryKey) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-cyan">
          <FiKey size={18} />
          <h3 className="font-display font-semibold">Save your recovery key</h3>
        </div>
        <p className="text-sm text-mist">
          This is the <strong className="text-cloud">only</strong> way to get back into your vault if
          you forget your master password. We can't show it again — save it somewhere safe right now
          (a password manager, a printed note, anywhere except this browser).
        </p>
        <div className="bg-panel2 border border-cyan/30 rounded-lg px-4 py-3 font-mono text-sm text-cyan break-all text-center">
          {recoveryKey}
        </div>
        <button
          type="button" onClick={copyRecoveryKey}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-line hover:border-cyan/50 text-sm transition-colors"
        >
          {copied ? <FiCheckCircle className="text-cyan" size={14} /> : <FiCopy size={14} />}
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <label className="flex items-start gap-2 text-sm text-mist cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />
          I've saved this recovery key somewhere safe. I understand VaultKeep cannot recover my vault without it.
        </label>
        <button
          onClick={finishRegistration} disabled={!confirmed}
          className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to my vault
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2">
          <FiAlertCircle size={14} /> {error}
        </div>
      )}
      <div>
        <label className="text-xs text-mist mb-1 block">Name</label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={16} />
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-panel2 border border-line rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            placeholder="Ada Lovelace" />
        </div>
      </div>
      <div>
        <label className="text-xs text-mist mb-1 block">Email</label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={16} />
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-panel2 border border-line rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label className="text-xs text-mist mb-1 block">Master password</label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={16} />
          <input type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-panel2 border border-line rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            placeholder="At least 8 characters" />
        </div>
        {form.password && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-panel2 overflow-hidden flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 rounded-full transition-colors"
                  style={{ backgroundColor: i <= strength.score ? strength.color : "#1e2635" }} />
              ))}
            </div>
            <span className="text-xs mt-1 block" style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}
      </div>
      <CaptchaChallenge ref={captchaRef} />
      <button type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors disabled:opacity-60">
        {loading ? "Encrypting & creating vault…" : "Create vault"}
      </button>
    </form>
  );
}

function ForgotPasswordForm({ onSuccess, onBack }) {
  const [step, setStep] = useState("enter"); // "enter" | "reset"
  const [email, setEmail] = useState("");
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const recoveredRef = useRef(null); // { resetToken, vaultKeyRaw }
  const { login } = useAuth();
  const strength = scorePassword(newPassword);

  async function handleRecover(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: saltData } = await api.get("/auth/recovery-salt", { params: { email } });
      const { authKeyHex, wrappingKey } = await deriveFromRecoveryKey(recoveryKeyInput, saltData.recoverySalt);
      const captchaPayload = captchaRef.current?.getPayload();

      const { data } = await api.post("/auth/recover", {
        email,
        recoveryAuthKey: authKeyHex,
        ...captchaPayload,
      });

      // If the recovery key was wrong, this next line throws (AES-GCM
      // auth tag mismatch) -- that's our built-in correctness check.
      const vaultKey = await unwrapVaultKey(wrappingKey, data.vaultKeyWrappedByRecovery);
      recoveredRef.current = { resetToken: data.resetToken, vaultKey };
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.error || "That email and recovery key don't match.");
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { resetToken, vaultKey } = recoveredRef.current;
      const newSalt = generateSaltHex();
      const { authKeyHex: newAuthKeyHex, wrappingKey: newWrap } = await deriveFromPassword(newPassword, newSalt);

      // We need the raw vault key bytes to re-wrap it -- export the
      // CryptoKey we recovered back to raw bytes for this one operation.
      const rawBits = await crypto.subtle.exportKey("raw", vaultKey);
      const newVaultKeyWrappedByPassword = await wrapVaultKey(newWrap, new Uint8Array(rawBits));

      const { data } = await api.post("/auth/reset-with-recovery", {
        resetToken, newAuthKey: newAuthKeyHex, newSalt, newVaultKeyWrappedByPassword,
      });

      login(data.token, data.user, vaultKey);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Could not reset your master password.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleReset} className="space-y-4">
        <div className="flex items-center gap-2 text-cyan">
          <FiCheckCircle size={16} /> <span className="text-sm">Recovery key verified</span>
        </div>
        <p className="text-sm text-mist">Choose a new master password. Your existing vault data stays intact.</p>
        {error && (
          <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2">
            <FiAlertCircle size={14} /> {error}
          </div>
        )}
        <div>
          <label className="text-xs text-mist mb-1 block">New master password</label>
          <input type="password" required minLength={8} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            placeholder="At least 8 characters" />
          {newPassword && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-panel2 overflow-hidden flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: i <= strength.score ? strength.color : "#1e2635" }} />
                ))}
              </div>
              <span className="text-xs mt-1 block" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors disabled:opacity-60">
          {loading ? "Saving…" : "Set new master password"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRecover} className="space-y-4">
      <p className="text-sm text-mist">
        Enter your account email and the recovery key you saved at signup. There's no other way to
        regain access — VaultKeep never has the ability to reset this for you.
      </p>
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2">
          <FiAlertCircle size={14} /> {error}
        </div>
      )}
      <div>
        <label className="text-xs text-mist mb-1 block">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
          placeholder="you@example.com" />
      </div>
      <div>
        <label className="text-xs text-mist mb-1 block">Recovery key</label>
        <input required value={recoveryKeyInput} onChange={(e) => setRecoveryKeyInput(e.target.value)}
          className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm font-mono focus:border-cyan/50 outline-none transition-colors"
          placeholder="xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx" />
      </div>
      <CaptchaChallenge ref={captchaRef} />
      <button type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors disabled:opacity-60">
        {loading ? "Verifying…" : "Verify recovery key"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-center text-xs text-mist hover:text-cyan transition-colors">
        Back to login
      </button>
    </form>
  );
}
