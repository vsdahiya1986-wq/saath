/**
 * Bhashini returns the Assamese in-word apostrophe (ক'ত, হ'ব, ছ'ৰ্ট) as a
 * space followed by `"` or `'` — "ক "ত আছে?" — and sometimes leaves a stray
 * quote at the end. This only repairs that punctuation; it never changes a
 * letter of the translation.
 */
export function fixApostrophes(text) {
  return text.replace(/(\S)\s+["'](?=\S)/g, "$1'").replace(/\s+["']$/, '');
}
