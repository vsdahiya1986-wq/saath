import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 08 item 3: on an Assamese profile the full-screen due card led with the
 * caregiver's English care-plan text and had no translated sentence at all.
 * The expected Assamese is read from the shipped manifest, never typed here.
 */
const AS = JSON.parse(fs.readFileSync(path.join('public', 'content', 'lang', 'as', 'manifest.json'), 'utf8'));

test('the due card leads with the translated reminder sentence for an Assamese profile', async ({ page }) => {
  const tenAm = new Date();
  tenAm.setHours(10, 0, 0, 0);
  await page.clock.setFixedTime(tenAm); // Aita's medicine is seeded 5 minutes before load: due now
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });

  await page.goto('/today');
  const card = page.getByTestId('reminder-due-card');
  await expect(card).toBeVisible({ timeout: 15_000 });

  const sentence = AS['remind.medicine'].text;
  expect(sentence).not.toBe('It is time for your medicine.'); // the manifest really has Assamese here
  await expect(card.getByTestId('reminder-due-sentence')).toHaveText(sentence);
  // The caregiver's own words stay, as the smaller detail line.
  await expect(card.getByTestId('reminder-due-detail')).toContainText('Blood pressure tablet');
});
