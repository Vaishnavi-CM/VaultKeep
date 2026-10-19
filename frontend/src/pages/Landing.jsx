import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Hero3D from "../components/Hero3D.jsx";
import ScrollStory from "../components/ScrollStory.jsx";
import {
  FiShield, FiKey, FiZap, FiEyeOff, FiCpu, FiCreditCard, FiLock, FiArrowRight,
} from "react-icons/fi";

const features = [
  { icon: FiLock, title: "AES-256 encryption, done client-side", body: "Every saved password is encrypted in your browser before it's ever sent anywhere. The server only ever stores ciphertext it has no key to open." },
  { icon: FiKey, title: "One master password, real recovery", body: "Log in once to unlock everything. Forget it, and a one-time recovery key (shown once at signup) gets you back in without losing your vault." },
  { icon: FiZap, title: "Built-in password generator", body: "Spin up long, unique, random passwords for every new account in one click." },
  { icon: FiEyeOff, title: "Reveal-on-demand", body: "Passwords stay masked by default. Click to reveal, click to copy -- nothing is shown until you ask for it." },
  { icon: FiCpu, title: "Hardened against abuse", body: "Login attempts are rate-limited and lock out after repeated failures, with a self-hosted verification challenge on every attempt." },
  { icon: FiCreditCard, title: "A design case study, built in", body: "A full Design Thinking exploration of physical wallets -- interviews, problems, prototypes -- tying the same thinking back to why a digital vault matters." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      <section className="relative overflow-hidden bg-grid bg-[size:44px_44px]">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial="hidden" animate="show" variants={container}>
            <motion.span variants={item} className="inline-flex items-center gap-2 text-xs font-mono text-cyan border border-cyan/30 rounded-full px-3 py-1 mb-6">
              <FiShield size={12} /> Zero-knowledge · AES-256 · bcrypt
            </motion.span>
            <motion.h1 variants={item} className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Your passwords,
              <br />
              <span className="bg-gradient-to-r from-cyan to-violet bg-clip-text text-transparent">actually safe.</span>
            </motion.h1>
            <motion.p variants={item} className="mt-6 text-mist text-lg max-w-md">
              VaultKeep is an encrypted vault for every login you own. Your master password never
              leaves your browser -- generated, stored, and retrieved without ever being guessable
              by anyone else, including us.
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors shadow-glow">
                Create your vault <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-line hover:border-cyan/50 transition-colors">
                I already have an account
              </Link>
            </motion.div>
          </motion.div>
          <Hero3D />
        </div>
      </section>

      <ScrollStory />

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-14 max-w-xl">
          <span className="text-xs font-mono text-violet">Under the hood</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Security you can actually explain</h2>
          <p className="text-mist mt-3">Real mechanisms, not marketing claims -- from client-side encryption to genuine account recovery.</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={container} className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <motion.div key={f.title} variants={item} whileHover={{ y: -4 }} className="p-6 rounded-2xl bg-panel border border-line hover:border-cyan/30 transition-colors">
              <f.icon className="text-cyan mb-4" size={22} />
              <h3 className="font-display font-medium text-lg mb-2">{f.title}</h3>
              <p className="text-mist text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-3xl border border-line bg-gradient-to-br from-panel2 to-panel p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan/10 blur-[100px]" />
          <h2 className="font-display text-3xl md:text-4xl font-semibold relative">Stop reusing the same password.</h2>
          <p className="text-mist mt-3 max-w-lg mx-auto relative">It takes under a minute to create your vault and generate your first strong, unique password.</p>
          <Link to="/register" className="relative inline-flex items-center gap-2 mt-8 px-7 py-3 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors">
            Get started free <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-line py-8 text-center text-mist text-sm">
        Log in to explore the study guide and the wallet design case study.
      </footer>
    </div>
  );
}
