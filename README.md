# VaultKeep — Encrypted Password Manager

A full-stack, zero-knowledge password manager: encrypted vault, real
password recovery, a self-hosted CAPTCHA, a Groq-powered study assistant,
and an interactive Design Thinking case study about physical wallets tied
back to why a digital vault matters.

## Quick start (one command, after initial setup)

```bash
npm run install-all   # installs backend + frontend dependencies
npm run dev           # starts BOTH servers together
```

Then open **http://localhost:5173**. See "Full setup" below for the
one-time `.env` step you need before the first run.

## Features

- 🔐 Zero-knowledge encryption — your master password never leaves your browser
- 🗝️ Real account recovery via a one-time recovery key (not a destructive reset)
- 🤖 Self-hosted math CAPTCHA on login/register — no third-party service
- 🚪 Only the homepage is public — every other page prompts a login/register popup
- 🎲 Password generator + strength meter, reveal-on-demand, one-click copy
- 🔒 Auto-lock after 5 minutes of inactivity, brute-force lockout after failed logins
- 🎨 GSAP pinned scrollytelling intro, glitch-style section transition, 3D draggable visuals
- 🧠 Study guide with flashcards, powered by a real AI chatbot (Groq API, free tier)
- 👛 An interactive Design Thinking journal (Empathize → Test) for the wallet case study — encrypted like everything else

## Project structure

```
password-vault/
├── package.json             Root: single "npm run dev" for both servers
├── backend/                 Node.js + Express API
│   ├── server.js
│   ├── db/db.js              SQLite schema
│   ├── routes/auth.js        register/login/recover/reset/salt/captcha
│   ├── routes/vault.js       password entry CRUD (protected)
│   ├── routes/journal.js     design-thinking journal CRUD (protected)
│   ├── routes/chat.js        Groq-backed chatbot proxy
│   ├── middleware/auth.js    JWT verification
│   └── utils/captcha.js      self-hosted math CAPTCHA
└── frontend/                 React + Vite + Tailwind + Framer Motion + GSAP
    └── src/
        ├── pages/            Landing, Login, Register, Dashboard, Learn, WalletDesign
        ├── components/       Navbar, AuthForms, AuthGateModal, CommandPalette,
        │                     Wallet3D, GlitchDivider, ScrollStory, Chatbot, etc.
        ├── context/AuthContext.jsx
        ├── utils/vaultCrypto.js   all client-side encryption logic
        └── data/                  flashcards + wallet case-study content
```

## How the security actually works

### Zero-knowledge encryption with real recovery
Your master password never leaves your browser. Here's the flow:

1. At signup, the browser generates a **random** vault key (not derived
   from your password) and encrypts ("wraps") it twice: once with a key
   derived from your master password, once with a key derived from a
   one-time **recovery key** shown to you exactly once.
2. Both wrapped copies are sent to the server as opaque ciphertext — the
   server can never unwrap either one itself.
3. Logging in normally re-derives the password-based wrapping key locally
   and unwraps the vault key in your browser.
4. **Forgot your password?** Re-derive the recovery-based wrapping key
   from your saved recovery key instead, unwrap the same vault key, then
   set a new master password — your existing vault data stays intact.
5. Lose **both** your master password and your recovery key, and the
   vault is genuinely, permanently unrecoverable — that's the honest
   trade-off of real zero-knowledge design.

### Other protections
- **Self-hosted CAPTCHA**: a stateless, signed math challenge (see
  `backend/utils/captcha.js`) on every login/register/recovery attempt —
  no Google reCAPTCHA, no third party sees your visitors.
- **Brute-force lockout**: 5 failed login attempts locks that account for
  15 minutes, in addition to IP-based rate limiting.
- **Auto-lock**: the in-memory vault key clears after 5 minutes of
  inactivity, requiring the master password to unlock again.

## Full setup

You'll need [Node.js](https://nodejs.org) 22.5+ (for the built-in SQLite
module) and, ideally, a free [Groq](https://console.groq.com) API key (for
the chatbot — everything else works without it).

```bash
npm run install-all
```

Then create your backend `.env`:

```bash
cd backend
cp .env.example .env
```

Generate a secret and paste it into `.env` as `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Optionally add your Groq key as `GROQ_API_KEY` in the same `.env` to
enable the chatbot (sign up free at console.groq.com → API Keys).

From the project root:

```bash
npm run dev
```

This starts the backend (`http://localhost:5000`) and frontend
(`http://localhost:5173`) together, in one terminal, color-coded by
service. Open `http://localhost:5173`.

## Opening it in VS Code

Open the `password-vault` folder in VS Code. One integrated terminal
(`` Ctrl+` ``) running `npm run dev` from the root is now enough for both
servers — no more juggling two terminals.

## Deploying

- **Backend**: deploy to Render/Railway/Fly.io. Set `JWT_SECRET`,
  `CORS_ORIGIN` (your frontend's live URL), and `GROQ_API_KEY` as
  environment variables. On free tiers with an ephemeral filesystem, the
  SQLite file can be wiped on redeploy — swap in managed Postgres for
  anything beyond a demo.
- **Frontend**: set `VITE_API_URL` (see `frontend/.env.example`) to your
  backend's URL + `/api`, run `npm run build` inside `frontend/`, deploy
  the generated `dist/` folder to Vercel/Netlify.

## Publishing to GitHub

```bash
cd password-vault
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

All three `.gitignore` files already exclude `node_modules/`, `.env`, and
the SQLite database, so secrets and saved passwords never get committed.

## Tech stack

**Backend**: Node.js, Express, node:sqlite, bcryptjs, jsonwebtoken, helmet, express-rate-limit
**Frontend**: React, Vite, Tailwind CSS, Framer Motion, GSAP + ScrollTrigger, React Router, Axios, react-icons
