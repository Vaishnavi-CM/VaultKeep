import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiX, FiSend, FiCpu } from "react-icons/fi";
import api from "../utils/api";

const GREETING = {
  role: "assistant",
  content: "Hi! Ask me anything -- how frontend/backend dev works, how to become full-stack, or just say hello.",
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, thinking]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setThinking(true);

    try {
      const { data } = await api.post("/chat", {
        message: text,
        history: history.slice(-8).map(({ role, content }) => ({ role, content })),
      });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Something went wrong reaching the chatbot.";
      setMessages((m) => [...m, { role: "assistant", content: errMsg }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan to-violet text-ink flex items-center justify-center shadow-glow"
        aria-label="Open assistant"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[28rem] bg-panel border border-line rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-panel2">
              <FiCpu className="text-cyan" size={16} />
              <span className="font-display text-sm font-medium">Study Assistant</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] text-sm rounded-xl px-3 py-2 leading-relaxed ${
                    m.role === "user" ? "bg-cyan text-ink" : "bg-panel2 border border-line text-cloud"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-panel2 border border-line text-mist text-sm rounded-xl px-3 py-2">Thinking…</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-line">
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-panel2 border border-line rounded-lg px-3 py-2 text-sm focus:border-cyan/50 outline-none transition-colors"
              />
              <button type="submit" disabled={thinking} className="p-2 rounded-lg bg-cyan text-ink hover:bg-cyan-dim transition-colors disabled:opacity-60" aria-label="Send message">
                <FiSend size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
