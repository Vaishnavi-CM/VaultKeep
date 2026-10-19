import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiCopy, FiCheck, FiEdit2, FiTrash2, FiGlobe } from "react-icons/fi";

const CATEGORY_COLORS = {
  general: "#7c879b",
  social: "#7c5cff",
  finance: "#00d9c0",
  work: "#f97316",
  shopping: "#eab308",
};

export default function PasswordCard({ entry, index, selected, onSelect, onEdit, onDelete }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const dotColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.general;

  return (
    <motion.div
      // Cards start tiny, rotated, and translucent, then unfold into place
      // one-by-one (staggered by `index`) -- the "slide + rotate in slowly"
      // effect requested for the post-login dashboard.
      initial={{ opacity: 0, scale: 0.75, rotate: -6, y: 24 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect(entry.id)}
      className={`relative cursor-pointer rounded-2xl border p-5 bg-panel transition-colors ${
        selected ? "border-cyan shadow-glow" : "border-line hover:border-line/80"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          <h3 className="font-display font-medium truncate">{entry.siteName}</h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-md text-mist hover:text-cyan hover:bg-panel2 transition-colors"
            aria-label="Edit entry"
          >
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-md text-mist hover:text-red-400 hover:bg-panel2 transition-colors"
            aria-label="Delete entry"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>

      {entry.siteUrl && (
        <a
          href={entry.siteUrl.startsWith("http") ? entry.siteUrl : `https://${entry.siteUrl}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-mist hover:text-cyan transition-colors mb-3"
        >
          <FiGlobe size={11} /> {entry.siteUrl}
        </a>
      )}

      {entry.username && (
        <div className="text-xs text-mist mb-2 truncate">
          <span className="text-mist/60">Username:</span> {entry.username}
        </div>
      )}

      <div
        className="flex items-center justify-between gap-2 bg-panel2 border border-line rounded-lg px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono text-sm tracking-wide truncate">
          {revealed ? entry.password : "•".repeat(Math.min(entry.password.length, 14))}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setRevealed((r) => !r)}
            className="p-1.5 rounded-md text-mist hover:text-cyan transition-colors"
            aria-label={revealed ? "Hide password" : "Reveal password"}
          >
            {revealed ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
          <button
            onClick={() => copy(entry.password)}
            className="p-1.5 rounded-md text-mist hover:text-cyan transition-colors"
            aria-label="Copy password"
          >
            {copied ? <FiCheck size={14} className="text-cyan" /> : <FiCopy size={14} />}
          </button>
        </div>
      </div>

      {entry.notes && <p className="text-xs text-mist/70 mt-3 line-clamp-2">{entry.notes}</p>}
    </motion.div>
  );
}
