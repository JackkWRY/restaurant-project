import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Test environment
    environment: "node",

    // Setup files to run before each test file
    setupFiles: ["./src/__tests__/setup.ts"],

    // Test file patterns
    include: ["src/__tests__/**/*.test.ts"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "src/server.ts",
        "prisma/",
        "dist/",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Test timeout (10 seconds)
    testTimeout: 10000,

    // Hooks timeout
    hookTimeout: 10000,
  },

  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
