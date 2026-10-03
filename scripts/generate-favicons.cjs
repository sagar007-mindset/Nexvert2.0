// Generates every icon from ONE source image: brand/logo-master.png (512x512, the Nexvert logo).
//
// Why a raster master instead of SVG: the logo has soft shadows and layered depth that the
// simplified SVG re-drawings never matched, so the tab icon looked different from the site.
// Every size below is derived from the exact same artwork.
//
// Quality steps for tiny sizes (16/32/48):
//   1. The master has a ~14px transparent margin. It is cropped away so the logo tile fills the
//      whole icon (more pixels for the design).
//   2. Downscaling is done in stages (halving) with Lanczos resampling, then lightly sharpened,
//      which keeps the document edge, fold, tag and arrows readable at 16px.
// favicon.ico is assembled here (PNG-in-ICO), so ImageMagick is not required on Netlify.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const masterPath = path.join(root, 'brand', 'logo-master.png');

// Transparent margin around the logo tile in logo-master.png.
const MARGIN = 14;
// Crop depth that removes the rounded corners and the logo's thin edge line (opaque full-bleed icons).
const CORNER_INSET = 38;

async function main() {
  if (!fs.existsSync(masterPath)) throw new Error('brand/logo-master.png not found');
  const meta = await sharp(masterPath).metadata();
  if (meta.width !== meta.height) throw new Error('logo-master.png must be square');
  const full = await sharp(masterPath).png().toBuffer(); // untouched 512x512 (with margin)
  const tileSize = meta.width - MARGIN * 2;
  const tile = await sharp(masterPath)
    .extract({ left: MARGIN, top: MARGIN, width: tileSize, height: tileSize })
    .png()
    .toBuffer();

  /** Tile with its outer `inset` pixels cropped away (removes the thin edge line / rounded corners). */
  const insetTile = (inset) =>
    sharp(masterPath)
      .extract({ left: MARGIN + inset, top: MARGIN + inset, width: tileSize - inset * 2, height: tileSize - inset * 2 })
      .png()
      .toBuffer();

  /** Staged Lanczos downscale + light sharpening (small sizes only). */
  async function shrink(input, inputSize, size, sharpen) {
    let buf = input;
    let cur = inputSize;
    while (cur / 2 > size) {
      cur = Math.round(cur / 2);
      buf = await sharp(buf).resize(cur, cur, { kernel: 'lanczos3' }).png().toBuffer();
    }
    let img = sharp(buf).resize(size, size, { kernel: 'lanczos3' });
    if (sharpen) img = img.sharpen({ sigma: size <= 32 ? 0.6 : 0.5, m1: 0.8, m2: 1.6 });
    return img.png({ compressionLevel: 9 }).toBuffer();
  }

  // Brand gradient used behind opaque icons (same stops as the logo tile).
  const gradient = (size) =>
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f43f5e"/><stop offset="0.45" stop-color="#e11d48"/><stop offset="1" stop-color="#be123c"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)"/></svg>`
    );

  const write = (name, data) => fs.writeFileSync(path.join(publicDir, name), data);
  const ico = [];

  /**
   * Browser-tab / search-result icons.
   *
   * Two things drive this design, both learned from how these are actually displayed:
   *
   * 1. **Google crops favicons to a circle** in search results. The previous version let the
   *    document fill the tile edge to edge, so that circular crop sliced off its top-left corner
   *    and bottom edge. The artwork is therefore scaled into a safe zone that stays inside the
   *    inscribed circle.
   * 2. **Full bleed, no rounded corners.** The previous version kept the squircle's rounded
   *    corners with transparency outside them. Downscaling a rounded shape to 16px leaves a soft,
   *    jagged anti-aliased edge — the "edges showing" problem. A flat edge-to-edge background has
   *    no outline to alias, which is why most icons that read cleanly at 16px are built this way.
   */
  /**
   * Simplified mark for small sizes, drawn from the same geometry as public/logo.svg.
   *
   * At 16px the full logo has roughly 256 pixels to render a document, a second ghost document
   * behind it, a format tag, a folded corner and two arrows — so it reads as mud. This keeps the
   * parts that carry the brand (white document, folded corner, red conversion arrows) and drops
   * the ones that only add noise at that scale (the 0.4-opacity ghost layer, the format tag, the
   * drop shadow). Same mark, less detail — not a different design.
   *
   * The document is re-centred and scaled up, because the full logo places it off-centre to make
   * room for the ghost layer that is no longer there.
   */
  const simplifiedMark = (size, tiny) => {
    // Front document bounding box in the 512 viewBox: x 140-386, y 138-448 → centre (263, 293).
    // At 16px the mark is pulled in and the arrows thickened: with ~256 pixels to work with,
    // breathing room and stroke weight matter more than matching the larger sizes exactly.
    const scale = tiny ? 1.0 : 1.16;
    const stroke = tiny ? 40 : 30;
    return Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="#f43f5e"/><stop offset="0.45" stop-color="#e11d48"/><stop offset="1" stop-color="#be123c"/>` +
        `</linearGradient></defs>` +
        `<rect width="512" height="512" fill="url(#g)"/>` +
        `<g transform="translate(256,256) scale(${scale}) translate(-263,-293)">` +
        `<path d="M 166 138 L 316 138 L 386 208 L 386 422 A 26 26 0 0 1 360 448 L 166 448 A 26 26 0 0 1 140 422 L 140 164 A 26 26 0 0 1 166 138 Z" fill="#ffffff"/>` +
        `<path d="M 310 138 L 310 202 A 8 8 0 0 0 318 210 L 386 210 Z" fill="#cbd5e1"/>` +
        `<g fill="none" stroke="#e11d48" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">` +
        `<path d="M 198 300 C 198 256, 308 254, 324 270"/>` +
        `<path d="M 310 244 L 344 274 L 308 300" fill="#e11d48" stroke="none"/>` +
        `<path d="M 326 342 C 326 386, 216 388, 200 372"/>` +
        `<path d="M 214 398 L 180 368 L 216 342" fill="#e11d48" stroke="none"/>` +
        `</g></g></svg>`
    );
  };

  const SAFE_ZONE = 0.72; // artwork width as a fraction of the icon; keeps it inside the circle

  /** Small sizes get the simplified mark; larger ones keep the full artwork. */
  async function browserIcon(size, simplify) {
    if (simplify) {
      // Rendered at 4x then downscaled, which anti-aliases the curves far better than asking
      // the SVG rasteriser for a 16px output directly.
      const big = await sharp(simplifiedMark(size * 4, size <= 16), { density: 384 }).png().toBuffer();
      return sharp(big)
        .resize(size, size, { kernel: 'lanczos3' })
        .sharpen({ sigma: size <= 32 ? 0.5 : 0.4, m1: 0.7, m2: 1.4 })
        .removeAlpha()
        .png({ compressionLevel: 9 })
        .toBuffer();
    }
    const inner = Math.round(size * SAFE_ZONE);
    const art = await shrink(await insetTile(CORNER_INSET), tileSize - CORNER_INSET * 2, inner, false);
    return sharp(gradient(size))
      .composite([{ input: art, gravity: 'center' }])
      .removeAlpha() // opaque: nothing to anti-alias at the border
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  for (const size of [16, 32, 48]) {
    const data = await browserIcon(size, true); // simplified mark at 16/32/48
    write(`favicon-${size}x${size}.png`, data);
    ico.push({ size, data });
  }
  write('favicon-96x96.png', await browserIcon(96, false)); // full artwork from 96 up
  write('favicon-192x192.png', await browserIcon(192, false));

  // Android / PWA icons keep the original transparent margin.
  write('android-chrome-192x192.png', await shrink(full, meta.width, 192, false));
  write('android-chrome-512x512.png', full);
  write('logo.png', full);

  // iOS home-screen icon: must be opaque and full-bleed (iOS rounds the corners itself).
  const apple = await sharp(gradient(180))
    .composite([{ input: await sharp(await insetTile(CORNER_INSET)).resize(180, 180, { kernel: 'lanczos3' }).toBuffer() }]) // inset 34px = no rounded corners left
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  write('apple-touch-icon.png', apple);

  // Maskable icon: artwork inside the central safe zone on a full-bleed brand background. The
  // corner-free tile is shrunk and its outer edge is feathered with a blurred alpha mask, so
  // it dissolves into the background instead of showing a visible square.
  const inner = Math.round(512 * 0.66); // keeps the whole document inside the 80% safe-zone circle
  const feather = await sharp(
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${inner}" height="${inner}"><rect x="6" y="6" width="${inner - 12}" height="${inner - 12}" fill="#fff"/></svg>`)
  )
    .blur(3)
    .png()
    .toBuffer();
  const featheredTile = await sharp(await sharp(await insetTile(CORNER_INSET)).resize(inner, inner, { kernel: 'lanczos3' }).toBuffer())
    .ensureAlpha()
    .composite([{ input: feather, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const maskable = await sharp(gradient(512))
    .composite([{ input: featheredTile, gravity: 'center' }])
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  write('maskable-icon-512x512.png', maskable);

  write('favicon.ico', buildIco(ico));
  console.log('✅ Icons generated from brand/logo-master.png: favicon.ico (16/32/48), 16/32/48/96/192 PNG, apple-touch, android 192/512, maskable, logo.png');
}

function buildIco(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((img) => img.data)]);
}

main().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
