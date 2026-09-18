import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/** `npm run screenshots` — the 14 PPT shots (05_TESTS_AND_DONE §6), not a gate. */
export default defineConfig({
  ...base,
  testDir: './scripts/screenshots',
  timeout: 180_000,
  use: { ...base.use, viewport: { width: 1280, height: 800 } },
});
