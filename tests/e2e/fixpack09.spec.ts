import { test, expect, Page } from '@playwright/test';

/**
 * 09 item 2: in Hear & Find one answer card rendered as a garbled QR-like
 * image — the `<img src>` was a `blob:` URL holding `audio/webm` from the
 * voice-note store. The invariant is stated as a sweep, not as one card: on
 * every activity page, a `blob:` URL that reaches an `<img>` must carry an
 * `image/*` mime. `packPhotoUrl` is the only route, so this covers all seven.
 */
const ACTIVITIES = ['today_me', 'hear_find', 'sort_home', 'next_step', 'saah_pat', 'apon_mukh', 'together'];

async function loadSample(page: Page) {
  await page.goto('/');
  await page.getByTestId('see-a-sample').click();
  await expect(page.getByTestId('sample-chip')).toBeVisible({ timeout: 15_000 });
}

/** Every `<img>` on screen whose src is a blob URL, with the blob's real mime. */
async function blobImageMimes(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const srcs = [...document.querySelectorAll('img')].map((i) => i.src).filter((s) => s.startsWith('blob:'));
    return Promise.all(srcs.map(async (s) => (await (await fetch(s)).blob()).type));
  });
}

/** Points the first pack's photo at a voice note, the way the bug reached production. */
async function poisonAPackPhoto(page: Page) {
  await page.evaluate(async () => {
    const db: IDBDatabase = await new Promise((resolve, reject) => {
      const open = indexedDB.open('saath_v1');
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['packs', 'blobs'], 'readwrite');
      tx.objectStore('blobs').put({ key: 'poison', blob: new Blob([new Uint8Array([1, 2, 3])]), mime: 'audio/webm', at: new Date().toISOString() });
      const all = tx.objectStore('packs').getAll();
      all.onsuccess = () => {
        for (const pack of all.result) {
          if (pack.media?.photo || pack.media?.place_photo) {
            tx.objectStore('packs').put({ ...pack, media: { ...pack.media, photo: 'poison', place_photo: undefined } });
            break;
          }
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

test('no activity hands non-image data to an <img>', async ({ page }) => {
  test.setTimeout(120_000); // seven activity pages, each decrypting its photos after first paint
  await loadSample(page);
  let sawAPhoto = false;

  for (const activity of ACTIVITIES) {
    await page.goto(`/play/${activity}`);
    await page.waitForTimeout(2_000); // photos are decrypted after the first paint
    const mimes = await blobImageMimes(page);
    sawAPhoto ||= mimes.length > 0;
    expect(mimes.filter((m) => !m.startsWith('image/')), `${activity} rendered a non-image blob as a photo`).toEqual([]);
  }

  // Otherwise the sweep above would pass on a screen with no photos at all.
  expect(sawAPhoto, 'the sample profile showed no family photos, so this proves nothing').toBe(true);
});

test('a voice note stored under a photo key falls back to the drawing', async ({ page }) => {
  await loadSample(page);
  await poisonAPackPhoto(page);

  await page.goto('/play/hear_find');
  await expect(page.getByTestId('sound-sight-choice').first()).toBeEnabled({ timeout: 15_000 });
  await page.waitForTimeout(2_000);
  // The round still plays; the poisoned pack shows its drawing instead.
  expect(await blobImageMimes(page)).not.toContain('audio/webm');
  // 09 item 1: it is not counted as family content either, so the whole round
  // is family-flagged only where a real picture resolved.
  const family = await page.locator('[data-testid="sound-sight-choice"][data-family="yes"]').count();
  const photos = (await blobImageMimes(page)).length;
  expect(family).toBe(photos);
});
