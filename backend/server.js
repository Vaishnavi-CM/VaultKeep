// server.js -- VaultKeep API entrypoint
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const vaultRoutes = require("./routes/vault");
const journalRoutes = require("./routes/journal");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));

// Slow down brute-force attempts against auth endpoints specifically.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many attempts. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Separate, slightly more generous limiter for the chatbot so casual
// conversation doesn't get throttled like login attempts, but a free API
// quota still can't be hammered by one visitor.
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  message: { error: "You're chatting a bit fast -- give it a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "vaultkeep-api" }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n  VaultKeep API running → http://localhost:${PORT}`);
  console.log(`  Health check          → http://localhost:${PORT}/api/health\n`);
});
