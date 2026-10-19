/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070a10",        // near-black base background
        panel: "#0d121b",      // card/panel surface
        panel2: "#121826",     // slightly raised surface
        line: "#1e2635",       // hairline borders
        mist: "#7c879b",       // muted secondary text
        cloud: "#e8ecf1",      // primary text
        cyan: {
          DEFAULT: "#00d9c0",
          dim: "#06a892",
        },
        violet: {
          DEFAULT: "#7c5cff",
          dim: "#5b3fd6",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(0, 217, 192, 0.35)",
        glowViolet: "0 0 40px -10px rgba(124, 92, 255, 0.35)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(1.5deg)" },
        },
        spinSlow: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        spinSlow: "spinSlow 18s linear infinite",
      },
    },
  },
  plugins: [],
};
