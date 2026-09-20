import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Fix pack 11, Tiers 2.1, 2.2, 2.3 and 3, walked on Aita's Day — an Assamese
 * profile with eight weeks of seeded history, which is the only way to see a
 * week-on-week comparison at all.
 */
const AS = JSON.parse(fs.readFileSync(path.join('public', 'content', 'lang', 'as', 'manifest.json'), 'utf8'));

async function sampleInCircle(page: Page) {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });
  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  // The hub paints before the active person resolves; this is a load, not a poll of nothing.
  await expect(page.getByTestId('circle-summary')).toContainText('Aita (sample)', { timeout: 15_000 });
}

test('Circle opens with one observational line about this person own week', async ({ page }) => {
  await sampleInCircle(page);
  const strip = page.getByTestId('status-strip');
  await expect(strip).toBeVisible({ timeout: 15_000 });

  // Whichever of the five lines it picked, it must be that line in Assamese.
  const key = await strip.getAttribute('data-strip');
  expect(['strip.usual', 'strip.fewer', 'strip.more', 'strip.quiet', 'strip.early']).toContain(key);
  await expect(strip).toContainText(AS[key!].text);
  // Never a clinical reading, and never a comparison with anyone else.
  await expect(strip).not.toContainText(/declin|worsen|\brisk\b|normal|average/i);
});

test('the thirty-day view counts days, says today, and concludes nothing', async ({ page }) => {
  await sampleInCircle(page);
  const card = page.getByTestId('participation');
  await expect(card).toBeVisible({ timeout: 15_000 });

  await expect(card).toContainText(AS['trend.title'].text);
  await expect(page.getByTestId('participation-bars').locator('span')).toHaveCount(30);
  await expect(card).toContainText(AS['trend.observational'].text);
  await expect(page.getByTestId('today-line')).toContainText(AS['day.title'].text);
  await expect(card).not.toContainText(/declin|worsen|\brisk\b|\bscore\b/i);
});

test('a person with almost no history is told so, not shown a trend', async ({ page }) => {
  // A fresh profile: no sample, no seeded weeks.
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up a profile' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await page.getByRole('link', { name: /Person profile/ }).click();
  await page.getByLabel('Name').fill('New Person');
  await page.getByLabel('Language').selectOption('en');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/circle$/);

  await expect(page.getByTestId('participation-too-little')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('status-strip')).toHaveAttribute('data-strip', 'strip.early');
});

test('the mood tap is optional, and what it records reaches Circle', async ({ page }) => {
  await sampleInCircle(page);

  // Finishing an activity never requires it: the completion screen is reached
  // without touching a face, and both onward buttons are there.
  await page.goto('/play/together');
  await page.getByTestId('together-done').click();
  await expect(page.getByTestId('activity-complete')).toBeVisible({ timeout: 15_000 });
  const mood = page.getByTestId('mood-check');
  await expect(mood).toBeVisible();
  await expect(mood).toContainText(AS['mood.question'].text);

  await page.getByTestId('mood-good').click();
  await expect(page.getByTestId('mood-good')).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/circle');
  await expect(page.getByTestId('participation-mood')).toContainText(AS['trend.mood_said'].text);
});

test('the thirty-day view stays inside a 360 px screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await sampleInCircle(page);
  const card = page.getByTestId('participation');
  await expect(card).toBeVisible({ timeout: 15_000 });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'Circle scrolls sideways at 360 px').toBeLessThanOrEqual(0);

  // Every label inside the card must fit its own box, Assamese included.
  const spills = await card.evaluate((root) =>
    [...root.querySelectorAll('p, span, h2, h3')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent ?? ''),
  );
  expect(spills).toEqual([]);
});
