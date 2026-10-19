// Small client-side helpers: a password generator and a rough strength meter.
// Nothing here ever leaves the browser, and generated passwords are only
// ever sent to the server over HTTPS (in production) to be encrypted -- see
// backend/utils/crypto.js for how they're stored.

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function generatePassword({
  length = 16,
  useUpper = true,
  useDigits = true,
  useSymbols = true,
} = {}) {
  let pool = LOWER;
  if (useUpper) pool += UPPER;
  if (useDigits) pool += DIGITS;
  if (useSymbols) pool += SYMBOLS;

  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[bytes[i] % pool.length];
  }
  return result;
}

export function scorePassword(pw = "") {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#00d9c0", "#00d9c0"];
  return { score, label: labels[score], color: colors[score] };
}
