import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import GlitchDivider from "../components/GlitchDivider.jsx";
import WalletBlueprint from "../components/WalletBlueprint.jsx";
import WalletProduct3D from "../components/WalletProduct3D.jsx";
import { problemsAndSolutions, journalStages } from "../data/walletContent.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api";
import { encryptField, decryptField } from "../utils/vaultCrypto";
import { FiCheckCircle } from "react-icons/fi";

export default function WalletDesign() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <Hero />
      <GlitchDivider text="Enter the Wallet" />
      <ProblemsGrid />
      <WalletConcepts />
      <DesignJournal />
    </div>
  );
}

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-16 pb-6 text-center">
      <span className="text-xs font-mono text-violet">A design thinking case study</span>
      <h1 className="font-display text-3xl md:text-5xl font-semibold mt-2 leading-tight">
        Passwords are the new cash.
        <br />
        <span className="bg-gradient-to-r from-cyan to-violet bg-clip-text text-transparent">Wallets solved this once already.</span>
      </h1>
      <p className="text-mist mt-5 max-w-xl mx-auto">
        Before digital vaults, physical wallets already had to solve access, organization, and
        security for the things people couldn't afford to lose. This section applies that same
        design thinking — Empathize, Define, Ideate, Prototype, Test — to the humble wallet, and
        ties it back to why a digital vault matters just as much.
      </p>
    </section>
  );
}

function ProblemsGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="font-display text-2xl font-semibold mb-2 text-center">Problems we looked at</h2>
      <p className="text-mist text-sm text-center mb-10">Grounded in real, reported wallet complaints — not just assumptions.</p>
      <div className="grid md:grid-cols-2 gap-5">
        {problemsAndSolutions.map((p, i) => (
          <FlipCard key={p.problem} item={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function FlipCard({ item, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="perspective-1000 h-56 cursor-pointer" onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 backface-hidden rounded-2xl border border-line bg-panel p-6 flex flex-col justify-between" style={{ backfaceVisibility: "hidden" }}>
          <div>
            <span className="text-xs font-mono text-red-400">PROBLEM</span>
            <h3 className="font-display font-medium text-lg mt-2">{item.problem}</h3>
            <p className="text-sm text-mist mt-2">{item.detail}</p>
          </div>
          <span className="text-xs text-mist/60">Click to see the solution →</span>
        </div>
        <div className="absolute inset-0 backface-hidden rounded-2xl border border-cyan/40 bg-panel2 p-6 flex flex-col justify-between" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div>
            <span className="text-xs font-mono text-cyan">SOLUTION</span>
            <h3 className="font-display font-medium text-lg mt-2">{item.solution}</h3>
            <p className="text-sm text-mist mt-2">{item.solutionDetail}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const PRODUCTS = {
  pocket: {
    name: "The Pocket Bifold",
    tagline: "For anyone who carries in a back or front pocket.",
    specs: ["4 compartments", "RFID-shielded", "95×115mm folded"],
    whyList: [
      "Built around the exact moment that started this project: needing an ID out fast, standing on a crowded bus.",
      "A dedicated pull-tab slot means one motion gets your ID free, instead of fanning through every card.",
      "Slim enough that it doesn't print through a pocket, since bulk is the #1 complaint about pocket-carried wallets.",
    ],
  },
  bag: {
    name: "The Slim Clutch",
    tagline: "For anyone who carries in a bag, not a pocket.",
    specs: ["4 compartments", "RFID-shielded", "160×80mm folded"],
    whyList: [
      "Flatter and wider than the bifold — bag space isn't pocket space, so the proportions shouldn't be identical.",
      "Reaching into a bag already costs time, so the same fast-access ID tab matters even more here.",
      "A zipped coin pocket, since loose change has nowhere to hide once a bag's main compartment is open.",
    ],
  },
};

function WalletConcepts() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-14">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold mb-2">Two concepts, two carrying habits</h2>
        <p className="text-mist text-sm max-w-lg mx-auto">
          Not "one size fits all" — shaped around how people actually carry things. Rotate each model, pick a color, and check the blueprint for what's inside and why.
        </p>
      </div>

      {["pocket", "bag"].map((key) => (
        <ProductCard key={key} variantKey={key} />
      ))}
    </section>
  );
}

function ProductCard({ variantKey }) {
  const p = PRODUCTS[variantKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }}
      className="rounded-3xl border border-line bg-panel p-6 md:p-8"
    >
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <WalletProduct3D label={p.name} />
        </div>
        <div>
          <span className="text-xs font-mono text-violet">CONCEPT</span>
          <h3 className="font-display text-2xl font-semibold mt-1">{p.name}</h3>
          <p className="text-mist text-sm mt-1">{p.tagline}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {p.specs.map((s) => (
              <span key={s} className="text-xs font-mono text-cyan border border-cyan/30 rounded-full px-3 py-1">{s}</span>
            ))}
          </div>

          <h4 className="text-sm font-medium mt-6 mb-2">Why it's designed this way</h4>
          <ul className="space-y-2">
            {p.whyList.map((w) => (
              <li key={w} className="text-sm text-cloud/90 flex gap-2">
                <span className="text-cyan mt-1">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-line">
        <h4 className="text-sm font-medium mb-3 text-center">Interior blueprint</h4>
        <div className="max-w-md mx-auto">
          <WalletBlueprint variant={variantKey} />
        </div>
      </div>
    </motion.div>
  );
}

function DesignJournal() {
  const { vaultKey } = useAuth();
  const [activeStage, setActiveStage] = useState("empathize");
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/journal");
        const decrypted = {};
        for (const stage of journalStages) {
          const entry = data.entries[stage.key];
          decrypted[stage.key] = entry?.content ? await decryptField(vaultKey, entry.content) : "";
        }
        setValues(decrypted);
      } catch {
        // fine to start blank
      } finally {
        setLoading(false);
      }
    }
    if (vaultKey) load();
  }, [vaultKey]);

  async function handleSave() {
    setSaving(true);
    try {
      const cipher = await encryptField(vaultKey, values[activeStage] || "");
      await api.put(`/journal/${activeStage}`, { content: cipher });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      alert("Could not save this entry.");
    } finally {
      setSaving(false);
    }
  }

  const currentStage = journalStages.find((s) => s.key === activeStage);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="font-display text-2xl font-semibold mb-2 text-center">Your Design Thinking journal</h2>
      <p className="text-mist text-sm text-center mb-8 max-w-lg mx-auto">
        Document your actual interview and sketch process here — encrypted with your vault key,
        same as everything else. Use this for the real activity with your partner.
      </p>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {journalStages.map((s) => (
          <button
            key={s.key} onClick={() => setActiveStage(s.key)}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
              activeStage === s.key ? "border-cyan text-cyan bg-cyan/10" : "border-line text-mist hover:border-line/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6">
        <p className="text-sm text-mist mb-3">{currentStage.prompt}</p>
        {loading ? (
          <p className="text-mist text-sm">Decrypting your journal…</p>
        ) : (
          <textarea
            value={values[activeStage] || ""}
            onChange={(e) => setValues({ ...values, [activeStage]: e.target.value })}
            rows={8}
            className="w-full bg-panel2 border border-line rounded-lg px-4 py-3 text-sm focus:border-cyan/50 outline-none transition-colors resize-none"
            placeholder="Write your notes here…"
          />
        )}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSave} disabled={saving || loading}
            className="px-5 py-2 rounded-lg bg-cyan text-ink text-sm font-medium hover:bg-cyan-dim transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save this stage"}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-cyan text-sm">
              <FiCheckCircle size={14} /> Saved
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
