/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Kept separate from page-content.ts so importing it does not pull all page copy into the main bundle.

/** "Convert TAR to ZIP Free" -> "TAR to ZIP converter"; "Free Online Video Compressor" -> "Video Compressor". */
export function toolNameFromTitle(title: string): string {
  let name = String(title || '').split(/\s[—–|]\s/)[0].trim();
  name = name.replace(/\b(free|online)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
  const pair = name.match(/^convert\s+(.+?)\s+to\s+(.+)$/i);
  if (pair) name = `${pair[1]} to ${pair[2]} converter`;
  return name || 'this tool';
}
