import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { FiRefreshCw } from "react-icons/fi";
import api from "../utils/api";

// A small self-hosted math CAPTCHA (see backend/utils/captcha.js). Parent
// forms call `ref.current.getPayload()` to grab { captchaToken,
// captchaAnswer } right before submitting, and `ref.current.refresh()` to
// get a new question after a failed attempt.
const CaptchaChallenge = forwardRef(function CaptchaChallenge(_, ref) {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  async function fetchChallenge() {
    setLoading(true);
    setFetchError(false);
    setAnswer("");
    try {
      const { data } = await api.get("/auth/captcha");
      setChallenge(data);
    } catch (err) {
      console.error("Captcha fetch failed:", err);
      setChallenge(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChallenge();
  }, []);

  useImperativeHandle(ref, () => ({
    getPayload: () => ({ captchaToken: challenge?.token, captchaAnswer: answer }),
    refresh: fetchChallenge,
  }));

  return (
    <div>
      <label className="text-xs text-mist mb-1 block">Quick check: solve this</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm font-mono">
          {loading ? "…" : fetchError ? "Couldn't load — click ↻" : `${challenge?.question} = ?`}
        </div>
        <input
          required
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-24 bg-panel2 border border-line rounded-lg px-3 py-2.5 text-sm text-center focus:border-cyan/50 outline-none transition-colors"
          placeholder="?"
        />
        <button
          type="button"
          onClick={fetchChallenge}
          className="p-2.5 rounded-lg border border-line text-mist hover:text-cyan hover:border-cyan/50 transition-colors shrink-0"
          aria-label="New challenge"
        >
          <FiRefreshCw size={14} />
        </button>
      </div>
      <p className="text-xs text-mist/60 mt-1">A simple, self-hosted check — no third party involved.</p>
    </div>
  );
});

export default CaptchaChallenge;
