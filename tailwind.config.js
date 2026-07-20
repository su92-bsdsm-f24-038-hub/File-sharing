/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "indigo-black": "#09090B",
        "secondary-bg": "#111217",
        "card-bg": "#15171D",
        "primary-orange": "#FF7A1A",
        "glow-orange": "#FF9A3D",
        "room-accent": "var(--room-accent, #FF7A1A)",
        "room-glow": "var(--room-glow, rgba(255, 122, 26, 0.4))",
        "cyan-accent": "#3B82F6", // Downgraded to secondary functional
        "emerald-accent": "#10B981", // Reserved for success/connected
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "blob": "blob 7s infinite",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "border": "border 4s linear infinite",
        "beam-draw": "beam-draw var(--duration, 4s) linear infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        border: {
          to: { "--border-angle": "360deg" },
        },
        "beam-draw": {
          "0%": { strokeDashoffset: "200%" },
          "100%": { strokeDashoffset: "0%" },
        }
      },
    },
  },
  plugins: [],
};
