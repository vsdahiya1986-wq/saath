import { test, expect, Page } from '@playwright/test';

/**
 * Phase 5 caregiver layer, walked the way a caregiver would with Aita's Day
 * loaded: see the nudge and acknowledge it (F7), log a care note in a few taps
 * (F8), see it on the Board next to the Trend Lines (F10), open the Visit Card
 * (F11), and switch people from Home without typing (F9).
 */

async function sampleInCircle(page: Page) {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });
  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await expect(page.getByTestId('circle-summary')).toContainText('Aita (sample)');
}

test('a missed medicine shows as a nudge and can be acknowledged', async ({ page }) => {
  await sampleInCircle(page);
  const nudge = page.getByTestId('nudge').filter({ hasText: /Medicine at .* was not marked done\./ });
  await expect(nudge).toHaveAttribute('data-state', 'open');
  await nudge.getByRole('button', { name: 'Acknowledge' }).click();
  await expect(nudge).toHaveAttribute('data-state', 'acknowledged');
  await expect(nudge).toContainText('Seen by');
});

test('a care note takes two taps and reaches the Board and the Visit Card', async ({ page }) => {
  await sampleInCircle(page);
  const card = page.getByTestId('care-note');
  await card.getByRole('button', { name: 'Sleep' }).click();
  await card.getByRole('button', { name: 'Save note' }).click();
  await expect(card.getByRole('status')).toBeVisible();

  await page.goto('/circle/board');
  await expect(page.getByTestId('care-note-row')).toHaveCount(4); // three sample notes + this one
  await expect(page.getByTestId('trend-lines')).toBeVisible();
  await expect(page.getByTestId('circle-nudges')).toBeVisible();

  await page.goto('/circle/visit');
  await expect(page.getByTestId('visit-card')).toContainText('Visit Card · Aita, 70-79');
  await expect(page.getByTestId('visit-footer')).toHaveText(
    'SAATH is a cognitive-stimulation and care-coordination aid. It does not diagnose or assess dementia.',
  );
});

test('trend screens never use conclusion words', async ({ page }) => {
  await sampleInCircle(page);
  for (const path of ['/circle', '/circle/board', '/inspector']) {
    await page.goto(path);
    await expect(page.getByTestId(path === '/inspector' ? 'trend-lines' : 'circle-nudges')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/declin|worsen|\brisk\b/i);
  }
});

test('Home offers Switch when a device has two people, and it switches in one tap', async ({ page }) => {
  await sampleInCircle(page);
  await page.goto('/circle/people');
  await page.getByRole('button', { name: /Load demo personas/ }).click();
  await expect(page.getByText('Demo · Ratna Bora', { exact: true })).toBeVisible();

  await page.goto('/');
  await page.getByTestId('switch-person').click();
  await page.getByRole('button', { name: 'Switch to Demo · Ratna Bora' }).click();
  await expect(page.getByRole('heading', { name: 'Demo · Ratna Bora' })).toBeVisible();
});
