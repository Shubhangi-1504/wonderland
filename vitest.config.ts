import { defineConfig } from "vitest/config";

// Pure-logic tests only; no DOM needed so the suite stays fast for a hackathon.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "api/**/*.test.ts"],
  },
});
