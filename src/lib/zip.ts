/**
 * Minimal store-only (uncompressed) ZIP writer — no dependency needed.
 * Good enough for exporting a small voice-legacy archive; not a general
 * ZIP implementation (no compression, no directories, no Zip64).
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(d = new Date()): { date: number; time: number } {
  const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff;
  const date = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
  return { date, time };
}

function u16(n: number) {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
}
function u32(n: number) {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff]);
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

export function buildStoreZip(files: { name: string; data: Uint8Array }[]): Blob {
  const { date, time } = dosDateTime();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const f of files) {
    const nameBytes = new TextEncoder().encode(f.name);
    const crc = crc32(f.data);
    const local = concat(
      u32(0x04034b50),
      u16(20), // version needed
      u16(0), // flags
      u16(0), // method = store
      u16(time),
      u16(date),
      u32(crc),
      u32(f.data.length),
      u32(f.data.length),
      u16(nameBytes.length),
      u16(0), // extra length
      nameBytes,
      f.data
    );
    localParts.push(local);

    const central = concat(
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(f.data.length),
      u32(f.data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes
    );
    centralParts.push(central);
    offset += local.length;
  }

  const centralDir = concat(...centralParts);
  const end = concat(
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0)
  );

  return new Blob([concat(...localParts), centralDir, end] as BlobPart[], { type: 'application/zip' });
}
