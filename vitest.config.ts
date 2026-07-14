import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    testTimeout: 60000,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
