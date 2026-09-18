import { test, expect, Page } from '@playwright/test';

/**
 * Phase 6: B7 (language survives navigation), F12 (Easy View, 64px targets)
 * and F13 (Rest Pause).
 */

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

const GAMES = ['today_me', 'hear_find', 'sort_home', 'next_step', 'saah_pat', 'apon_mukh', 'together'];

test('B7: an Assamese profile stays Assamese across Home → Play → every game → back', async ({ page }) => {
  test.setTimeout(120_000); // 7 games × 3 navigations
  await setUpProfile(page, 'as');
  await page.goto('/');
  for (const game of GAMES) {
    await page.goto('/play');
    await expect(page.locator('html')).toHaveAttribute('lang', 'as');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText('Choose an activity');

    await page.goto(`/play/${game}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'as');
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', 'as');
  }
});

/** Person-facing screens only; Circle is the caregiver's. */
const PERSON_PAGES = ['/', '/play', '/today', '/help', ...GAMES.map((g) => `/play/${g}`)];

test('F12: every button and link on person-facing screens is at least 64 × 64', async ({ page }) => {
  await setUpProfile(page, 'en');
  const small: string[] = [];
  for (const path of PERSON_PAGES) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const found = await page.locator('button:visible, a:visible').evaluateAll((els) =>
      els
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { r, label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40) };
        })
        .filter(({ r }) => r.width > 0 && (r.width < 63.5 || r.height < 63.5))
        .map(({ r, label }) => `${Math.round(r.width)}×${Math.round(r.height)} "${label}"`),
    );
    small.push(...found.map((f) => `${path}: ${f}`));
  }
  expect(small).toEqual([]);
});

test('F12: A++ is saved on the person and the page still fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setUpProfile(page, 'en');
  await page.goto('/');
  await page.getByRole('button', { name: 'Largest text' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-text-scale', '1.3');

  for (const path of ['/', '/play', '/today', '/help']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-text-scale', '1.3');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} scrolls sideways at A++`).toBeLessThanOrEqual(1);
  }
});

test('F13: after ten minutes of play the next activity offers a rest, and One more carries on', async ({ page }) => {
  await setUpProfile(page, 'en');
  await page.goto('/');
  await page.evaluate(() => {
    const now = Date.now();
    sessionStorage.setItem('saath_play_run', JSON.stringify({ since: now - 11 * 60_000, last: now - 2 * 60_000 }));
  });

  await page.goto('/play/today_me');
  await expect(page.getByTestId('rest-pause')).toContainText('Shall we rest for a while?');
  await page.getByTestId('rest-one-more').click();
  await expect(page.getByTestId('rest-pause')).toHaveCount(0);
  await expect(page.locator('[data-testid="orientation-choice"]').first()).toBeVisible();

  // The run restarted, so the next activity plays straight away.
  await page.goto('/play/hear_find');
  await expect(page.getByTestId('rest-pause')).toHaveCount(0);
});

test('F13: Rest now goes home', async ({ page }) => {
  await setUpProfile(page, 'en');
  await page.goto('/');
  await page.evaluate(() => {
    const now = Date.now();
    sessionStorage.setItem('saath_play_run', JSON.stringify({ since: now - 11 * 60_000, last: now - 60_000 }));
  });
  await page.goto('/play/today_me');
  await page.getByTestId('rest-now').click();
  await expect(page).toHaveURL(/\/$/);
});
