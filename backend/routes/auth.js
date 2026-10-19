// routes/auth.js
//
// ZERO-KNOWLEDGE NOTE: everything this server ever receives that looks
// like a "password" (authKey, recoveryAuthKey) is actually a value the
// BROWSER derived via PBKDF2 -- see frontend/src/utils/vaultCrypto.js.
// The real master password and the real recovery key are never
// transmitted or stored anywhere. This server bcrypt-hashes those derived
// values exactly like a normal app hashes a password, but structurally
// cannot recover anyone's vault encryption key even if the database leaked.

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db/db");
const { issueCaptcha, verifyCaptcha } = require("../utils/captcha");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 12;
const HEX64_RE = /^[a-f0-9]{64}$/i;
const SALT_RE = /^[a-f0-9]{32}$/i;
const CIPHER_RE = /^[a-f0-9]+:[a-f0-9]+$/i;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });
}

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, salt: row.salt, createdAt: row.created_at };
}

function requireCaptcha(req, res) {
  const { captchaToken, captchaAnswer } = req.body;
  if (!captchaToken || captchaAnswer === undefined) {
    res.status(400).json({ error: "Please complete the verification challenge." });
    return false;
  }
  if (!verifyCaptcha(captchaToken, captchaAnswer)) {
    res.status(400).json({ error: "That verification answer wasn't right. Try a new challenge." });
    return false;
  }
  return true;
}

// GET /api/auth/captcha -- issue a fresh math challenge
router.get("/captcha", (req, res) => {
  res.json(issueCaptcha());
});

// POST /api/auth/register
// Body: { name, email, authKey, salt, vaultKeyWrappedByPassword,
//         recoveryAuthKey, recoverySalt, vaultKeyWrappedByRecovery,
//         captchaToken, captchaAnswer }
router.post("/register", async (req, res) => {
  try {
    if (!requireCaptcha(req, res)) return;

    const {
      name, email, authKey, salt, vaultKeyWrappedByPassword,
      recoveryAuthKey, recoverySalt, vaultKeyWrappedByRecovery,
    } = req.body;

    if (!name || !email || !authKey || !salt || !vaultKeyWrappedByPassword ||
        !recoveryAuthKey || !recoverySalt || !vaultKeyWrappedByRecovery) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (!HEX64_RE.test(authKey) || !HEX64_RE.test(recoveryAuthKey)) {
      return res.status(400).json({ error: "Malformed credentials. Please use the app's form." });
    }
    if (!SALT_RE.test(salt) || !SALT_RE.test(recoverySalt)) {
      return res.status(400).json({ error: "Malformed credentials. Please use the app's form." });
    }
    if (!CIPHER_RE.test(vaultKeyWrappedByPassword) || !CIPHER_RE.test(vaultKeyWrappedByRecovery)) {
      return res.status(400).json({ error: "Malformed credentials. Please use the app's form." });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const authHash = await bcrypt.hash(authKey, BCRYPT_ROUNDS);
    const recoveryAuthHash = await bcrypt.hash(recoveryAuthKey, BCRYPT_ROUNDS);

    const info = db
      .prepare(
        `INSERT INTO users
         (name, email, auth_hash, salt, vault_key_wrapped_by_password,
          recovery_auth_hash, recovery_salt, vault_key_wrapped_by_recovery)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name.trim(), email.toLowerCase(), authHash, salt, vaultKeyWrappedByPassword,
        recoveryAuthHash, recoverySalt, vaultKeyWrappedByRecovery
      );

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    const token = signToken(user.id);

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Something went wrong creating your account." });
  }
});

// GET /api/auth/salt?email=...
// Public by necessity: the browser needs a user's salt BEFORE it can
// derive authKey to log in. A salt is not secret. Returns a fake-looking
// salt for unknown emails so the response shape doesn't reveal much.
router.get("/salt", (req, res) => {
  const email = (req.query.email || "").toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Valid email required." });
  }
  const user = db.prepare("SELECT salt FROM users WHERE email = ?").get(email);
  if (!user) {
    const fakeSalt = crypto.createHash("sha256").update(email).digest("hex").slice(0, 32);
    return res.json({ salt: fakeSalt });
  }
  res.json({ salt: user.salt });
});

function isLocked(user) {
  return user.locked_until && new Date(user.locked_until) > new Date();
}

function recordFailedAttempt(user) {
  const attempts = user.failed_attempts + 1;
  let lockedUntil = null;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
  }
  db.prepare("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?").run(
    attempts, lockedUntil, user.id
  );
}

function clearFailedAttempts(userId) {
  db.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").run(userId);
}

// POST /api/auth/login
// Body: { email, authKey, captchaToken, captchaAnswer }
// Returns vaultKeyWrappedByPassword so the browser can unwrap its own
// vault key locally -- the server never touches it.
router.post("/login", async (req, res) => {
  try {
    if (!requireCaptcha(req, res)) return;

    const { email, authKey } = req.body;
    if (!email || !authKey) {
      return res.status(400).json({ error: "Email and master password are required." });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    const genericError = { error: "Invalid email or master password." };
    if (!user) return res.status(401).json(genericError);

    if (isLocked(user)) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(429).json({
        error: `Too many failed attempts. Try again in about ${minutesLeft} minute(s).`,
      });
    }

    const match = await bcrypt.compare(authKey, user.auth_hash);
    if (!match) {
      recordFailedAttempt(user);
      return res.status(401).json(genericError);
    }

    clearFailedAttempts(user.id);
    const token = signToken(user.id);
    res.json({ token, user: publicUser(user), vaultKeyWrappedByPassword: user.vault_key_wrapped_by_password });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong logging you in." });
  }
});

// GET /api/auth/recovery-salt?email=...  (public, same reasoning as /salt)
router.get("/recovery-salt", (req, res) => {
  const email = (req.query.email || "").toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Valid email required." });
  }
  const user = db.prepare("SELECT recovery_salt FROM users WHERE email = ?").get(email);
  if (!user) {
    const fakeSalt = crypto.createHash("sha256").update(email + "recovery").digest("hex").slice(0, 32);
    return res.json({ recoverySalt: fakeSalt });
  }
  res.json({ recoverySalt: user.recovery_salt });
});

// POST /api/auth/recover
// Body: { email, recoveryAuthKey }
// Verifies the recovery credential and, if correct, hands back the
// vault key wrapped by the recovery path so the browser can unwrap it.
router.post("/recover", async (req, res) => {
  try {
    if (!requireCaptcha(req, res)) return;

    const { email, recoveryAuthKey } = req.body;
    if (!email || !recoveryAuthKey) {
      return res.status(400).json({ error: "Email and recovery key are required." });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    const genericError = { error: "That email and recovery key don't match our records." };
    if (!user) return res.status(401).json(genericError);

    if (isLocked(user)) {
      return res.status(429).json({ error: "Too many failed attempts. Try again later." });
    }

    const match = await bcrypt.compare(recoveryAuthKey, user.recovery_auth_hash);
    if (!match) {
      recordFailedAttempt(user);
      return res.status(401).json(genericError);
    }

    clearFailedAttempts(user.id);
    // A short-lived token, only valid for finishing the reset below.
    const resetToken = jwt.sign({ userId: user.id, purpose: "reset" }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    res.json({ resetToken, vaultKeyWrappedByRecovery: user.vault_key_wrapped_by_recovery });
  } catch (err) {
    console.error("Recover error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/auth/reset-with-recovery
// Body: { resetToken, newAuthKey, newSalt, newVaultKeyWrappedByPassword }
// Only usable with a resetToken issued by a successful /recover call.
router.post("/reset-with-recovery", async (req, res) => {
  try {
    const { resetToken, newAuthKey, newSalt, newVaultKeyWrappedByPassword } = req.body;
    if (!resetToken || !newAuthKey || !newSalt || !newVaultKeyWrappedByPassword) {
      return res.status(400).json({ error: "Missing fields." });
    }
    if (!HEX64_RE.test(newAuthKey) || !SALT_RE.test(newSalt) || !CIPHER_RE.test(newVaultKeyWrappedByPassword)) {
      return res.status(400).json({ error: "Malformed credentials." });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "This reset session expired. Please start over." });
    }
    if (payload.purpose !== "reset") {
      return res.status(401).json({ error: "Invalid reset session." });
    }

    const newAuthHash = await bcrypt.hash(newAuthKey, BCRYPT_ROUNDS);
    db.prepare(
      "UPDATE users SET auth_hash = ?, salt = ?, vault_key_wrapped_by_password = ? WHERE id = ?"
    ).run(newAuthHash, newSalt, newVaultKeyWrappedByPassword, payload.userId);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.userId);
    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ error: "Something went wrong resetting your master password." });
  }
});

// GET /api/auth/vault-key  (authenticated) -- used to "unlock" an existing
// session after the in-memory vault key was cleared (e.g. page refresh),
// without requiring a full re-login.
router.get("/vault-key", require("../middleware/auth").requireAuth, (req, res) => {
  const user = db.prepare("SELECT salt, vault_key_wrapped_by_password FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ salt: user.salt, vaultKeyWrappedByPassword: user.vault_key_wrapped_by_password });
});

// GET /api/auth/me
router.get("/me", require("../middleware/auth").requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

module.exports = router;
