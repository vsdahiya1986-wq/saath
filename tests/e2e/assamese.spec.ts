import { test, expect } from '@playwright/test';

/**
 * Fix pack A1: with Aita's Day (an Assamese profile) every activity's question
 * and answer options were English. Assert there are no English words in them —
 * stricter than "not equal to the English string", which a half-translated
 * sentence would pass.
 */

const ENGLISH_WORD = /[A-Za-z]{3,}/;

/** Each activity's answer controls; Saah Pat's sprigs and Apon Mukh's face-down cards carry no words. */
const OPTIONS: Record<string, string> = {
  today_me: '[data-testid="orientation-choice"]',
  // A family photo keeps the title the family typed; only drawings are ours to translate.
  hear_find: '[data-testid="sound-sight-choice"]:not([data-family])',
  sort_home: '[data-testid="sort-basket"]',
  next_step: '[data-testid="step-tile"]',
  saah_pat: '',
  apon_mukh: '',
  together: '',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });
});

for (const [activity, options] of Object.entries(OPTIONS)) {
  test(`${activity}: question and options are not English on an Assamese profile`, async ({ page }) => {
    await page.goto(`/play/${activity}`);
    const question = page.getByTestId('question').first();
    await expect(question).toBeVisible({ timeout: 15_000 });
    expect(await question.innerText(), 'question').not.toMatch(ENGLISH_WORD);

    if (options) {
      const texts = await page.locator(options).allInnerTexts();
      expect(texts.filter((x) => ENGLISH_WORD.test(x)), 'options').toEqual([]);
    }
  });
}

test('the Home date line and reminder word are not English on an Assamese profile', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('main');
  await expect(main).not.toContainText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
  await expect(main).not.toContainText(/January|February|March|April|May|June|July|August|September|October|November|December/);
  await expect(main).not.toContainText(/Overdue|season/);
});
