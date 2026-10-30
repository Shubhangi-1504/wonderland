/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Run in Node — no DOM needed for pure TypeScript simulation tests.
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    // Reporter used in CI; add 'verbose' locally when debugging.
    reporters: ['default'],
  },
});
