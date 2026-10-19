// frontend/src/utils/vaultCrypto.js
//
// ZERO-KNOWLEDGE MODEL WITH RECOVERY SUPPORT
// --------------------------------------------
// The actual key that encrypts your vault ("vaultKey") is a RANDOM key,
// generated once and never based on your master password. That's what
// makes recovery possible while staying zero-knowledge: the same random
// vaultKey is "wrapped" (encrypted) TWICE, by two independent keys:
//
//   - one derived from your MASTER PASSWORD  -> used on normal login
//   - one derived from your RECOVERY KEY      -> used if you forget it
//
// Both wrapped copies are stored on the server as opaque ciphertext. The
// server can never unwrap either of them itself -- only a browser that
// derives the matching wrapping key (from the right password or the right
// recovery key) can recover vaultKey. Lose both the master password AND
// the recovery key, and the vault is genuinely, permanently unrecoverable
// by design -- that's the honest trade-off of zero-knowledge encryption.

const PBKDF2_ITERATIONS = 250_000;

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function generateSaltHex() {
  return bufToHex(crypto.getRandomValues(new Uint8Array(16)));
}

// A human-typeable recovery key: 20 random bytes (160 bits, plenty of
// entropy), shown as grouped hex so it's easy to read and re-type,
// e.g. "a1b2c3d4-e5f6a7b8-c9d0e1f2-a3b4c5d6-e7f8a9b0".
export function generateRecoveryKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const hex = bufToHex(bytes);
  return hex.match(/.{1,8}/g).join("-");
}

function normalizeRecoveryKey(recoveryKey) {
  return recoveryKey.trim().toLowerCase().replace(/[^a-f0-9]/g, "");
}

// Derives a 64-byte key from a secret (master password OR recovery key)
// plus a salt, then splits it: 32 bytes become an "auth key" sent to the
// server purely to prove identity, and 32 bytes become a local-only
// "wrapping key" used to encrypt/decrypt the real vault key. Splitting one
// derivation this way means the server-visible authKey can never be
// reversed into the wrapping key.
async function deriveSplitKeys(secret, saltHex) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBuf(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    512
  );

  const bytes = new Uint8Array(bits);
  const authKeyHex = bufToHex(bytes.slice(0, 32));
  const wrappingKey = await crypto.subtle.importKey(
    "raw",
    bytes.slice(32, 64),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );

  return { authKeyHex, wrappingKey };
}

export async function deriveFromPassword(masterPassword, saltHex) {
  return deriveSplitKeys(masterPassword, saltHex);
}

export async function deriveFromRecoveryKey(recoveryKey, saltHex) {
  return deriveSplitKeys(normalizeRecoveryKey(recoveryKey), saltHex);
}

// Generates the ONE real vault key -- a random AES-256 key that never
// depends on any password. Returned as both a usable CryptoKey (for
// encrypting fields) and raw bytes (so it can be "wrapped" below).
export async function generateVaultKey() {
  const rawBytes = crypto.getRandomValues(new Uint8Array(32));
  const cryptoKey = await crypto.subtle.importKey("raw", rawBytes, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
  return { cryptoKey, rawBytes };
}

async function importVaultKeyBytes(rawBytes) {
  return crypto.subtle.importKey("raw", rawBytes, "AES-GCM", true, ["encrypt", "decrypt"]);
}

// Wraps (encrypts) the raw vault key bytes with a wrapping key, producing
// an opaque "iv:ciphertext" string safe to store on the server.
export async function wrapVaultKey(wrappingKey, vaultKeyRawBytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrappingKey, vaultKeyRawBytes);
  return `${bufToHex(iv)}:${bufToHex(ciphertext)}`;
}

// Unwraps a stored "iv:ciphertext" string back into a usable vault
// CryptoKey. Throws if the wrapping key is wrong (e.g. mistyped password)
// -- AES-GCM's built-in authentication tag makes wrong-key attempts fail
// loudly instead of silently returning garbage.
export async function unwrapVaultKey(wrappingKey, wrappedHex) {
  const [ivHex, dataHex] = wrappedHex.split(":");
  const rawBytes = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBuf(ivHex) },
    wrappingKey,
    hexToBuf(dataHex)
  );
  return importVaultKeyBytes(new Uint8Array(rawBytes));
}

// Encrypts one field (a password, a note, a journal entry...) with the
// vault key. Returns "iv:ciphertext" hex, an opaque string for the server.
export async function encryptField(vaultKey, plainText) {
  if (plainText == null || plainText === "") return "";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    vaultKey,
    new TextEncoder().encode(plainText)
  );
  return `${bufToHex(iv)}:${bufToHex(ciphertext)}`;
}

export async function decryptField(vaultKey, payload) {
  if (!payload) return "";
  const [ivHex, dataHex] = payload.split(":");
  if (!ivHex || !dataHex) return "";
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBuf(ivHex) },
    vaultKey,
    hexToBuf(dataHex)
  );
  return new TextDecoder().decode(plain);
}
