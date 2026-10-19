import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiShieldOff, FiTrendingUp } from "react-icons/fi";
import Navbar from "../components/Navbar.jsx";
import PasswordCard from "../components/PasswordCard.jsx";
import VaultForm from "../components/VaultForm.jsx";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext.jsx";
import { scorePassword } from "../utils/password";
import { encryptField, decryptField } from "../utils/vaultCrypto";

const CATEGORIES = ["all", "general", "social", "finance", "work", "shopping"];

export default function Dashboard() {
  const { user, vaultKey } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetches ciphertext from the server, then decrypts each entry's
  // password/notes locally using the in-memory vault key before it's ever
  // rendered.
  async function loadEntries() {
    setLoading(true);
    try {
      const { data } = await api.get("/vault");
      const decrypted = await Promise.all(
        data.entries.map(async (e) => ({
          ...e,
          password: await decryptField(vaultKey, e.password),
          notes: e.notes ? await decryptField(vaultKey, e.notes) : "",
        }))
      );
      setEntries(decrypted);
    } catch (err) {
      setError("Could not load your vault. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  // Encrypts the plaintext password/notes locally before they ever leave
  // the browser, then sends only ciphertext to the server.
  async function handleCreateOrUpdate(form) {
    try {
      const payload = {
        ...form,
        password: await encryptField(vaultKey, form.password),
        notes: form.notes ? await encryptField(vaultKey, form.notes) : "",
      };

      if (editing) {
        const { data } = await api.put(`/vault/${editing.id}`, payload);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === editing.id ? { ...data.entry, password: form.password, notes: form.notes } : e
          )
        );
      } else {
        const { data } = await api.post("/vault", payload);
        setEntries((prev) => [{ ...data.entry, password: form.password, notes: form.notes }, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.error || "Could not save this entry.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this password permanently?")) return;
    try {
      await api.delete(`/vault/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Could not delete this entry.");
    }
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesQuery =
        !query ||
        e.siteName.toLowerCase().includes(query.toLowerCase()) ||
        (e.username || "").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || e.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [entries, query, category]);

  const weakCount = useMemo(
    () => entries.filter((e) => scorePassword(e.password).score < 3).length,
    [entries]
  );

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-mist text-sm mt-1">
              {entries.length} {entries.length === 1 ? "password" : "passwords"} stored ·{" "}
              {weakCount > 0 ? (
                <span className="text-orange-400">{weakCount} could be stronger</span>
              ) : (
                <span className="text-cyan">all looking solid</span>
              )}
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan text-ink font-medium hover:bg-cyan-dim transition-colors self-start"
          >
            <FiPlus size={16} /> Add password
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by site or username…"
              className="w-full bg-panel border border-line rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-cyan/50 outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 text-xs px-3.5 py-2 rounded-lg border capitalize transition-colors ${
                  category === c
                    ? "border-cyan text-cyan bg-cyan/10"
                    : "border-line text-mist hover:border-line/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-mist text-sm">Decrypting your vault…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 border border-dashed border-line rounded-2xl">
            <FiShieldOff className="mx-auto text-mist mb-3" size={28} />
            <p className="text-mist">
              {entries.length === 0
                ? "Your vault is empty. Add your first password to get started."
                : "No entries match your search."}
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <PasswordCard
                key={entry.id}
                entry={entry}
                index={i}
                selected={selectedId === entry.id}
                onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
                onEdit={(e) => { setEditing(e); setShowForm(true); }}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        {weakCount > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 flex items-center gap-3 text-sm text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3"
          >
            <FiTrendingUp size={16} />
            {weakCount} of your passwords score below "Good". Open one and hit "Generate strong password" to upgrade it.
          </motion.div>
        )}
      </div>

      {showForm && (
        <VaultForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}
