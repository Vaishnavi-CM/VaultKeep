// utils/captcha.js
//
// A small, self-hosted CAPTCHA -- no third-party service (no Google
// reCAPTCHA), so no visitor data ever leaves this app. It's a simple math
// challenge, "stateless" in the sense that the server doesn't need to
// remember anything between issuing the challenge and checking the
// answer: the expected answer is baked into a signed token instead.
//
// Honest limitation: this stops trivial/naive bots, not a sophisticated
// scripted attacker who bothers to parse the question and do the math
// themselves. For that level of protection you'd want a real behavioral
// CAPTCHA service. This is a deliberate, privacy-respecting trade-off for
// a project that doesn't want to hand visitor data to a third party.

const crypto = require("crypto");

const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes to answer

function sign(payload) {
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(payload).digest("hex");
}

function issueCaptcha() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let answer;
  if (op === "+") answer = a + b;
  else if (op === "-") answer = a - b;
  else answer = a * b;

  const expires = Date.now() + CAPTCHA_TTL_MS;
  const payload = `${answer}.${expires}`;
  const signature = sign(payload);
  const token = Buffer.from(`${payload}.${signature}`).toString("base64url");

  return { token, question: `${a} ${op} ${b}` };
}

function verifyCaptcha(token, submittedAnswer) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [answer, expires, signature] = decoded.split(".");
    const payload = `${answer}.${expires}`;

    if (sign(payload) !== signature) return false; // tampered token
    if (Date.now() > Number(expires)) return false; // expired
    return Number(submittedAnswer) === Number(answer);
  } catch {
    return false;
  }
}

module.exports = { issueCaptcha, verifyCaptcha };
