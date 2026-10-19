// routes/journal.js
//
// Backs the interactive Design Thinking journal on the Wallet page. Same
// pattern as vault entries: content arrives already encrypted with the
// user's vault key, this server just stores/returns the opaque ciphertext.

const express = require("express");
const db = require("../db/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const VALID_STAGES = ["empathize", "define", "ideate", "prototype", "test"];

// GET /api/journal -- all 5 stages for the logged-in user
router.get("/", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT stage, content_cipher, updated_at FROM journal_entries WHERE user_id = ?")
      .all(req.userId);
    const byStage = {};
    for (const row of rows) {
      byStage[row.stage] = { content: row.content_cipher, updatedAt: row.updated_at };
    }
    res.json({ entries: byStage });
  } catch (err) {
    console.error("Journal list error:", err);
    res.status(500).json({ error: "Could not load your journal." });
  }
});

// PUT /api/journal/:stage -- upsert one stage's (encrypted) content
router.put("/:stage", (req, res) => {
  try {
    const { stage } = req.params;
    const { content } = req.body;
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({ error: "Unknown journal stage." });
    }

    const existing = db
      .prepare("SELECT id FROM journal_entries WHERE user_id = ? AND stage = ?")
      .get(req.userId, stage);

    if (existing) {
      db.prepare(
        "UPDATE journal_entries SET content_cipher = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(content || "", existing.id);
    } else {
      db.prepare(
        "INSERT INTO journal_entries (user_id, stage, content_cipher) VALUES (?, ?, ?)"
      ).run(req.userId, stage, content || "");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Journal save error:", err);
    res.status(500).json({ error: "Could not save this journal entry." });
  }
});

module.exports = router;
