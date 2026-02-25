import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/schemas/**",
        "src/services/**",
        "src/types/**",
        "src/lib/utils.ts",
        "src/actions/**",
        "src/components/**",
      ],
      exclude: [
        "src/__tests__/**",
        "src/**/*.test.{ts,tsx}",
        "src/lib/prisma.ts",
        "src/lib/auth.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
