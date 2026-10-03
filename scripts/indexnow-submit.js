/**
 * Submits every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver…). Bing's index also
 * feeds ChatGPT Search and Copilot answers, so this is the one ping that reaches an answer
 * engine directly.
 *
 * Replaces netlify/plugins/indexnow, which was a Netlify build plugin using the `onSuccess`
 * hook. Vercel has no equivalent plugin API, so this is a plain script instead.
 *
 * It reads dist/sitemap.xml and the generated <key>.txt file, so run it after `npm run build`.
 *
 * Timing caveat worth understanding: the Netlify plugin ran on `onSuccess`, i.e. after the
 * deploy was live. Run from a build step this fires *before* the new content is served. That is
 * usually fine — IndexNow is a "please recrawl" notification and the crawler arrives later, not
 * instantly — but if you want the old guarantee, run it from a post-deploy GitHub Action
 * instead (see the npm script and the note in SEO-GEO-AEO-PLAYBOOK.md).
 *
 * Never throws: a failed ping must not fail a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

async function main() {
  // Only submit for real production deploys. Vercel sets VERCEL_ENV; allow a manual override
  // so the script can be run by hand or from CI without faking a Vercel environment.
  const env = process.env.VERCEL_ENV || process.env.CONTEXT;
  if (env && env !== 'production' && process.env.INDEXNOW_FORCE !== '1') {
    console.log(`IndexNow: skipped (env="${env}", not production). Set INDEXNOW_FORCE=1 to override.`);
    return;
  }

  if (!fs.existsSync(distDir)) {
    console.log('IndexNow: dist/ not found — run the build first. Skipping.');
    return;
  }

  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.log('IndexNow: dist/sitemap.xml not found, skipping.');
    return;
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const keyFile = fs.readdirSync(distDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));

  if (!keyFile || !urlList.length) {
    console.log('IndexNow: key file or sitemap URLs not found, skipping.');
    return;
  }

  const key = keyFile.replace('.txt', '');
  const host = new URL(urlList[0]).host;

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
    });
    console.log(`IndexNow: submitted ${urlList.length} URLs for ${host} → HTTP ${res.status}`);
  } catch (err) {
    console.log(`IndexNow: submission failed (${err.message}); deploy is unaffected.`);
  }
}

main().catch((err) => {
  console.log(`IndexNow: unexpected error (${err.message}); deploy is unaffected.`);
});
