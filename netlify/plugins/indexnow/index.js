// After a successful production deploy, tell IndexNow search engines (Bing, Yandex, Seznam,
// Naver…) that every URL in the sitemap may have changed. Bing's index also powers ChatGPT
// Search and Copilot answers. Failures are logged but never fail the deploy.
const fs = require('fs');
const path = require('path');

module.exports = {
  async onSuccess({ constants }) {
    if (process.env.CONTEXT !== 'production') {
      console.log('IndexNow: skipped (not a production deploy).');
      return;
    }
    try {
      const publishDir = constants.PUBLISH_DIR;
      const sitemap = fs.readFileSync(path.join(publishDir, 'sitemap.xml'), 'utf8');
      const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      const keyFile = fs.readdirSync(publishDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
      if (!keyFile || !urlList.length) {
        console.log('IndexNow: key file or sitemap URLs not found, skipping.');
        return;
      }
      const key = keyFile.replace('.txt', '');
      const host = new URL(urlList[0]).host;
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
      });
      console.log(`IndexNow: submitted ${urlList.length} URLs → HTTP ${res.status}`);
    } catch (err) {
      console.log(`IndexNow: submission failed (${err.message}); deploy is unaffected.`);
    }
  },
};
