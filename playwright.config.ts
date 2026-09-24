import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // fullyParallel:false only serialises tests *within* a file; files still run
  // across workers. These specs share one origin's device state (profiles in
  // localStorage/IndexedDB), so parallel files clobber each other and fail a
  // different subset each run. One worker is the fix; retries would hide it.
  workers: 1,
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
  // `list` keeps the terminal readable; `html` is what CI uploads on failure.
  // Without the html reporter there is no playwright-report/ to archive at all.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    // `a due reminder shows the card in-app` failed once in a full run and
    // could not be reproduced in 45 runs after. Keep the evidence next time;
    // no retries, which would hide it.
    trace: 'retain-on-failure',
    // Three CI-only bugs in a row (the clipped A++ label, the post-save race)
    // were diagnosed from log text alone, because nothing was uploaded to look
    // at. These cost nothing on a green run and write only on a failure.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
