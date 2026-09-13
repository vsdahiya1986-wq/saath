// Runs after `next build` (output: "export"). Walks the built out/ directory
// and writes out/sw-precache-manifest.json — every file the export produced,
// as a URL path. sw.js fetches this at install time and precaches all of it.
//
// Root cause this fixes: a hand-maintained list of page routes (the first
// version of this file) missed the hashed _next/static/* JS/CSS chunks
// entirely. Those were only cached opportunistically as a user happened to
// navigate and trigger their fetch — so a cold reload while offline, before
// every chunk had been organically fetched once, could hang mid-hydration
// with no way to recover until back online. Precaching literally every
// exported file at install time removes that race.
import { readdir, writeFile, stat, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const OUT_DIR = 'out';
const SKIP = new Set(['sw.js', 'sw-precache-manifest.json']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = await walk(OUT_DIR);
const urls = [];
for (const file of allFiles) {
  const rel = relative(OUT_DIR, file).split(sep).join('/');
  if (SKIP.has(rel)) continue;
  urls.push('/' + rel);
}

await writeFile(join(OUT_DIR, 'sw-precache-manifest.json'), JSON.stringify(urls));

// Stamp a content hash into out/sw.js so every new build installs a fresh
// service worker and re-precaches; an unchanged sw.js never updates on devices.
const hash = createHash('sha256');
let totalBytes = 0;
for (const file of allFiles.sort()) {
  if (SKIP.has(relative(OUT_DIR, file).split(sep).join('/'))) continue;
  totalBytes += (await stat(file)).size;
  hash.update(file);
  hash.update(await readFile(file));
}
const version = `saath-${hash.digest('hex').slice(0, 12)}`;
const swPath = join(OUT_DIR, 'sw.js');
const sw = await readFile(swPath, 'utf8');
await writeFile(swPath, sw.replace(/const CACHE_VERSION = '[^']*';/, `const CACHE_VERSION = '${version}';`));
console.log(`[sw-precache] cache version ${version}`);
console.log(`[sw-precache] wrote ${urls.length} entries (${(totalBytes / 1024 / 1024).toFixed(1)} MB) to out/sw-precache-manifest.json`);
