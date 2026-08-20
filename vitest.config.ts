import { defineConfig } from "vitest/config";

// اختبارات الوحدة للمنطق الخالص: لا تحتاج محاكيًا ولا متصفحًا.
// اختبارات القواعد منفصلة في vitest.rules.config.ts لأنها تتطلب المحاكي.
export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
