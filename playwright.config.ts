import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // Serves the actual static export (`out/`), not `next dev`. This matters:
  // the shipped app runs inside a Capacitor WebView with no server at all,
  // so client-side navigation must resolve from the local bundle. Testing
  // against `next dev` instead produced a false failure — offline
  // navigation triggered a real RSC fetch to the dev server and hit a
  // browser network-error page, which cannot happen in the packaged app.
  webServer: {
    command: 'npm run build && npx serve out -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    // `a due reminder shows the card in-app` failed once in a full run and
    // could not be reproduced in 45 runs after. Keep the evidence next time;
    // no retries, which would hide it.
    trace: 'retain-on-failure',
  },
});
