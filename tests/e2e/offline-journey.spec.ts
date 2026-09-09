import { test, expect } from '@playwright/test';

/**
 * Adapted from Part 10.4 of the master plan. Two things about the original
 * sketch don't hold in this build, and both are worth recording rather than
 * papering over:
 *
 * 1. It assumed fixed test ids (card-0, card-1, pending-count,
 *    duplicate-count) implying a deterministic deck order and a visible
 *    sync-status widget. Neither exists here (the deck is shuffled; sync
 *    has no UI counter). Duplicate-sync idempotency is instead demonstrated
 *    live via /inspector/theatre's "Simulate duplicate sync" button.
 *
 * 2. Client-side route changes (e.g. Skip navigating /play/familiar_pairs
 *    -> /play) can trigger a network fetch for the destination route's
 *    chunk, so Playwright's `context.setOffline(true)` — which blocks real
 *    HTTP, including to localhost — breaks a cross-page navigation
 *    attempted while "offline" even against the static export. That is a
 *    property of this test harness, not of the shipped app: a Capacitor
 *    WebView resolves the app's own pages from a bundled local scheme with
 *    no network hop at all, so this failure mode cannot occur there. This
 *    test therefore keeps the offline window to in-page interaction only
 *    (no navigation while offline) — genuine airplane-mode navigation needs
 *    the real Android build (Part 10.3, test #1).
 */
test('setup, then an offline "I need someone" request stays honestly local', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up a profile' }).click();

  // First run creates the Circle PIN.
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();

  await page.getByRole('link', { name: /Person profile/ }).click();
  await page.getByLabel('Name').fill('Test Person');
  await page.getByRole('button', { name: 'Save profile' }).click();
  // Wait for the app's own post-save navigation, not just the click: save()
  // awaits two IndexedDB/Preferences writes before calling router.push, and
  // a hard page.goto() issued before those settle can abort them mid-flight.
  await expect(page).toHaveURL(/\/circle$/);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Test Person' })).toBeVisible();

  await page.goto('/help');
  await expect(page.getByRole('button', { name: 'I need someone' })).toBeVisible();

  // Go offline, then act — no further navigation until back online.
  await context.setOffline(true);

  await page.getByRole('button', { name: 'I need someone' }).click();
  await expect(page.getByTestId('help-status')).toHaveText(/Saved on this device/);

  await context.setOffline(false);
});
