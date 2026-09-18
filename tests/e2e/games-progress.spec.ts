import { test, expect, Page } from '@playwright/test';

/**
 * B1 acceptance (docs/saath-kit/01_BUGS.md): errorless learning means a person
 * can never get stuck. Tapping *any* option on every step must reach the
 * completion screen. This test deliberately taps the first offered choice
 * every time — often the wrong one — because that is what a person who cannot
 * find the answer does, and it is the path that used to hang.
 *
 * Before the fix, a wrong tap only flashed an outline: familiar_pairs sat on
 * "Step 2 of 2" for six taps and then ended as `not_completed`.
 */

const TAP_BUDGET = 20;
const STEPPED = ['today_me', 'hear_find', 'sort_home', 'next_step'];

/** Every activity's answer control, plus the finish button for the talk-only one. */
const CHOICE =
  '[data-testid="orientation-choice"], [data-testid="sound-sight-choice"], [data-testid="sort-basket"], [data-testid="step-tile"], button:has-text("Done talking")';

/** @param language the profile's language — the games must complete in both. */
async function setUpProfile(page: Page, language: 'en' | 'as') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up a profile' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await page.getByRole('link', { name: /Person profile/ }).click();
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Language').selectOption(language);
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/circle$/);
}

/** Taps the first available choice until the completion screen appears. */
async function tapUntilDone(page: Page, activity: string) {
  await page.goto(`/play/${activity}`);
  // Language-independent: the completion screen, not its wording.
  const done = page.getByTestId('activity-complete');
  const choices = page.locator(CHOICE);

  await expect(choices.first()).toBeEnabled({ timeout: 15_000 });

  for (let tap = 0; tap < TAP_BUDGET && !(await done.isVisible()); tap++) {
    if ((await choices.count()) === 0) break;
    await choices.first().click();
    // Feedback is animated (up to 1.8s) before the step advances.
    await page.waitForTimeout(2_000);
  }

  await expect(done, `${activity} did not reach its completion screen within ${TAP_BUDGET} taps`).toBeVisible();
}

/**
 * F4/F5: grid games where re-tapping one tile is deliberately a no-op, so the
 * taps cycle across the grid. Still arbitrary — never aimed at the answer.
 */
const GRID_GAMES: Record<string, string> = { saah_pat: '[data-testid="sprig-tile"]', apon_mukh: '[data-testid="memory-card"]' };

async function cycleUntilDone(page: Page, activity: string) {
  await page.goto(`/play/${activity}`);
  const done = page.getByTestId('activity-complete');
  const tiles = page.locator(GRID_GAMES[activity]);
  await expect(tiles.first()).toBeEnabled({ timeout: 15_000 });

  for (let tap = 0; tap < 80 && !(await done.isVisible()); tap++) {
    const n = await tiles.count();
    if (n === 0) break;
    await tiles.nth(tap % n).click({ timeout: 2_000 }).catch(() => {});
    await page.waitForTimeout(700); // Apon Mukh flips a mismatch back after 1.2s
  }

  await expect(done, `${activity} did not reach its completion screen`).toBeVisible({ timeout: 5_000 });
}

for (const language of ['en', 'as'] as const) {
  test.describe(`every activity completes in ${language}`, () => {
    test.beforeEach(async ({ page }) => {
      await setUpProfile(page, language);
    });

    for (const activity of [...STEPPED, 'together']) {
      test(activity, async ({ page }) => {
        await tapUntilDone(page, activity);
      });
    }

    for (const activity of Object.keys(GRID_GAMES)) {
      test(activity, async ({ page }) => {
        test.setTimeout(120_000); // up to pairs × 4 mismatches, each flipping back
        await cycleUntilDone(page, activity);
      });
    }
  });
}

test.describe('activity screens', () => {
  test.beforeEach(async ({ page }) => {
    await setUpProfile(page, 'en');
  });

  test('never render an ellipsis in place of a label (B2)', async ({ page }) => {
    for (const activity of STEPPED) {
      await page.goto(`/play/${activity}`);
      await expect(page.locator(CHOICE).first()).toBeEnabled({ timeout: 15_000 });
      await expect(page.getByText(/^\s*(\.\.\.|…)\s*$/), `${activity} shows a placeholder label`).toHaveCount(0);
    }
  });

  test('keep the person in the activity when they skip one step (B4)', async ({ page }) => {
    await page.goto('/play/sort_home');
    await expect(page.locator(CHOICE).first()).toBeEnabled({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Skip this one' }).click();
    await page.waitForTimeout(2_000);

    // Still in the activity, one step further on — not back at /play.
    await expect(page).toHaveURL(/\/play\/sort_home/);
    await expect(page.locator('[aria-label^="Step "]')).toHaveAttribute('aria-label', /Step 2 of/);
  });

  /** R4: the renamed routes keep the old links working. */
  test('redirect pre-rename activity URLs to their new slug', async ({ page }) => {
    for (const [old, slug] of [
      ['familiar_pairs', 'today_me'],
      ['sound_sight', 'hear_find'],
      ['pattern_garden', 'sort_home'],
      ['my_next_step', 'next_step'],
    ]) {
      await page.goto(`/play/${old}`);
      await expect(page).toHaveURL(new RegExp(`/play/${slug}$`), { timeout: 10_000 });
    }
  });

  test('show the elder a friendly adaptive line, never the engine text (B5)', async ({ page }) => {
    await page.goto('/play/sort_home');
    const badge = page.getByTestId('adaptive-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(/Same pace as last time|A gentler round today|A little more today|With a little help today/);
    await expect(badge).not.toHaveAttribute('title', /.+/);
    await expect(page.getByText(/Insufficient comparable evidence|posterior mean/)).toHaveCount(0);
  });
});
