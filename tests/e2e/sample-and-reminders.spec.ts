import { test, expect } from '@playwright/test';

/**
 * F1: one tap from Welcome must reach a populated Home with "Sample" visible —
 * a judge should never have to fill in a form to see the app work.
 * F2: a due reminder shows the full-screen card in-app even when the browser
 * itself cannot ring, and answering it writes a reminder_logs row.
 */

test('one tap from Welcome loads the sample and labels it', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();

  await expect(page.getByRole('heading', { name: /Aita \(sample\)/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('sample-chip')).toBeVisible();
});

test('the sample populates the caregiver screens', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });

  // Circle is PIN-gated on first run; set one so we can look at the Board.
  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();

  await expect(page.getByTestId('circle-summary')).toContainText('Aita (sample)');
  // 14 days of sessions are recorded, so the Board is not an empty state.
  await page.goto('/circle/board');
  await expect(page.getByTestId('overall-trend')).toBeVisible();
});

test('the sample can be cleared again', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });

  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();

  await page.getByTestId('clear-sample').click();
  await expect(page.getByTestId('load-sample')).toBeVisible({ timeout: 15_000 });
});

test('a due reminder shows the card in-app, and Done is recorded', async ({ page }) => {
  // Pin the clock: "is this reminder due" is a function of the time of day, and
  // the form only offers quarter-hours, so a wall-clock run is not reproducible.
  // setFixedTime freezes Date without pausing timers, which the app still needs.
  await page.clock.setFixedTime(new Date('2026-09-18T10:10:00'));

  await page.goto('/');
  await page.getByRole('button', { name: 'Set up a profile' }).click();
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();
  await page.getByRole('link', { name: /Person profile/ }).click();
  await page.getByLabel('Name').fill('Test Person');
  await page.getByLabel('Language').selectOption('en');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page).toHaveURL(/\/circle$/);

  // 10:00, i.e. ten minutes ago — inside the 30-minute due window.
  await page.goto('/circle/reminders');
  await page.getByLabel('Care-plan text').fill('Take the blue tablet.');
  await page.getByLabel('Hour').selectOption('10');
  await page.getByLabel('Minute').selectOption('0');
  await page.getByLabel('Period').selectOption('AM');
  await page.getByRole('button', { name: 'Schedule' }).click();
  await expect(page.getByText('Take the blue tablet.')).toBeVisible();

  // In-app fallback: Today shows it as a full-screen card.
  await page.goto('/today');
  const card = page.getByTestId('reminder-due-card');
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(card).toContainText('Take the blue tablet.');

  await page.getByTestId('reminder-done').click();
  await expect(card).toBeHidden();

  // A reminder_logs row now exists, so the card does not come back on reload.
  await page.reload();
  await expect(page.getByTestId('reminder-due-card')).toHaveCount(0, { timeout: 15_000 });
});

test('the Reminders screen says whether this device can ring (F2)', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });

  await page.goto('/circle');
  await page.getByLabel('PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm PIN').fill('1234');
  await page.getByRole('button', { name: 'Set PIN' }).click();

  await page.goto('/circle/reminders');
  await expect(page.getByTestId('ring-status')).toContainText(/Will ring|cannot ring|Permission needed/);
});
