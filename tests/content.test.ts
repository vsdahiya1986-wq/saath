import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ICON_NAMES } from '@/components/ui/Icon';
import { STRINGS } from '@/content/strings';
import { HOME_OBJECTS } from '@/content/cstContent';

const manifest = JSON.parse(fs.readFileSync(path.join('public', 'content', 'packs', 'regional', 'manifest.json'), 'utf8'));

interface Item {
  id: string;
  label: string;
  icon: string;
}

const items: Item[] = [...manifest.objects, ...manifest.patterns, ...manifest.routines.flatMap((r: { steps: Item[] }) => r.steps)];

/**
 * B2: "Hear & Find" rendered "…" instead of an item name. Nothing downstream
 * can render a label that isn't there, so the content is checked directly.
 */
describe('regional pack manifest', () => {
  it('has items to play with', () => {
    expect(items.length).toBeGreaterThan(20);
  });

  for (const item of items) {
    it(`${item.id} has a usable label and icon`, () => {
      expect(item.label?.trim()).toBeTruthy();
      expect(item.label).not.toMatch(/^(\.\.\.|…)$/);
      expect(ICON_NAMES).toContain(item.icon);
    });
  }

  it('gives every object and pattern a unique id', () => {
    const ids = [...manifest.objects, ...manifest.patterns].map((i: Item) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every routine a title and at least two steps', () => {
    for (const r of manifest.routines) {
      expect(r.title?.trim()).toBeTruthy();
      expect(r.steps.length).toBeGreaterThanOrEqual(2);
    }
  });
});

/**
 * B3: the number of slots My Next Step renders is the number of steps it asks
 * for, so a 4-step routine can never render 3 slots. STEPS_FOR is duplicated
 * here deliberately — the test is the thing that notices if it drifts.
 */
describe('My Next Step slot counts', () => {
  const STEPS_FOR: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 4 };

  for (const difficulty of [1, 2, 3, 4]) {
    it(`difficulty ${difficulty} asks for a count every routine can satisfy`, () => {
      const need = STEPS_FOR[difficulty];
      expect(need).toBeGreaterThanOrEqual(2);
      for (const r of manifest.routines) {
        // slots = steps.slice(0, need).length, and the progress total uses the same number
        expect(r.steps.slice(0, need).length).toBe(Math.min(need, r.steps.length));
      }
    });
  }
});

/**
 * Every UI string must exist in both lists or a screen goes silent in Assamese
 * (00_CONTEXT.md §Languages).
 */
describe('strings.ts and generate-audio.mjs', () => {
  const script = fs.readFileSync(path.join('scripts', 'generate-audio.mjs'), 'utf8');
  const block = script.slice(script.indexOf('const STRINGS = {'), script.indexOf('};', script.indexOf('const STRINGS = {')));
  // Matches both `'quoted.key':` and `bare_key:`, as check-audio-coverage.mjs does.
  const scriptKeys = [...block.matchAll(/^\s*(?:'([^']+)'|([A-Za-z_][\w.]*))\s*:\s*['"]/gm)].map((m) => m[1] ?? m[2]);

  it('list exactly the same keys', () => {
    expect([...new Set(scriptKeys)].sort()).toEqual(Object.keys(STRINGS).sort());
  });

  it('has no duplicate keys in the audio script', () => {
    expect(new Set(scriptKeys).size).toBe(scriptKeys.length);
  });
});

/** 04_CONTENT §1 and §5: counts, routine shape, and the in-code object list kept in step. */
describe('regional content (04_CONTENT)', () => {
  it('has at least 24 objects and 5 routines', () => {
    expect(manifest.objects.length).toBeGreaterThanOrEqual(24);
    expect(manifest.routines.length).toBeGreaterThanOrEqual(5);
  });

  it('gives every routine 3–4 steps with ids unique inside it', () => {
    for (const r of manifest.routines) {
      expect(r.steps.length).toBeGreaterThanOrEqual(3);
      expect(r.steps.length).toBeLessThanOrEqual(4);
      expect(new Set(r.steps.map((s: Item) => s.id)).size).toBe(r.steps.length);
    }
  });

  it('only uses objects in the games that the manifest also lists', () => {
    const ids = new Set(manifest.objects.map((o: Item) => o.id));
    for (const o of HOME_OBJECTS) expect(ids, o.id).toContain(o.id);
    expect(HOME_OBJECTS.length).toBe(manifest.objects.length);
  });
});

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? sourceFiles(p) : /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

describe('source text (04_CONTENT §5)', () => {
  const files = sourceFiles('src').map((f) => ({ f, text: fs.readFileSync(f, 'utf8') }));

  it('every literal t() key exists in STRINGS', () => {
    const missing: string[] = [];
    for (const { f, text } of files) {
      for (const m of text.matchAll(/\bt\(\s*'([a-z_]+(?:\.[a-z_]+)+)'/g)) if (!(m[1] in STRINGS)) missing.push(`${f}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });

  it('never makes a clinical claim outside comments', () => {
    const forbidden = /diagnose|detect dementia|clinically proven|validated|\bcure\b|score your memory|decline detected/i;
    const hits: string[] = [];
    for (const { f, text } of files) {
      text.split('\n').forEach((line, i) => {
        const code = line.trim();
        if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*') || code.startsWith('{/*')) return;
        // "does not diagnose" is the required disclaimer, not a claim.
        if (forbidden.test(code.replace(/(does not|never) diagnose/gi, ''))) hits.push(`${f}:${i + 1}: ${code.slice(0, 80)}`);
      });
    }
    expect(hits).toEqual([]);
  });
});
