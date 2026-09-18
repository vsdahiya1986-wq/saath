import { test, expect, Page } from '@playwright/test';

/**
 * Acceptance for 07_TRANSLATION_AND_REMAINING.md: B1 reminder actions, B2 calm
 * Today screen, B3 no clipped Assamese, C3 End → /play, C4 visible retry, and
 * E1 No-Signal Mode end to end. The clock is pinned where time of day matters:
 * the sample's reminders are seeded relative to load time.
 */

/** 10:00 today — Aita's medicine is seeded 5 minutes before load, so it is due. */
function tenAm(offsetMin = 0) {
  const d = new Date();
  d.setHours(10, offsetMin, 0, 0);
  return d;
}

async function loadSample(page: Page) {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });
}

async function openCircle(page: Page) {
  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await expect(page.getByTestId('circle-summary')).toBeVisible();
}

async function useEnglish(page: Page) {
  await page.goto('/circle/setup');
  await expect(page.getByLabel('Name')).toHaveValue('Aita (sample)');
  await page.getByLabel('Language').selectOption('en');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/circle$/);
}

test.describe('B1 — reminder actions', () => {
  test('Done on /today is recorded and the card changes state', async ({ page }) => {
    await page.clock.setFixedTime(tenAm());
    await loadSample(page);
    await page.goto('/today');
    const due = page.getByTestId('reminder-due-card');
    await expect(due).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('reminder-done').click();
    await expect(due).toBeHidden();
    // Nothing is left waiting; a done card sorts after what is still to come.
    await expect(page.locator('[data-testid="reminder-row"][data-status="due"]')).toHaveCount(0);

    // It was written to reminder_logs, so a reload does not ask again.
    await page.reload();
    await expect(page.getByTestId('reminder-row').first()).toBeVisible();
    await expect(page.getByTestId('reminder-due-card')).toHaveCount(0);
    await expect(page.locator('[data-testid="reminder-row"][data-status="due"]')).toHaveCount(0);
  });

  test('Not now keeps it quiet, and it comes back after ten minutes', async ({ page }) => {
    await page.clock.setFixedTime(tenAm());
    await loadSample(page);
    await page.goto('/today');
    await page.getByTestId('reminder-not-now').click();
    await expect(page.getByTestId('reminder-row').filter({ hasText: /Blood pressure/ })).toHaveAttribute('data-status', 'snoozed');

    await page.clock.setFixedTime(tenAm(11));
    await page.reload();
    await expect(page.getByTestId('reminder-due-card')).toBeVisible({ timeout: 15_000 });
  });

  test('a missed card in the list can still be marked Done, with a button of at least 64 px', async ({ page }) => {
    await page.clock.setFixedTime(tenAm());
    await loadSample(page);
    // 45 minutes after the medicine was due, unanswered: the sweep marks it missed.
    await page.clock.setFixedTime(tenAm(40));
    await page.goto('/today');
    const medicine = page.getByTestId('reminder-row').filter({ hasText: /Blood pressure/ });
    await expect(medicine).toHaveAttribute('data-status', 'missed');

    const done = medicine.getByTestId('reminder-row-done');
    const box = (await done.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(63.5);
    expect(box.width).toBeGreaterThanOrEqual(63.5);
    await done.click();
    await expect(page.locator('[data-testid="reminder-row"][data-status="missed"]')).toHaveCount(0);
  });
});

test('B2 — the person’s Today screen has no alarm red, and at most three cards', async ({ page }) => {
  await page.clock.setFixedTime(tenAm());
  await loadSample(page);
  await page.goto('/today');
  await page.getByTestId('reminder-not-now').click();
  await expect(page.getByTestId('reminder-row').first()).toBeVisible();

  expect(await page.getByTestId('reminder-row').count()).toBeLessThanOrEqual(3);
  const red = await page.locator('main *').evaluateAll((els) =>
    els
      .map((e) => getComputedStyle(e))
      .filter((c) => [c.color, c.backgroundColor, c.borderTopColor].some((v) => v === 'rgb(159, 18, 57)' || v === 'rgb(253, 236, 239)')).length,
  );
  expect(red).toBe(0);
});

test.describe('B3 — Assamese never clips', () => {
  const PAGES = ['/', '/play', '/today', '/help', '/play/today_me', '/play/hear_find', '/play/sort_home', '/play/next_step', '/play/saah_pat', '/play/apon_mukh', '/play/together'];
  for (const width of [360, 768, 1280]) {
    test(`at ${width} px`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 900 });
      await page.clock.setFixedTime(tenAm(40)); // nothing due, so no full-screen card
      await loadSample(page);
      const clipped: string[] = [];
      for (const path of PAGES) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(400);
        const found = await page.evaluate(() => {
          const out: string[] = [];
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) out.push('page scrolls sideways');
          for (const el of document.querySelectorAll<HTMLElement>('main *')) {
            const c = getComputedStyle(el);
            const clips = c.textOverflow === 'ellipsis' || ['hidden', 'clip'].includes(c.overflowX);
            if (clips && el.scrollWidth > el.clientWidth + 1 && el.innerText?.trim()) out.push(el.innerText.trim().slice(0, 40));
          }
          return out;
        });
        clipped.push(...found.map((f) => `${path}: ${f}`));
      }
      expect(clipped).toEqual([]);
    });
  }
});

test('C3 — End leaves the activity for the activity list', async ({ page }) => {
  await loadSample(page);
  await page.goto('/play/today_me');
  await expect(page.getByTestId('orientation-choice').first()).toBeEnabled({ timeout: 15_000 });
  await page.getByTestId('exit-end').click();
  await expect(page).toHaveURL(/\/play$/);
});

test('C4 — a first wrong answer says "look again" on screen, not only aloud', async ({ page }) => {
  await page.clock.setFixedTime(tenAm(40)); // morning
  await loadSample(page);
  await openCircle(page);
  await useEnglish(page);
  await page.goto('/play/today_me');
  const wrong = page.getByTestId('orientation-choice').filter({ hasNotText: 'Morning' }).first();
  await expect(wrong).toBeEnabled({ timeout: 15_000 });
  await wrong.click();
  await expect(page.getByTestId('retry-message')).toHaveText('Let us look again.');
});

test('E1 — No-Signal Mode persists, is labelled honestly, and a session plus a Care Note complete under it', async ({ page }) => {
  test.setTimeout(90_000);
  await loadSample(page);
  await openCircle(page);
  await useEnglish(page);

  await page.getByTestId('no-signal-toggle').click();
  await page.reload();
  await expect(page.getByTestId('status-badge')).toHaveAttribute('data-state', 'simulated');

  await page.goto('/play/today_me');
  await expect(page.getByTestId('status-badge')).toHaveAttribute('data-state', 'simulated');
  const choices = page.getByTestId('orientation-choice');
  const done = page.getByTestId('activity-complete');
  await expect(choices.first()).toBeEnabled({ timeout: 15_000 });
  for (let i = 0; i < 20 && !(await done.isVisible()); i++) {
    if (await choices.count()) await choices.first().click();
    await page.waitForTimeout(2_000);
  }
  await expect(done).toBeVisible();

  await page.goto('/circle');
  const note = page.getByTestId('care-note');
  await note.getByRole('button', { name: 'Mood' }).click();
  await note.getByRole('button', { name: 'Save note' }).click();
  await expect(note.getByRole('status')).toBeVisible();

  await page.getByTestId('no-signal-toggle').click();
  await expect(page.getByTestId('status-badge')).not.toHaveAttribute('data-state', 'simulated');
});
