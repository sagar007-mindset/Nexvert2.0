/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dependency-free TAR reader/writer for the browser.
// Reads ustar, GNU long names ('L'/'K') and PAX ('x'/'g') headers, and transparently
// gunzips .tar.gz/.tgz input via the native DecompressionStream API.

export interface TarEntry {
  name: string;
  size: number;
  mode?: number;
  mtime?: Date;
  type?: string;
  data: Uint8Array;
}

export interface TarHeader {
  name: string;
  size: number;
  mode?: number;
  mtime?: Date;
  type?: string;
  uname?: string;
  gname?: string;
}

const BLOCK = 512;
const decoder = new TextDecoder();
const encoder = new TextEncoder();

function readString(block: Uint8Array, offset: number, length: number): string {
  const slice = block.subarray(offset, offset + length);
  const end = slice.indexOf(0);
  return decoder.decode(end === -1 ? slice : slice.subarray(0, end));
}

function readOctal(block: Uint8Array, offset: number, length: number): number {
  // GNU base-256 encoding for very large values
  if (block[offset] & 0x80) {
    let value = 0;
    for (let i = offset + 1; i < offset + length; i++) value = value * 256 + block[i];
    return value;
  }
  const text = readString(block, offset, length).trim();
  return text ? parseInt(text, 8) || 0 : 0;
}

function isZeroBlock(block: Uint8Array): boolean {
  for (let i = 0; i < block.length; i++) if (block[i] !== 0) return false;
  return true;
}

function parsePax(data: Uint8Array): Record<string, string> {
  const result: Record<string, string> = {};
  const text = decoder.decode(data);
  let pos = 0;
  while (pos < text.length) {
    const space = text.indexOf(' ', pos);
    if (space === -1) break;
    const len = parseInt(text.slice(pos, space), 10);
    if (!len) break;
    const record = text.slice(space + 1, pos + len - 1);
    const eq = record.indexOf('=');
    if (eq > 0) result[record.slice(0, eq)] = record.slice(eq + 1);
    pos += len;
  }
  return result;
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser cannot decompress .tar.gz files. Please use an up-to-date browser.');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Parses a TAR (or gzip-compressed TAR) archive into entries.
 */
export async function parseTar(arrayBuffer: ArrayBuffer): Promise<TarEntry[]> {
  let bytes = new Uint8Array(arrayBuffer);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = await gunzip(bytes);

  const entries: TarEntry[] = [];
  let offset = 0;
  let longName: string | null = null;
  let pax: Record<string, string> = {};
  let globalPax: Record<string, string> = {};

  while (offset + BLOCK <= bytes.length) {
    const header = bytes.subarray(offset, offset + BLOCK);
    if (isZeroBlock(header)) break;

    // Validate checksum (treat checksum field as spaces)
    const stored = readOctal(header, 148, 8);
    let sum = 0;
    for (let i = 0; i < BLOCK; i++) sum += i >= 148 && i < 156 ? 32 : header[i];
    if (sum !== stored) {
      if (entries.length === 0) throw new Error('File is not a valid TAR archive.');
      break;
    }

    const size = readOctal(header, 124, 12);
    const typeFlag = String.fromCharCode(header[156] || 48);
    const dataStart = offset + BLOCK;
    const data = bytes.slice(dataStart, dataStart + size);
    offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;

    if (typeFlag === 'L') { longName = readString(data, 0, data.length); continue; }
    if (typeFlag === 'K') continue; // long link name — not needed
    if (typeFlag === 'x') { pax = parsePax(data); continue; }
    if (typeFlag === 'g') { globalPax = { ...globalPax, ...parsePax(data) }; continue; }

    let name = readString(header, 0, 100);
    const magic = readString(header, 257, 6);
    if (magic.startsWith('ustar')) {
      const prefix = readString(header, 345, 155);
      if (prefix) name = `${prefix}/${name}`;
    }
    name = pax.path || globalPax.path || longName || name;
    longName = null;
    const mtimeSeconds = pax.mtime ? parseFloat(pax.mtime) : readOctal(header, 136, 12);
    pax = {};

    const isDir = typeFlag === '5' || name.endsWith('/');
    const isFile = typeFlag === '0' || typeFlag === '\0' || typeFlag === '7';
    if (!isDir && !isFile) continue; // skip symlinks, devices, fifos

    entries.push({
      name,
      size: isDir ? 0 : size,
      mode: readOctal(header, 100, 8),
      mtime: new Date(mtimeSeconds * 1000),
      type: isDir ? 'directory' : 'file',
      data: isDir ? new Uint8Array(0) : data,
    });
  }

  return entries;
}

function writeString(block: Uint8Array, offset: number, length: number, value: string) {
  const bytes = encoder.encode(value);
  block.set(bytes.subarray(0, length), offset);
}

function writeOctal(block: Uint8Array, offset: number, length: number, value: number) {
  writeString(block, offset, length, Math.floor(value).toString(8).padStart(length - 1, '0') + '\0');
}

function buildHeader(name: string, size: number, typeFlag: string, mtime: Date, mode: number): Uint8Array {
  const header = new Uint8Array(BLOCK);
  writeString(header, 0, 100, name);
  writeOctal(header, 100, 8, mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, mtime.getTime() / 1000);
  header.fill(32, 148, 156);
  header[156] = typeFlag.charCodeAt(0);
  writeString(header, 257, 6, 'ustar\0');
  writeString(header, 263, 2, '00');
  let sum = 0;
  for (let i = 0; i < BLOCK; i++) sum += header[i];
  writeString(header, 148, 8, sum.toString(8).padStart(6, '0') + '\0 ');
  return header;
}

function padded(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(Math.ceil(data.length / BLOCK) * BLOCK);
  out.set(data);
  return out;
}

/**
 * Creates a ustar TAR archive. Names longer than 100 bytes use a PAX path record.
 */
export async function createTar(
  entries: { name: string; data: Uint8Array | ArrayBuffer; mtime?: Date }[]
): Promise<Uint8Array> {
  const parts: Uint8Array[] = [];

  for (const item of entries) {
    const isDir = item.name.endsWith('/');
    const data = isDir ? new Uint8Array(0) : item.data instanceof Uint8Array ? item.data : new Uint8Array(item.data);
    const mtime = item.mtime || new Date();
    let name = item.name;

    if (encoder.encode(name).length > 100) {
      // PAX record length includes its own decimal digits
      const record = ` path=${name}\n`;
      const base = encoder.encode(record).length;
      let len = base + 1;
      while (String(len).length + base !== len) len = String(len).length + base;
      const paxData = encoder.encode(`${len}${record}`);
      parts.push(buildHeader('PaxHeader', paxData.length, 'x', mtime, 0o644), padded(paxData));
      name = name.slice(-100);
    }

    parts.push(buildHeader(name, data.length, isDir ? '5' : '0', mtime, isDir ? 0o755 : 0o644));
    if (data.length) parts.push(padded(data));
  }

  parts.push(new Uint8Array(BLOCK * 2));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { out.set(p, pos); pos += p.length; }
  return out;
}
