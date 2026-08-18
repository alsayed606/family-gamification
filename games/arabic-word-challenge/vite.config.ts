import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from the hub under /games/arabic-word-challenge/ once built,
// so asset URLs must be relative rather than root-absolute.
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
