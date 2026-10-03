// Publishes Agent Skills at /.well-known/agent-skills/ per the Cloudflare Agent Skills
// Discovery RFC v0.2.0 (https://github.com/cloudflare/agent-skills-discovery-rfc).
//
// What a "skill" is here: a SKILL.md instruction document an agent loads when a task matches
// its description. It is NOT an API — publishing these requires no server, which is why this
// standard fits a static site when api-catalog / oauth / a2a-agent-card do not.
//
// Honesty rules these skills follow, because a SKILL.md is loaded straight into an agent's
// context and a wrong one wastes a real person's time:
//   1. Carry genuine domain knowledge, not an advert. If the guidance would be useless without
//      the Nexvert link, it does not belong here.
//   2. State plainly that the tools are browser-based and cannot be called programmatically,
//      so an agent never tries to POST a file somewhere and silently fail.
//   3. Claim only formats and limits the site actually supports.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', '.well-known', 'agent-skills');
const SITE = 'https://nexvert.online';

/** Shared footer: every skill must disclose that there is no programmatic interface. */
const browserNote = (tools) => `
## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

${tools.map((t) => `- [${t.label}](${SITE}${t.path}) — ${t.note}`).join('\n')}

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + \`index.md\` if you only
need the written guidance.
`;

const SKILLS = [
  {
    name: 'convert-image-formats',
    description:
      'Choose between and convert JPG, PNG, WEBP, HEIC, AVIF, GIF, BMP and SVG. Use when deciding which image format to use, or converting iPhone HEIC photos for compatibility.',
    body: `# Converting between image formats

## Pick the format by what the image is

| Format | Best for | Transparency | Lossy |
|---|---|---|---|
| **JPG** | photographs | no | yes |
| **PNG** | screenshots, logos, line art, anything needing transparency | yes | no |
| **WEBP** | web delivery — ~25-35% smaller than JPG at equivalent quality | yes | both |
| **AVIF** | web delivery, smaller again than WEBP, slower to encode | yes | both |
| **HEIC** | iPhone camera default; excellent compression, poor compatibility | yes | yes |
| **SVG** | icons, diagrams, anything that must scale without blurring | yes | n/a (vector) |

## The conversions people actually need

**HEIC to JPG.** iPhones shoot HEIC by default and many Windows apps, older web forms and
printing services cannot open it. Converting to JPG trades some file size for near-universal
compatibility. Convert a copy — HEIC holds more image data than the JPG will.

**PNG to JPG.** Worth doing for photographs saved as PNG, where the file is often several times
larger for no visible benefit. Do **not** do it when the image has transparency: JPG has no
alpha channel, so transparent areas flatten to a solid colour, usually white or black.

**To WEBP.** The single easiest page-weight win for a website. Keep a JPG or PNG fallback only
if you must support very old browsers; every current browser handles WEBP.

**SVG to PNG.** Needed when something only accepts raster images. Export at the largest size you
will ever display, since the PNG cannot scale back up cleanly.

## Things that commonly go wrong

- **Converting lossy to lossy repeatedly** re-compresses the image each time and the damage
  accumulates. Always go back to the original rather than re-converting an export.
- **Raising quality on an already-compressed file** does not restore detail. It only makes a
  bigger file containing the same lost data.
- **Colour shifts** usually mean the source had a non-sRGB colour profile. Convert to sRGB for
  anything destined for the web.
${browserNote([
  { label: 'Image converter (HEIC, PNG, WEBP…)', path: '/', note: 'accepts HEIC input; choose JPG as the output format' },
  { label: 'PNG to JPG', path: '/png-to-jpg/', note: 'shrink photographs stored as PNG' },
  { label: 'SVG converter', path: '/svg-converter/', note: 'vector to raster' },
])}`,
  },
  {
    name: 'compress-and-resize-images',
    description:
      'Reduce image file size and change pixel dimensions without visible quality loss. Use when an upload limit rejects a photo, or a page loads slowly because of large images.',
    body: `# Compressing and resizing images

Two different levers, often confused:

- **Resizing** changes pixel dimensions (4000x3000 to 1600x1200). This is usually the bigger win.
- **Compressing** keeps dimensions and discards image data via the quality setting.

Resize first, then compress. A 4000px-wide photo displayed in a 800px column is carrying ~25x
more pixels than it can ever show.

## Sensible targets

| Use | Longest edge | Quality |
|---|---|---|
| Full-width hero image | 1920-2560px | 75-85 |
| In-article image | 1200-1600px | 75-85 |
| Thumbnail | 400-600px | 70-80 |
| Email attachment | 1600px | 70-80 |

Quality 75-85 is the sweet spot for JPG and WEBP. Below ~60, compression artefacts become
visible around sharp edges and in flat gradients such as skies.

## Hitting a specific file size limit

Upload forms usually cap at 2 MB, 5 MB or 10 MB. In order of what to try:

1. Resize the longest edge to 1600px. Often sufficient on its own.
2. Convert to WEBP — typically 25-35% smaller than JPG at matching quality.
3. Lower quality to ~70. Inspect edges and gradients before accepting it.
4. For screenshots of text, keep PNG but reduce the dimensions — JPG makes text edges mushy.

## Things that commonly go wrong

- **Enlarging a small image** cannot add detail that was never captured; it interpolates and
  softens. Start from the largest original you have.
- **Compressing a PNG screenshot as JPG** produces visible ringing around text. Keep text-heavy
  images in PNG, or resize instead.
- **Stripping metadata** often saves a surprising amount on phone photos, and removes GPS
  coordinates as a side effect — see the \`strip-image-metadata\` skill.
${browserNote([
  { label: 'Compress image', path: '/image-compressor/', note: 'quality slider with live size preview' },
  { label: 'Resize image', path: '/resize-image/', note: 'exact dimensions or percentage, aspect ratio locked' },
  { label: 'Image converter', path: '/', note: 'convert to WEBP for a further size cut' },
])}`,
  },
  {
    name: 'strip-image-metadata',
    description:
      'Remove EXIF metadata including GPS coordinates, camera serial numbers and timestamps from photos before sharing them publicly. Use for privacy review of images.',
    body: `# Removing metadata from photos

## What a photo carries beyond the picture

Phone and camera photos embed EXIF metadata that frequently includes:

- **GPS coordinates** — often precise to a few metres, revealing a home or workplace
- **Date and time** the photo was taken
- **Camera make, model and serial number**, which can link separate photos to one device
- Lens, exposure settings, and sometimes a thumbnail of the *original* image from before edits

Anyone who downloads the file can read all of it. No special tooling is required.

## When this matters

- Selling something online and photographing it at home
- Posting photos of children, or of anywhere you regularly are
- Dating profiles and classified listings
- Journalism, activism, or any situation where a source's location is sensitive
- Sharing an edited image where the embedded thumbnail may still show the unedited original

## What already strips it, and what does not

Most large social platforms strip EXIF on upload — but **do not rely on this**. It varies by
platform, by upload path, and it does not apply to a file sent directly over email, messaging
apps that send "as a file", cloud links, or any site hosting the original.

Re-encoding the pixels removes metadata reliably, because the output is a new file built only
from image data.

## A caution on screenshots and redaction

Removing metadata does not redact the *picture*. Blurring or pixelating is only safe if applied
and then flattened — some formats and editors keep the original underneath. For sensitive
redaction, crop the region out entirely rather than covering it.
${browserNote([
  { label: 'Remove EXIF', path: '/remove-exif/', note: 'strips GPS, serials and timestamps by re-encoding clean pixels' },
  { label: 'Blur image', path: '/blur-image/', note: 'obscure faces or details before sharing' },
  { label: 'Pixelate image', path: '/pixelate-image/', note: 'mosaic over sensitive regions' },
  { label: 'Crop image', path: '/crop-image/', note: 'the most reliable redaction — remove the pixels' },
])}`,
  },
  {
    name: 'work-with-pdf-files',
    description:
      'Merge, split, compress, rotate, crop and watermark PDF files, and extract specific pages. Use for any task that reorganises or reduces the size of a PDF.',
    body: `# Working with PDF files

## Merging

Combining a cover letter, CV and certificates into one submission is the common case. Page order
is the thing people get wrong — set the order before merging rather than fixing it afterwards.
Merging copies pages as-is: text stays selectable, and fonts and images are preserved.

## Splitting and extracting

- **Split** divides one PDF into several files, by page range or into single pages.
- **Extract** pulls selected pages into one new document, leaving the original untouched.

Use extract when you need "pages 3-7 of this contract" and split when you need every page as its
own file.

## Why a PDF is unexpectedly large

Size is usually dominated by embedded images, not text. A text-only PDF is small; a scanned one
at 600 DPI is enormous, and 150-200 DPI is plenty for screen reading and most printing. So the
fix is almost always "rescan or re-export at a lower DPI", not a compression tool.

Nexvert does **not** have a PDF compressor — it has image compressors. If the PDF is a scan,
compressing the source images before rebuilding the PDF is the route that works.

## Rotation and cropping

- **Rotate** fixes sideways or upside-down scans. Rotation is stored as page metadata, so there
  is no quality loss.
- **Crop** trims margins or white space. Note that cropping usually *hides* rather than deletes
  the area — do not treat it as redaction for sensitive content.

## Watermarking and flattening

- **Watermark** stamps text across pages — "DRAFT", "CONFIDENTIAL", a name for traceability.
- **Flatten** converts fillable form fields into static page content so the values can no longer
  be edited. Do this before sending a completed form.

## A warning about redaction

Drawing a black box over text in most PDF editors does **not** remove the text — it draws a
shape on top, and the text underneath is still selectable and extractable. Genuine redaction
requires deleting the content or rasterising the page. Treat any "black box" PDF as unredacted.
${browserNote([
  { label: 'Merge PDF', path: '/pdf-merge/', note: 'combine files, drag to reorder' },
  { label: 'Split PDF', path: '/pdf-split/', note: 'by range or into single pages' },
  { label: 'Extract pages', path: '/extract-pdf-pages/', note: 'selected pages into a new document' },
  { label: 'Rotate PDF', path: '/rotate-pdf/', note: 'fix sideways scans, lossless' },
  { label: 'Flatten PDF', path: '/flatten-pdf/', note: 'lock form fields into the page' },
])}`,
  },
  {
    name: 'convert-audio-and-video',
    description:
      'Convert between MP4, MOV, WEBM, MP3, WAV and other audio/video formats, trim clips, extract audio from video, and make GIFs. Use for media format and size problems.',
    body: `# Converting audio and video

## Video formats

| Format | Use |
|---|---|
| **MP4** (H.264) | the safe default — plays essentially everywhere |
| **WEBM** (VP9) | smaller at the same quality, web-focused, less universal |
| **MOV** | Apple's container; often just H.264 inside, renamed |

MOV to MP4 is frequently a container change rather than a re-encode, so it is fast and lossless.
Converting *between codecs* always re-encodes and always loses some quality.

## Audio formats

| Format | Use |
|---|---|
| **MP3** | universal compatibility; 192-320 kbps for music, 96-128 kbps for speech |
| **WAV** | uncompressed, large, correct choice for editing and mastering |
| **M4A/AAC** | better than MP3 at the same bitrate; Apple ecosystem default |
| **OGG/Opus** | best quality per byte, excellent for voice, less universal |

Converting MP3 to WAV does not restore quality. It decompresses to a larger file containing
exactly the data the MP3 kept. Useful before editing, pointless for listening.

## Common tasks

**Extracting audio from video.** A lecture, interview or podcast recorded as video becomes a far
smaller audio file. Choose MP3 at 128 kbps for speech.

**Trimming.** Cutting start and end points with a stream copy avoids re-encoding entirely, so
there is no quality loss and it completes almost instantly. Prefer it when you only need to cut.

**Video to GIF.** GIFs are limited to 256 colours and are enormous compared with video. Keep
clips under ~5 seconds, drop the frame rate to 10-15 fps and reduce the dimensions, or the file
will be many megabytes.

**Muting.** Removing an audio track does not require re-encoding the video.

## Expect this to be slow

Video processing is genuinely demanding. A long or high-resolution file can take minutes and
will use substantial memory — more so in a browser than in a native application. Large video
work is more comfortable on a desktop than a phone.
${browserNote([
  { label: 'MOV to MP4', path: '/mov-to-mp4/', note: 'usually a fast container change' },
  { label: 'Video to MP3', path: '/video-to-mp3/', note: 'extract the audio track' },
  { label: 'Trim video', path: '/video-trimmer/', note: 'stream copy, lossless' },
  { label: 'Video to GIF', path: '/video-to-gif/', note: 'frame rate and size controls' },
  { label: 'WAV to MP3', path: '/wav-to-mp3/', note: 'choose your bitrate' },
  { label: 'Mute video', path: '/mute-video/', note: 'drop the audio, no re-encode' },
])}`,
  },
  {
    name: 'convert-structured-data',
    description:
      'Convert and reformat JSON, CSV, XML, YAML and Markdown tables, and validate or prettify them. Use for data interchange and config file format tasks.',
    body: `# Converting structured data formats

## What converts cleanly, and what does not

| From → To | Clean? | Why |
|---|---|---|
| JSON → YAML | yes | YAML is a superset of JSON |
| YAML → JSON | mostly | YAML anchors, comments and multi-document files have no JSON equivalent |
| JSON → CSV | only if flat | CSV is a single table; nested objects must be flattened or dropped |
| CSV → JSON | yes | each row becomes an object keyed by the header row |
| JSON ↔ XML | lossy both ways | XML distinguishes attributes from elements; JSON does not |

**The recurring problem is nesting.** CSV is two-dimensional. Converting
\`{"user": {"name": "A", "tags": ["x","y"]}}\` to CSV requires a decision: flatten to
\`user.name\`, join the array into one cell, or produce multiple rows. Dot-notation flattening is
the usual default — check it matches what the consumer expects.

## CSV problems that waste the most time

- **Delimiters.** Not always a comma. Semicolons are standard across much of Europe, where the
  comma is the decimal separator. Tabs are common in exports.
- **Quoting.** Fields containing the delimiter, quotes or newlines must be quoted, with embedded
  quotes doubled. Hand-written CSV usually gets this wrong.
- **Encoding.** Mangled accented characters almost always mean a UTF-8 file read as Latin-1, or
  the reverse. Excel on Windows often wants a BOM.
- **Leading zeros and long numbers.** Spreadsheets silently turn \`00123\` into \`123\` and long
  IDs into scientific notation. Keep such columns as text.

## YAML gotchas

- Tabs are illegal for indentation. Use spaces.
- Unquoted \`yes\`, \`no\`, \`on\`, \`off\`, \`true\`, \`false\` become booleans. A country code like
  \`NO\` becomes \`false\` unless quoted.
- Unquoted strings beginning with \`0\` may be read as octal.

## Validate before you convert

Most conversion failures are a malformed source, not the converter. Run the input through a
formatter or validator first — a JSON parse error with a line number is far more useful than a
confusing output.
${browserNote([
  { label: 'JSON to CSV', path: '/json-to-csv/', note: 'dot-notation flattening for nested objects' },
  { label: 'CSV to JSON', path: '/csv-to-json/', note: 'header row becomes object keys' },
  { label: 'JSON to YAML', path: '/json-to-yaml/', note: 'configurable indentation' },
  { label: 'JSON formatter', path: '/json-formatter/', note: 'validate and prettify, with a tree view' },
  { label: 'CSV to Markdown', path: '/csv-to-markdown/', note: 'aligned GFM tables' },
  { label: 'XML formatter', path: '/xml-formatter/', note: 'validate and indent' },
])}`,
  },
];

function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const NAME_RE = /^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/;
  const entries = [];

  for (const skill of SKILLS) {
    if (!NAME_RE.test(skill.name)) throw new Error(`Invalid skill name: ${skill.name}`);
    if (skill.description.length > 1024) throw new Error(`Description too long: ${skill.name}`);

    // SKILL.md MUST open with YAML frontmatter carrying name and description.
    const md = `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n${skill.body.trim()}\n`;
    const dir = path.join(outDir, skill.name);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'SKILL.md');
    fs.writeFileSync(file, md, 'utf8');

    // Digest is over the raw bytes actually served, so it is computed after writing.
    const digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    entries.push({
      name: skill.name,
      type: 'skill-md',
      description: skill.description,
      url: `/.well-known/agent-skills/${skill.name}/SKILL.md`,
      digest: `sha256:${digest}`,
    });
  }

  const index = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: entries,
  };
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`✅ ${entries.length} agent skills published to public/.well-known/agent-skills/.`);
}

main();
