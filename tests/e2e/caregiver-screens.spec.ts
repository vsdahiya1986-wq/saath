import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Fix pack 10, Tier 1: the two caregiver screens that say out loud what the app
 * already does. Both are read by a family member, so both are asserted the way
 * the elder's screens are — the Assamese really renders, and neither screen
 * says anything clinical.
 */
const AS = JSON.parse(fs.readFileSync(path.join('public', 'content', 'lang', 'as', 'manifest.json'), 'utf8'));

/** Aita's Day is an Assamese profile, which is what makes the language assertions real. */
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

test('Why these activities explains all seven and refuses to be a test', async ({ page }) => {
  await sampleInCircle(page);
  await page.goto('/circle/why');

  await expect(page.getByTestId('why-activity')).toHaveCount(7);
  // The disclaimer is the point of the screen: resemblance is not equivalence.
  await expect(page.getByTestId('why-disclaimer')).toContainText(AS['why.not_a_test'].text);
  // Nothing on it may read as a score, a result or a clinical judgement.
  await expect(page.locator('body')).not.toContainText(/diagnos|declin|worsen|\brisk\b|\bscore\b/i);
});

test('Why these activities is in Assamese on an Assamese profile', async ({ page }) => {
  await sampleInCircle(page);
  await page.goto('/circle/why');
  const first = page.getByTestId('why-activity').first();
  await expect(first).toContainText(AS['why.familiar_pairs.works_on'].text);
  await expect(first).toContainText(AS['why.familiar_pairs.similar_to'].text);
});

test('the privacy screen states what is kept, what is locked and what leaves', async ({ page }) => {
  await sampleInCircle(page);
  await page.goto('/circle/privacy');

  await expect(page.getByTestId('privacy-encryption')).toContainText(AS['privacy.locked'].text);
  await expect(page.getByTestId('privacy-leaves')).toContainText(AS['privacy.leaves'].text);
  await expect(page.getByTestId('privacy-leaves')).toContainText(AS['privacy.sync_on'].text);
  // The Act is named, and named as a description of the app — not a claim.
  await expect(page.getByTestId('privacy-dpdp')).toContainText(AS['privacy.dpdp'].text);
  await expect(page.locator('body')).not.toContainText(/certified|compliant|compliance/i);
});

test('removing everything takes two taps and really empties the device', async ({ page }) => {
  await sampleInCircle(page);
  await page.goto('/circle/privacy');

  const button = page.getByTestId('privacy-delete-all');
  await expect(button).toContainText(AS['privacy.delete_button'].text);
  await button.click();
  // One tap only arms it. Nothing is gone yet.
  await expect(button).toContainText(AS['privacy.delete_confirm'].text);
  expect(await countPersons(page)).toBeGreaterThan(0);

  await button.click();
  await expect(page.getByTestId('privacy-deleted')).toBeVisible();
  await expect.poll(() => countPersons(page)).toBe(0);
});

/** Reads the person count straight out of the store, not off a screen that could be stale. */
async function countPersons(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const db: IDBDatabase = await new Promise((resolve, reject) => {
      const open = indexedDB.open('saath_v1');
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    return new Promise<number>((resolve, reject) => {
      const req = db.transaction('persons', 'readonly').objectStore('persons').count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}
