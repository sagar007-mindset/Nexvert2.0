// One-off generator for public/og-image.png (1200x630 social share card).
// Run manually with `node scripts/generate-og-image.cjs`; the PNG is committed so builds
// don't depend on fonts available on the build machine.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const logo = fs.readFileSync(path.join(publicDir, 'logo.svg')).toString();
const logoInner = logo.replace(/^<svg[^>]*>/, '').replace('</svg>', '');

const chips = ['PDF', 'Images', 'Audio', 'Video', 'Archives', 'Dev Tools'];
let chipX = 96;
const chipSvg = chips.map((label) => {
  const w = 24 + label.length * 15;
  const s = `<rect x="${chipX}" y="438" width="${w}" height="46" rx="23" fill="#27272a" stroke="#3f3f46"/>
    <text x="${chipX + w / 2}" y="469" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" fill="#e4e4e7">${label}</text>`;
  chipX += w + 14;
  return s;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#e11d48" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#e11d48" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0f0f12"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96 96) scale(0.25)">${logoInner}</g>
  <text x="244" y="170" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">Nexvert</text>
  <text x="96" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="800" fill="#ffffff">Free Online File Converter</text>
  <text x="96" y="370" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#a1a1aa">190+ tools that run privately in your browser — no uploads.</text>
  ${chipSvg}
  <text x="96" y="566" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600" fill="#f43f5e">nexvert.online</text>
</svg>`;

sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'og-image.png'))
  .then(() => console.log('✅ public/og-image.png written (1200x630)'));
