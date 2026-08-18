import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        awcBg: "#0A0F26",
        awcBg2: "#151C42",
        awcTile: "#1B2350",
        awcLine: "rgba(227,184,114,.28)",
        awcGold: "#E3B872",
        awcGoldSoft: "#F6DCA4",
        awcBlue: "#3B7BE8",
        awcRed: "#E0453F",
        awcInk: "#F4F0E6",
        awcMuted: "#98A2C8",
      },
      fontFamily: {
        title: ["'Aref Ruqaa'", "serif"],
        body: ["'Tajawal'", "'Segoe UI'", "Tahoma", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
