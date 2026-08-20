import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base نسبي: يجعل الناتج يعمل من أي مسار فرعي (GitHub Pages, Firebase
// Hosting, أو فتح الملفات محليًا) بلا إعادة بناء.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // فصل Firebase وReact في حزم ثابتة: نادرة التغيّر، فتبقى في ذاكرة
        // المتصفح عبر النشرات بدل إعادة تنزيلها مع كل تعديل في كود التطبيق.
        // لا يقلّل هذا حجم أول تحميل — Firebase مطلوب عند الإقلاع للمصادقة —
        // لكنه يقلّل ما يُنزَّل في الزيارات اللاحقة.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase") || id.includes("@firebase")) return "firebase";
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/") || id.includes("/react-dom/")) return "react";
        },
      },
    },
  },
});
