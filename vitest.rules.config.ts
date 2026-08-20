import { defineConfig } from "vitest/config";

// اختبارات قواعد Firestore تعمل مقابل المحاكي، لا في المتصفح.
// معزولة عن اختبارات الألعاب في games/* بملف إعداد مستقل.
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    // القواعد تُقيَّم على المحاكي: تسلسل الملفات يمنع تعارض clearFirestore
    // بين ملفات الاختبار على نفس قاعدة البيانات المشتركة.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
