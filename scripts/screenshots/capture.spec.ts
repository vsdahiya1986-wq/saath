import { test, expect, Page } from '@playwright/test';

/**
 * PPT screenshots, 1280 × 800, Aita's Day sample, into docs/screenshots/.
 * The clock is pinned to 08:05 so Aita's 08:00 medicine is due for shot 09 and
 * every run produces the same pictures.
 */

const OUT = 'docs/screenshots';
const shot = (page: Page, name: string) => page.screenshot({ path: `${OUT}/${name}.png` });

async function setLanguage(page: Page, language: 'en' | 'as') {
  await page.goto('/circle/setup');
  // The form loads the saved profile asynchronously; choosing before it lands
  // gets overwritten by the stored language.
  await expect(page.getByLabel('Name')).toHaveValue('Aita (sample)');
  await page.getByLabel('Language').selectOption(language);
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/circle$/);
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800); // entrance animations
}

test('capture', async ({ page }) => {
  const now = new Date();
  now.setHours(8, 5, 0, 0);
  await page.clock.setFixedTime(now);

  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });
  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await setLanguage(page, 'en');

  await page.goto('/');
  await expect(page.getByText(/Three for today:/)).toBeVisible();
  await settle(page);
  await shot(page, '01-home-en');

  await page.goto('/play/today_me');
  await expect(page.getByTestId('orientation-choice').first()).toBeEnabled({ timeout: 15_000 });
  await settle(page);
  await shot(page, '03-today-me');

  await page.goto('/play/saah_pat');
  const targets = page.locator('[data-testid="sprig-tile"][data-target="yes"]');
  await expect(targets.first()).toBeEnabled({ timeout: 15_000 });
  await targets.nth(0).click();
  await targets.nth(1).click();
  await settle(page);
  await shot(page, '04-saah-pat');

  // Apon Mukh: keep card 0's label, try each other card against it until a pair matches.
  await page.goto('/play/apon_mukh');
  const cards = page.getByTestId('memory-card');
  await expect(cards.first()).toBeEnabled({ timeout: 15_000 });
  for (let j = 1; j < (await cards.count()); j++) {
    await cards.nth(0).click();
    const label = await cards.nth(0).getAttribute('aria-label');
    await cards.nth(j).click();
    if ((await cards.nth(j).getAttribute('aria-label')) === label) break;
    await page.waitForTimeout(1_400); // mismatch flips back after 1.2 s
  }
  await settle(page);
  await shot(page, '05-apon-mukh');

  await page.goto('/play/sort_home');
  const baskets = page.getByTestId('sort-basket');
  await expect(baskets.first()).toBeEnabled({ timeout: 15_000 });
  for (let i = 0; i < 2; i++) {
    await baskets.first().click();
    await page.waitForTimeout(2_000);
  }
  await settle(page);
  await shot(page, '06-sort-home');

  await page.goto('/play/next_step');
  const steps = page.getByTestId('step-tile');
  await expect(steps.first()).toBeEnabled({ timeout: 15_000 });
  await steps.first().click();
  await page.waitForTimeout(600);
  await steps.first().click();
  await settle(page);
  await shot(page, '07-next-step');

  // Finish Today & Me by tapping whatever is offered; errorless, so it always ends.
  await page.goto('/play/today_me');
  const done = page.getByTestId('activity-complete');
  const choices = page.getByTestId('orientation-choice');
  await expect(choices.first()).toBeEnabled({ timeout: 15_000 });
  for (let i = 0; i < 20 && !(await done.isVisible()); i++) {
    if (await choices.count()) await choices.first().click();
    await page.waitForTimeout(2_000);
  }
  await expect(done).toBeVisible();
  await settle(page);
  await shot(page, '08-complete');

  await page.goto('/today');
  await expect(page.getByTestId('reminder-due-card')).toBeVisible({ timeout: 15_000 });
  await settle(page);
  await shot(page, '09-ghonta-due');

  await page.goto('/circle');
  await expect(page.getByTestId('nudge').first()).toBeVisible();
  await settle(page);
  await shot(page, '10-circle-nudges');

  await page.goto('/circle/board');
  await page.getByTestId('trend-lines').scrollIntoViewIfNeeded();
  await settle(page);
  await shot(page, '11-circle-board');

  // The decision for the sample needs its (synthetic) evidence switched on.
  await page.goto('/inspector');
  await page.getByRole('switch', { name: /Include synthetic/ }).click();
  await page.getByRole('heading', { name: 'How the decision is made' }).scrollIntoViewIfNeeded();
  await settle(page);
  await shot(page, '12-evidence');

  await page.goto('/circle');
  await page.getByTestId('no-signal-toggle').click();
  await page.goto('/play/hear_find');
  await expect(page.getByTestId('status-badge')).toHaveAttribute('data-state', 'simulated');
  await settle(page);
  await shot(page, '13-no-signal');
  await page.goto('/circle');
  await page.getByTestId('no-signal-toggle').click();

  await page.goto('/circle/visit');
  await expect(page.getByTestId('visit-footer')).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await settle(page);
  await shot(page, '14-visit-card');
  await page.emulateMedia({ media: 'screen' });

  await setLanguage(page, 'as');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'as');
  await settle(page);
  await shot(page, '02-home-as');
});
