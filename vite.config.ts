import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base نسبي: يجعل الناتج يعمل من أي مسار فرعي (GitHub Pages, Firebase
// Hosting, أو فتح الملفات محليًا) بلا إعادة بناء.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
});
