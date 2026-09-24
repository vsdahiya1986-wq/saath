import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Fix pack 12: a Hindi profile really renders Hindi, end to end, from the
 * shipped manifest — the same assertion `assamese.spec.ts` makes, on the
 * second locale. Expected text is read from the manifest, never typed here.
 */
const HI = JSON.parse(fs.readFileSync(path.join('public', 'content', 'lang', 'hi', 'manifest.json'), 'utf8'));
const EN_LETTERS = /[A-Za-z]{3,}/;

test('a profile can be set to Hindi, and the person screens are Hindi', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up a profile' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await page.getByRole('link', { name: /Person profile/ }).click();
  await page.getByLabel('Name').fill('Hindi Person');
  // The switch offers all three; the default is untouched.
  await expect(page.getByLabel('Language').locator('option')).toHaveCount(3);
  await page.getByLabel('Language').selectOption('hi');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/circle$/);

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  const home = page.locator('main');
  await expect(home).toContainText(HI['home.play'].text, { timeout: 15_000 });
  await expect(home).toContainText(HI['home.today'].text);
  await expect(home).toContainText(HI['home.help'].text);
});

test('a Hindi profile sees Hindi questions in an activity', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up a profile' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await page.getByRole('link', { name: /Person profile/ }).click();
  await page.getByLabel('Name').fill('Hindi Person');
  await page.getByLabel('Language').selectOption('hi');
  await page.getByRole('button', { name: 'Save profile' }).click();
  // Wait for the app's own post-save navigation, as every other spec does:
  // save() awaits two IndexedDB/Preferences writes before router.push, and the
  // goto below can abort them mid-flight, leaving no person and so no
  // question. This was the one call site missing the wait, and it failed in CI
  // under load while passing everywhere else.
  await expect(page).toHaveURL(/\/circle$/);

  await page.goto('/play/sort_home');
  const question = page.getByTestId('question').first();
  await expect(question).toBeVisible({ timeout: 15_000 });
  // `q.sort_home.where` passed verification, so this screen must not be English.
  expect(HI['q.sort_home.where'].text).not.toMatch(EN_LETTERS);
  expect(await question.innerText()).not.toMatch(EN_LETTERS);
});
