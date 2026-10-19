import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiZap } from "react-icons/fi";
import { generatePassword, scorePassword } from "../utils/password";

const CATEGORIES = ["general", "social", "finance", "work", "shopping"];

export default function VaultForm({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || { siteName: "", siteUrl: "", username: "", password: "", notes: "", category: "general" }
  );
  const strength = scorePassword(form.password);

  function handleGenerate() {
    setForm({ ...form, password: generatePassword({ length: 16 }) });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-panel border border-line rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold">
              {initial ? "Edit entry" : "New vault entry"}
            </h2>
            <button onClick={onClose} className="text-mist hover:text-cloud transition-colors">
              <FiX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-mist mb-1 block">Site / App name *</label>
              <input
                required
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
                placeholder="Netflix"
              />
            </div>

            <div>
              <label className="text-xs text-mist mb-1 block">Site URL</label>
              <input
                value={form.siteUrl}
                onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
                placeholder="netflix.com"
              />
            </div>

            <div>
              <label className="text-xs text-mist mb-1 block">Username / email</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-mist block">Password *</label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex items-center gap-1 text-xs text-cyan hover:underline"
                >
                  <FiZap size={11} /> Generate strong password
                </button>
              </div>
              <input
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm font-mono focus:border-cyan/50 outline-none transition-colors"
                placeholder="••••••••••••"
              />
              {form.password && (
                <span className="text-xs mt-1 block" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              )}
            </div>

            <div>
              <label className="text-xs text-mist mb-1 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setForm({ ...form, category: c })}
                    className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                      form.category === c
                        ? "border-cyan text-cyan bg-cyan/10"
                        : "border-line text-mist hover:border-line/80"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-mist mb-1 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors resize-none"
                placeholder="Recovery codes, security questions, etc."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors"
            >
              {initial ? "Save changes" : "Add to vault"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
