import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Flashcards from "../components/Flashcards.jsx";
import { flashcardDecks, roadmapSections } from "../data/learnContent.js";
import { FiLayout, FiServer, FiLayers } from "react-icons/fi";

const DECKS = [
  { key: "frontend", label: "Frontend", icon: FiLayout },
  { key: "backend", label: "Backend", icon: FiServer },
  { key: "fullstack", label: "Full-stack", icon: FiLayers },
];

export default function Learn() {
  const [activeDeck, setActiveDeck] = useState("frontend");

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <span className="text-xs font-mono text-violet">Study guide</span>
        <h1 className="font-display text-3xl md:text-5xl font-semibold mt-2">
          Learn full-stack development
        </h1>
        <p className="text-mist mt-4 max-w-xl mx-auto">
          A roadmap and flashcards covering frontend, backend, and what it takes to work across
          both. Ask the assistant in the corner anything, or test yourself below.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-5">
        {roadmapSections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="rounded-2xl border border-line bg-panel p-6"
          >
            <span className="text-xs font-mono text-cyan">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="font-display text-xl font-semibold mt-1 mb-1">{s.title}</h2>
            <p className="text-mist text-sm mb-4">{s.summary}</p>
            <ul className="space-y-2">
              {s.points.map((p) => (
                <li key={p} className="text-sm text-cloud/90 flex gap-2">
                  <span className="text-violet mt-1">•</span> {p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-center mb-2">Flashcards</h2>
        <p className="text-mist text-sm text-center mb-8">Test yourself, one concept at a time.</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          {DECKS.map((d) => (
            <button
              key={d.key}
              onClick={() => setActiveDeck(d.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
                activeDeck === d.key
                  ? "border-cyan text-cyan bg-cyan/10"
                  : "border-line text-mist hover:border-line/80"
              }`}
            >
              <d.icon size={14} /> {d.label}
            </button>
          ))}
        </div>

        <Flashcards deck={flashcardDecks[activeDeck]} />
      </section>
    </div>
  );
}
