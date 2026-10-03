// Copies self-hosted WebAssembly runtimes from node_modules into public/ so the
// OCR (tesseract.js) and video (ffmpeg.wasm) tools never depend on a CDN and
// never 404 because a file was forgotten. Runs before `vite build`.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nm = path.join(root, 'node_modules');
const pub = path.join(root, 'public');

const OCR_LANGS = ['eng', 'spa', 'fra', 'deu', 'ita', 'por'];

const copies = [
  // tesseract.js worker + LSTM-only cores (createWorker(lang, 1) => OEM 1 = LSTM_ONLY)
  ['tesseract.js/dist/worker.min.js', 'tesseract/worker.min.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract/tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract/tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract/tesseract-core-relaxedsimd-lstm.wasm.js'],
  ...OCR_LANGS.map((lang) => [
    `@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`,
    `tesseract/lang-data/${lang}.traineddata.gz`,
  ]),
  // ffmpeg.wasm single-threaded core (ESM build is what @ffmpeg/ffmpeg 0.12 loads in a module worker)
  ['@ffmpeg/core/dist/esm/ffmpeg-core.js', 'ffmpeg/ffmpeg-core.js'],
  ['@ffmpeg/core/dist/esm/ffmpeg-core.wasm', 'ffmpeg/ffmpeg-core.wasm'],
];

let copied = 0;
for (const [from, to] of copies) {
  const src = path.join(nm, from);
  const dest = path.join(pub, to);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing runtime asset: node_modules/${from}. Run npm install.`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dest) && fs.statSync(dest).size === srcStat.size) continue;
  fs.copyFileSync(src, dest);
  copied++;
}
console.log(`✅ Runtime assets ready (${copies.length} files, ${copied} updated).`);
