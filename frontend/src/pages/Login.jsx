import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import AuthForms from "../components/AuthForms.jsx";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 bg-grid bg-[size:44px_44px]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 font-display font-semibold text-lg">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-ink">
            <FiShield size={16} />
          </span>
          VaultKeep
        </Link>
        <div className="bg-panel border border-line rounded-2xl p-8">
          <AuthForms initialTab="login" onSuccess={() => navigate("/dashboard")} />
        </div>
      </motion.div>
    </div>
  );
}
