# 05 — Tests, screenshots and definition of done

## 1. Gates (run after every phase)

```bash
npm run lint
npx tsc --noEmit
npm test
npx playwright test
```

Playwright serves the **static export** (`npm run build && npx serve out`) — never `next dev`
(see the comment in `playwright.config.ts`; Turbopack also crashed once during testing).

## 2. Starter E2E spec — `tests/e2e/games-progress.spec.ts`

Adapt selectors to the real DOM; add `data-testid` attributes where they are missing (`activity-card`,
`choice`, `slot`, `progress`, `complete`, `exit-skip-one`, `exit-end`).

```ts
import { test, expect, Page } from '@playwright/test';

const ACTIVITIES = ['today_me', 'hear_find', 'sort_home', 'next_step', 'saah_pat', 'apon_mukh'] as const;

async function seedSamplePerson(page: Page) {
  await page.goto('/');
  // Prefer the sample loader over typing a profile by hand.
  await page.getByTestId('load-sample').click();
  await expect(page.getByText(/Sample/i)).toBeVisible();
}

test.describe('every activity can be finished by tapping', () => {
  for (const activity of ACTIVITIES) {
    test(`${activity} reaches the completion screen`, async ({ page }) => {
      await seedSamplePerson(page);
      await page.goto(`/play/${activity}`);

      // No placeholder text anywhere on a play screen.
      await expect(page.locator('body')).not.toContainText(/^\s*\.\.\.\s*$/);
      await expect(page.getByTestId('placeholder-ellipsis')).toHaveCount(0);

      for (let tap = 0; tap < 20; tap++) {
        if (await page.getByTestId('complete').isVisible().catch(() => false)) break;
        const choices = page.getByTestId('choice');
        const n = await choices.count();
        if (n === 0) break;
        await choices.nth(tap % n).click();
        await page.waitForTimeout(900); // feedback window
      }

      await expect(page.getByTestId('complete')).toBeVisible();
    });
  }
});

test('skip this one advances a single step, end leaves the activity', async ({ page }) => {
  await seedSamplePerson(page);
  await page.goto('/play/today_me');
  const before = await page.getByTestId('progress').innerText();
  await page.getByTestId('exit-skip-one').click();
  await expect(page.getByTestId('progress')).not.toHaveText(before);
  await page.getByTestId('exit-end').click();
  await expect(page).toHaveURL(/\/play$/);
});

test('assamese stays selected across navigation', async ({ page }) => {
  await seedSamplePerson(page); // sample person is Assamese
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'as');
  await page.goto('/play');
  await expect(page.locator('html')).toHaveAttribute('lang', 'as');
  await page.goto('/play/sort_home');
  await expect(page.locator('html')).toHaveAttribute('lang', 'as');
});

test('touch targets are at least 64px on person-facing screens', async ({ page }) => {
  await seedSamplePerson(page);
  for (const url of ['/', '/play', '/today', '/help']) {
    await page.goto(url);
    const boxes = await page.locator('button, a[href]').all();
    for (const b of boxes) {
      if (!(await b.isVisible())) continue;
      const box = await b.boundingBox();
      if (!box) continue;
      expect(box.height, `${url} target too short`).toBeGreaterThanOrEqual(64);
    }
  }
});
```

Keep the existing `tests/e2e/offline-journey.spec.ts` and extend it: turn **No-Signal Mode** on, complete a
game, add a Care Note, turn it off, assert the sync badge changes.

## 3. Unit tests to add

| File | What it proves |
| --- | --- |
| `tests/stepRunner.test.ts` | wrong → retry → wrong → advance; correct → advance; taps during feedback ignored; lock always clears |
| `tests/timeOfDay.test.ts` | `periodForHour()` at 04:59 / 05:00 / 11:59 / 12:00 / 16:59 / 17:00 / 19:59 / 20:00 |
| `tests/nextStep.test.ts` | slot count equals routine step count for difficulty 1–4; tap places into the next empty slot; tap removes |
| `tests/content.test.ts` | the six content checks in `04_CONTENT.md` §5 |
| `tests/reminders.test.ts` | due/missed sweep boundary at 30 min; `rearmAll()` re-schedules everything |
| `tests/nudges.test.ts` | each nudge kind fires exactly on its trigger and not before |
| `tests/sampleData.test.ts` | `loadSample()` is idempotent; `clearSample()` removes every `is_sample` row and blob |
| `tests/trends.test.ts` | fewer than 5 comparable trials → "Not enough comparable sessions yet"; like-for-like comparison only |
| `tests/db-migration.test.ts` | a v1 database upgrades to v2 and keeps its rows (`fake-indexeddb`) |
| existing `model.test.ts`, `events.test.ts` | must stay green |

## 4. PS clause → screen map (put this table in `README.md` too)

| Clause | Where it is satisfied | Proof |
| --- | --- | --- |
| (a) memory | Apon Mukh · Dear Faces | e2e completes |
| (a) attention | Saah Pat · Tea Leaf | e2e completes |
| (a) routine recall | My Next Step | e2e completes |
| (a) pattern/object | Sort the Home | e2e completes |
| (a) emotional engagement | Together Moment | manual |
| (b) adaptive AI | `model.ts` + Evidence Inspector + in-game badge | `model.test.ts` |
| (c) multilingual + voice | EN/AS strings, cached Bhashini audio, spoken cues | language e2e |
| (d) cultural themes | regional manifest (24+ items, 5 routines), tea sprigs | `content.test.ts` |
| (e) reminders | Ghonta (medicine, water, activity, clinic) | `reminders.test.ts` + e2e |
| (f) caregiver dashboards | Circle, Circle Board, Trend Lines, Care Note, Ghor Tiles, Visit Card | manual + unit |
| (f) alerts | Circle Nudges | `nudges.test.ts` |
| (g) offline | service worker + IndexedDB + No-Signal Mode | offline e2e + device test |
| (h) mobile/elderly UI | Easy View, 64 px targets, Rest Pause, Back/Home everywhere | target e2e + manual |
| secure data | AES-256-GCM fields and blobs | code + Circle privacy panel |

## 4a. Manual device matrix

| # | Check | Steps | Result |
| --- | --- | --- | --- |
| B11 | Offline cold start | Install the PWA or Android build → load Aita's Day → switch on airplane mode → force-close → reopen → play one game → add one Care Note → switch the network back on → confirm the sync badge changes from offline | _not yet run_ |

## 5. Definition of done

- [ ] All seven activities reach the completion screen: by e2e, and by hand in English **and** Assamese.
- [ ] No screen shows `...` as content; no elder-facing screen shows engine jargon, scores or timers.
- [ ] "Skip this one" advances one step; "End" leaves the activity.
- [ ] Aita's Day loads in one tap and is labelled "Sample" everywhere; "Clear sample data" works.
- [ ] A Ghonta reminder fires, "Done" is logged, a missed one creates a Circle Nudge.
- [ ] No-Signal Mode: a full session works with the network simulated off; the badge is honest.
- [ ] Ghor Tiles switches between two people without typing.
- [ ] Visit Card prints on one page with the non-diagnostic footer.
- [ ] Removals in `03_REMOVALS.md` are done and nothing references them.
- [ ] Four gates green; `CHANGELOG.md` and `BUILD_CHECKLIST.md` updated.
- [ ] Branch merged and pushed; deployed to Vercel; README has the live URL, the clause map and the
      roadmap section (Bol, Circle Message).
- [ ] Screenshots captured (below).

## 6. Screenshots for the PPT (Phase 7)

Save to `docs/screenshots/`, 1280 × 800, the Aita's Day sample profile, no browser chrome:

> **Disable browser extensions before capturing by hand** (06_FIX_PACK R6: a floating purple widget in
> the live test was the Excalidraw extension, not SAATH). `npm run screenshots` uses a clean Playwright
> browser with no extensions, so it is unaffected.

| File | Screen |
| --- | --- |
| `01-home-en.png` | Home, English, Today's Three visible |
| `02-home-as.png` | Home, Assamese |
| `03-today-me.png` | Today & Me mid-question |
| `04-saah-pat.png` | Saah Pat with two targets found |
| `05-apon-mukh.png` | Apon Mukh with one pair matched and a caption |
| `06-sort-home.png` | Sort the Home with items piled in a bucket |
| `07-next-step.png` | My Next Step with two slots filled |
| `08-complete.png` | Completion screen with the adaptive note |
| `09-ghonta-due.png` | A reminder due card with Done / Not now |
| `10-circle-nudges.png` | Circle with one open nudge |
| `11-circle-board.png` | Circle Board with Trend Lines |
| `12-evidence.png` | Evidence Inspector showing a decision and its reason |
| `13-no-signal.png` | Any game running with the offline badge |
| `14-visit-card.png` | Visit Card print preview |

Also record a 2-minute screen capture (no narration needed) and put the link in `README.md`.
