// routes/chat.js
//
// A real AI-backed chatbot using Groq's free API (OpenAI-compatible
// endpoint, running open-source models very fast). The API key lives
// ONLY here on the server -- it's never sent to the browser, otherwise
// anyone could open dev tools and steal it.

const express = require("express");
const router = express.Router();

const SYSTEM_PROMPT = `You are a friendly, knowledgeable study assistant embedded in a
password-manager website. You help visitors learn general software
development concepts: what frontend and backend development are, how
authentication and encryption work in general, how to become a
full-stack developer, study tips, and you're also happy to chat casually
(e.g. "how are you"). 

Important: don't describe the specific internal implementation, file
names, routes, or architecture of the website you're embedded in -- keep
answers educational and general, as if teaching the concept itself, not
narrating this particular app's source code. Keep answers concise and
conversational, a few sentences unless the person clearly wants depth.`;

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || message.length > 2000) {
      return res.status(400).json({ error: "Please send a valid message." });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: "The chatbot isn't configured yet. Add GROQ_API_KEY to backend/.env to enable it.",
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.slice(-10) : []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages,
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", response.status, errText);
      return res.status(502).json({ error: "The chatbot's brain is temporarily unavailable. Try again shortly." });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I didn't catch that -- could you rephrase?";
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong reaching the chatbot." });
  }
});

module.exports = router;
