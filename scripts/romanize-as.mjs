// Romanize Bengali-Assamese and Devanagari to Latin, then use that to catch
// transliteration: phonetic English written in Indic script instead of
// translated.
//
// Why this exists. The round-trip gate in verify-translations.mjs is
// structurally blind to this defect class. A transliteration round-trips
// *better* than a real translation — "Play" → "প্লে" → "Play" scores 0.85 and
// passes — because engine B simply reads the sounds back. So the one check
// that would catch it is the one the round trip cannot do: read the Assamese
// as sound and compare it to the English it came from.
//
// An elder who does not read English hears "প্লে, হেল্প, বা টুডে" as noise.
// That is the defect. It shipped, and it passed.

/** Consonants carry an inherent 'a' unless a matra or virama says otherwise. */
const BN_CONS = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'c', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'ৰ': 'r', 'র': 'r', 'ল': 'l', 'ৱ': 'w',
  'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y',
};
const BN_VOWEL = {
  'অ': 'a', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u',
  'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
};
const BN_MATRA = {
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
  'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
};

const DV_CONS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
};
const DV_VOWEL = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऑ': 'o',
};
const DV_MATRA = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o',
};

const VIRAMA = new Set(['্', '्']); // hasanta / halant
const NASAL = new Set(['ং', 'ঁ', 'ं', 'ँ']); // anusvara, candrabindu
const VISARGA = new Set(['ঃ', 'ः']);

/**
 * Sound out one Indic word. Not a scholarly transliteration — a phonetic
 * skeleton good enough to recognise an English word hiding in the script.
 */
export function romanize(text) {
  const cons = { ...BN_CONS, ...DV_CONS };
  const vowel = { ...BN_VOWEL, ...DV_VOWEL };
  const matra = { ...BN_MATRA, ...DV_MATRA };
  let out = '';
  let pending = ''; // inherent vowel owed by the last consonant
  const flush = () => { out += pending; pending = ''; };

  const chars = [...text.normalize('NFC')];
  for (let i = 0; i < chars.length; i++) {
    // Nukta forms (ড়, ज़ …) are two codepoints in NFC; try the pair first.
    const pair = chars[i] + (chars[i + 1] ?? '');
    const c = cons[pair] ? pair : chars[i];
    if (cons[c]) {
      flush();
      out += cons[c];
      pending = 'a';
      if (c === pair) i++;
    } else if (matra[chars[i]]) {
      pending = matra[chars[i]];
    } else if (VIRAMA.has(chars[i])) {
      pending = '';
    } else if (vowel[chars[i]]) {
      flush();
      out += vowel[chars[i]];
    } else if (NASAL.has(chars[i])) {
      flush();
      out += 'n';
    } else if (VISARGA.has(chars[i])) {
      flush();
      out += 'h';
    } else {
      flush();
      out += chars[i];
    }
  }
  flush();
  return out;
}

/**
 * Fold sounds English and Indic script spell differently, so "card"/"kard"
 * and "stop"/"shtap" compare equal. Digraphs first — order matters.
 */
function fold(s) {
  return s.toLowerCase()
    .replace(/ph/g, 'f').replace(/sh/g, 's').replace(/ck/g, 'k')
    .replace(/kh/g, 'k').replace(/gh/g, 'g').replace(/th/g, 't')
    .replace(/dh/g, 'd').replace(/bh/g, 'b').replace(/jh/g, 'j')
    .replace(/ch/g, 'c').replace(/c/g, 'k').replace(/q/g, 'k')
    .replace(/x/g, 'ks').replace(/z/g, 'j').replace(/w/g, 'v')
    .replace(/[^a-z]/g, '');
}

/**
 * Consonant spine: vowels are what transliteration distorts most. `y` counts
 * as a vowel here — it is one in the English spellings we compare against
 * ("play" → প্লে "ple", "today" → টুডে "tude").
 */
export function skeleton(s) {
  return fold(s).replace(/[aeiouy]/g, '').replace(/(.)\1+/g, '$1');
}

/**
 * Does `native` sound like the English `word`? Requires at least two
 * consonants, so short native words ("না" ≈ "no") cannot collide by accident.
 */
export function soundsLike(native, word) {
  const a = skeleton(romanize(native));
  const b = skeleton(word);
  if (a.length < 2 || b.length < 2) return false;
  return a === b;
}

/**
 * Find English words from `en` that appear transliterated in `target`.
 *
 * Only words from the *same* string are compared, which is what keeps this
 * quiet: an unrelated coincidence elsewhere in the corpus cannot fire.
 *
 * Severity is about whether the elder is stuck, not about how English the
 * word looks:
 *
 *   blocking — the word is the label of a control (`controls`). The cue is
 *     telling them to press something whose name is written as a sound they
 *     cannot read. They cannot act on it, so this must not ship.
 *   warning — an ordinary loanword ("tap", "routine", "phone"). This is how
 *     people actually speak; a person reads these and decides.
 *
 * Proper nouns are in neither list: `allow` holds names, whose correct
 * rendering *is* their sound, so the check stays silent on them.
 *
 * @param {string} en English source
 * @param {string} target the translated string as it ships
 * @param {{ allow?: string[], controls?: string[] }} [opts]
 * @returns {{ native: string, reads_as: string, english: string,
 *             severity: 'blocking' | 'warning', why: string }[]}
 */
export function findTransliterations(en, target, { allow = [], controls = [] } = {}) {
  const allowed = new Set(allow.map((w) => w.toLowerCase()));
  const isControl = new Set(controls.map((w) => w.toLowerCase()));
  const englishWords = [...new Set(en.match(/[A-Za-z][A-Za-z']*/g) ?? [])];
  const nativeWords = (target.match(/[^\s.,!?;:·।]+/g) ?? [])
    .filter((w) => /[ঀ-৿ऀ-ॿ]/.test(w));

  const found = [];
  for (const native of nativeWords) {
    for (const word of englishWords) {
      if (allowed.has(word.toLowerCase())) continue;
      if (!soundsLike(native, word)) continue;
      const control = isControl.has(word.toLowerCase());
      found.push({
        native,
        reads_as: romanize(native),
        english: word,
        severity: control ? 'blocking' : 'warning',
        why: control ? 'names a control' : 'loanword',
      });
      break; // one finding per native word
    }
  }
  return found;
}
