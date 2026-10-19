// routes/vault.js
//
// Note what's missing here compared to a typical CRUD API: no encrypt() or
// decrypt() call anywhere. passwordCipher and notesCipher arrive from the
// browser already encrypted (see frontend/src/utils/vaultCrypto.js) and are
// stored and returned completely as-is. This server has no key that could
// ever read them -- it's just a storage bucket for ciphertext it can't open.

const express = require("express");
const db = require("../db/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth); // every route below requires a valid login

function toClientShape(row) {
  return {
    id: row.id,
    siteName: row.site_name,
    siteUrl: row.site_url,
    username: row.username,
    password: row.password_cipher, // still encrypted -- frontend decrypts with the in-memory vault key
    notes: row.notes_cipher,       // still encrypted (or empty string)
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/vault  -- list all entries for the logged-in user
router.get("/", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM vault_entries WHERE user_id = ? ORDER BY updated_at DESC")
      .all(req.userId);
    res.json({ entries: rows.map(toClientShape) });
  } catch (err) {
    console.error("Vault list error:", err);
    res.status(500).json({ error: "Could not load your vault." });
  }
});

// POST /api/vault  -- create a new entry. `password` and `notes` here are
// expected to already be AES-GCM ciphertext strings from the browser.
router.post("/", (req, res) => {
  try {
    const { siteName, siteUrl, username, password, notes, category } = req.body;
    if (!siteName || !password) {
      return res.status(400).json({ error: "Site name and password are required." });
    }

    const info = db
      .prepare(
        `INSERT INTO vault_entries (user_id, site_name, site_url, username, password_cipher, notes_cipher, category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(req.userId, siteName, siteUrl || null, username || null, password, notes || null, category || "general");

    const row = db.prepare("SELECT * FROM vault_entries WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ entry: toClientShape(row) });
  } catch (err) {
    console.error("Vault create error:", err);
    res.status(500).json({ error: "Could not save this entry." });
  }
});

// PUT /api/vault/:id  -- update an entry (only if it belongs to this user)
router.put("/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM vault_entries WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: "Entry not found." });

    const { siteName, siteUrl, username, password, notes, category } = req.body;

    db.prepare(
      `UPDATE vault_entries
       SET site_name = ?, site_url = ?, username = ?, password_cipher = ?, notes_cipher = ?, category = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    ).run(
      siteName ?? existing.site_name,
      siteUrl ?? existing.site_url,
      username ?? existing.username,
      password || existing.password_cipher,
      notes ?? existing.notes_cipher,
      category ?? existing.category,
      req.params.id,
      req.userId
    );

    const row = db.prepare("SELECT * FROM vault_entries WHERE id = ?").get(req.params.id);
    res.json({ entry: toClientShape(row) });
  } catch (err) {
    console.error("Vault update error:", err);
    res.status(500).json({ error: "Could not update this entry." });
  }
});

// DELETE /api/vault/:id
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM vault_entries WHERE id = ? AND user_id = ?")
      .run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: "Entry not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("Vault delete error:", err);
    res.status(500).json({ error: "Could not delete this entry." });
  }
});

module.exports = router;
