# Nexvert — SEO / AEO / GEO playbook

Everything on-page is done and verified in the build. What remains is off-page, and it needs
your accounts, so this file is written to be copy-paste.

Ordered by impact. Do them top to bottom.

---

## 0. ACTION REQUIRED IN CODE (2 minutes, do this first)

Open `src/config/site.config.ts` and fill in two things:

```ts
export const SITE_OPERATOR = {
  name: 'Your Full Name',   // <- currently empty; while empty, Nexvert is an anonymous entity
  type: 'Person',
  country: 'PK',            // <- your ISO country code
  foundingYear: '2025',
};
```

And once any profile exists, add it here:

```ts
export const SOCIAL_PROFILES: string[] = [
  'https://github.com/<handle>',
  'https://x.com/<handle>',
];
```

Both feed `founder` and `sameAs` in the Organization schema. Empty values are omitted, so
nothing breaks — you just forfeit the signal. Rebuild after editing.

---

## 1. ✅ DONE — AI crawlers unblocked in Cloudflare

**Verified fixed.** Re-tested live against `/pdf-merge/`:

| Agent | Before | Now |
|---|---|---|
| GPTBot | 403 blocked | **200** |
| PerplexityBot | 403 blocked | **200** |
| ClaudeBot | 403 blocked | **200** |
| ChatGPT-User / Perplexity-User / Claude-User | 200 | 200 |

`https://nexvert.online/robots.txt` is now 3,351 bytes and byte-identical to `public/robots.txt`
— the Cloudflare managed block is gone and this repo is the single source of truth again.

One consequence worth knowing: the only `Content-Signal` line the site had came *from* that
Cloudflare block, so removing it removed the signal too. That is why it is now declared
explicitly in `public/robots.txt` — see §1b.

If AI crawlers ever start returning 403 again, this setting is the first place to look.

---

### 1b. Content Signals

`public/robots.txt` now declares, on **every** user-agent group:

```
Content-Signal: search=yes, ai-input=yes, ai-train=yes
```

Per [contentsignals.org](https://contentsignals.org/):

- **search** — indexing and returning links/excerpts. Explicitly *excludes* AI-generated summaries.
- **ai-input** — RAG, grounding, "real-time taking of content for generative AI search answers".
  **This is the GEO one.** `ai-input=no` asks ChatGPT, Perplexity, Gemini and Claude not to use
  the site in answers, so any guide recommending `ai-input=no` is recommending the opposite of
  what this site wants.
- **ai-train** — training or fine-tuning. Set to `yes` here to match the `Allow: /` already given
  to GPTBot/ClaudeBot/CCBot; flip both together if you ever want to reserve training rights.

Omitting a signal is not neutral-good or neutral-bad: per the spec it "neither grants nor
restricts permission", which is exactly the ambiguity the audit flagged.

The signal is repeated per group deliberately. Under RFC 9309 a crawler obeys only the single
most specific group matching its name, so a signal placed only under `User-agent: *` would be
invisible to GPTBot, Googlebot and every other agent that has its own group. `npm run seo:audit`
now fails loudly if any group lacks a signal, or if `ai-input=no` ever appears.

<details>
<summary>Historical: what the Cloudflare block used to do</summary>

Cloudflare was injecting a managed `robots.txt` ahead of yours. Verify with:

```
curl https://nexvert.online/robots.txt
```

You will see `# BEGIN Cloudflare Managed content` followed by `Disallow: /` for:

| Blocked agent | What it costs you |
|---|---|
| `ChatGPT-User` | ChatGPT cannot open your page when a user asks |
| `Perplexity-User` | Perplexity cannot fetch you as a live source |
| `Claude-User` | Claude cannot open your page |
| `Google-NotebookLM` | Excluded from NotebookLM |
| `MistralAI-User`, `Kimi-User` | Excluded from those assistants |
| `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot` | Excluded from model training and Google AI Overviews grounding |
| `Baiduspider`, `PetalBot` | Excluded from Baidu and Huawei search |

**Fix:** Cloudflare dashboard → select the `nexvert.online` zone → **AI Crawl Control**
(previously "AI Audit") → turn **off** managed `robots.txt` / "block AI crawlers".

The repo's `public/robots.txt` has already been rewritten to explicitly allow every one of
these agents. The moment Cloudflare stops overriding it, the correct policy goes live.

One nuance worth knowing: `PerplexityBot` and `OAI-SearchBot` (the *indexers*) were never
blocked — only the *live fetchers* were. So you can be in their index but not quotable in a
live answer. Unblocking fixes the second half.

</details>

---

## 2. Search Console + Bing (30 minutes)

1. Google Search Console → resubmit `https://nexvert.online/sitemap.xml`.
2. Use **URL Inspection → Request Indexing** on these 10 first:
   - `/`, `/pdf-merge/`, `/pdf-split/`, `/heic-to-jpg/`, `/png-to-jpg/`,
     `/video-to-gif/`, `/compress-pdf/`, `/tools/`, `/file-security/`, `/guides/`
3. Check **Pages → Why pages aren't indexed**. With 213 submitted and ~40 indexed, the reason
   listed there ("Discovered – currently not indexed" vs "Crawled – currently not indexed")
   tells you whether it is a crawl-budget problem or a quality/authority problem.
4. Bing Webmaster Tools → add the site → import from GSC. Your IndexNow key is already wired
   (`netlify/plugins/indexnow` fires on every deploy), so Bing/Yandex/Seznam get pinged
   automatically once the site is verified there.

---

## 3. Create the entity profiles (in this order)

You said none exist yet. Impact order:

1. **GitHub** — highest value here. The site is browser-based and WebAssembly-driven; a repo
   or even a profile + pinned page is the most natural corroboration for a dev tool. AI
   engines weight GitHub heavily for software entities.
2. **X / Twitter** — brand verification; frequently cited for "is this legit".
3. **Product Hunt** — see §4.
4. **LinkedIn page** — only worth it if you register a company later.

Add each URL to `SOCIAL_PROFILES` as you create it.

---

## 4. The ~15 listings that actually matter

Skip bulk directories. These are the ones that either carry real authority or are
demonstrably scraped by answer engines.

**Tier 1 — do these**

| Site | Why |
|---|---|
| Product Hunt | Heavily cited by AI engines for "best X tool" answers |
| AlternativeTo | Directly feeds "alternatives to Smallpdf/iLovePDF" queries |
| Slant | Structured pros/cons; surfaces in comparison answers |
| SaaSHub | Well-crawled software directory |
| G2 (free listing) | Strong entity signal even without reviews |
| Hacker News (Show HN) | One good post beats 100 directories |
| Reddit r/webdev, r/privacy, r/software | Genuine participation only — see the warning below |

**Tier 2 — cheap, worth doing**

| Site | Why |
|---|---|
| Indie Hackers | Founder-story surface, good for the Person entity |
| BetaList | Early-stage discovery |
| Awesome-* GitHub lists | PR to `awesome-privacy`, `awesome-selfhosted`-adjacent lists |
| StackShare | Tech-stack entity graph |
| Crunchbase | Entity record AI engines resolve against |
| Wikidata | A Wikidata item is a very strong entity anchor |
| ToolFinder / There's An AI For That | Tool-aggregator surfaces |

**A warning, meant seriously:** Reddit and Hacker News punish promotional drive-bys hard, and
a burned account is hard to undo. Post as a maker sharing something and answer questions, or
don't post. Do not buy links, do not submit to link farms, and do not create review accounts —
those are exactly the patterns that trigger a Google link penalty, and they do nothing for AI
citation because answer engines weight editorial mentions, not directory rows.

---

## 5. Copy-paste submission copy

**Name:** Nexvert

**One-liner (60 chars):**
`Free file converter that runs entirely in your browser`

**Short (140 chars):**
`Nexvert converts PDF, image, audio and video files in your browser. 190+ free tools, no upload, no sign-up, no watermark.`

**Medium (280 chars):**
`Nexvert is a free online file converter with 190+ tools for PDF, images, audio, video, archives and developer data. Everything runs locally in your browser using WebAssembly (ffmpeg.wasm, Tesseract, pdf-lib), so your files never leave your device. No account, no watermark, no install.`

**Long (for Product Hunt / AlternativeTo):**
```
Nexvert is a free online file converter that does all its work inside your own browser.

Most converters upload your file to a server, process it there, and ask you to trust their
retention policy. Nexvert doesn't upload anything. Conversions run locally using browser APIs
and WebAssembly — ffmpeg.wasm for audio and video, pdf-lib and pdf.js for documents, Tesseract
for OCR, and Canvas for images. Your file stays in your device's memory and is gone when you
close the tab.

190+ tools covering PDF (merge, split, compress, rotate, watermark, OCR), images (HEIC, WEBP,
PNG, JPG, resize, compress, EXIF removal), audio (MP3, WAV, trim, merge, normalise), video
(MP4, MOV, WEBM, GIF, trim, mute), archives, and developer utilities (JSON, CSV, XML, YAML,
hashing, encoding).

Free, no account, no watermarks, no file-count limits. Works on desktop and mobile.
```

**Categories:** Productivity · Developer Tools · Privacy · File Management · Utilities

**Tags:** `file-converter` `pdf-tools` `privacy` `webassembly` `browser-based` `no-upload`
`image-converter` `video-converter` `free-tools`

---

## 6. Content that wins AI citations

Answer engines quote pages that answer a question directly and comparatively. You have 9
guides; these are the gaps worth filling, in priority order:

1. **Comparison pages** — the highest-value GEO content there is:
   - "Nexvert vs Smallpdf", "vs iLovePDF", "vs CloudConvert", "vs Zamzar"
   - Be scrupulously accurate about competitors. A comparison caught overstating is worse
     than no comparison.
2. **"Best X" listicles you legitimately belong in**, e.g. "Best browser-based PDF tools".
3. **Problem-first guides** — "how to convert HEIC to JPG without uploading photos",
   "how to remove GPS data from a photo before posting".
4. **A real About page.** Yours is 302 words and names nobody. It is the page both Google and
   AI engines read to decide whether you are a real operation. Name yourself, say why you
   built it, explain the browser-based architecture, and state the privacy model plainly.

---

## 7. What your FAQ / HowTo schema is actually worth now

Worth being precise about, because it changes where effort should go:

- **FAQ rich results were fully retired in Google Search on 7 May 2026.** The earlier
  restriction to government and health sites (Aug 2023) was an intermediate stage, not the
  end state. Search Console rich-result reporting for FAQ was removed in June 2026 and the
  API support in August 2026.
- **HowTo rich results were removed from desktop and mobile in Aug 2023**, and Google deleted
  the HowTo structured-data documentation entirely.

So the 194 FAQPage and 193 HowTo blocks on this site now produce **zero Google rich results**.

They are not wasted — `FAQPage` and `HowTo` remain valid schema.org types, and they are still
read by answer engines, so they are now purely **AEO/GEO assets**. That is also why the step
markup was improved rather than removed.

The practical consequence: **do not invest further effort in schema hoping for Google rich
snippets.** The remaining upside is in §1 (unblocking AI crawlers), §3 (entity profiles) and
§6 (comparison content). Rankings now come from authority and content, not markup.

---

## 8. What is already done (verified in the build)

- 213 pages pre-rendered; all on-page signals pass at 213/213: canonical, single H1, valid
  JSON-LD, complete Open Graph + Twitter tags, `html lang`, viewport, indexable.
- 0 duplicate titles, 0 duplicate descriptions.
- Every title now sits in the 30–70 char band (10 fixed) and every description in 90–170
  (66 rewritten, each one unique).
- Organization entity enriched: `slogan`, `foundingDate`, `knowsAbout` (8 topics),
  `areaServed`, `alternateName`, plus `sameAs`/`founder`/`address` wired and waiting on §0.
- `HowTo` steps now carry real names, `totalTime` and `estimatedCost`; generic "Step 1"
  labels are suppressed so the step text is what gets extracted.
- `llms.txt` (index) **and new `llms-full.txt`** — 193 pages of complete answer content,
  297 KB, served as plain text with CORS open and linked from every page's `<head>`.
  **Set your expectations low on this one** (see below).
- `public/robots.txt` rewritten to explicitly allow all search, answer-engine and live-fetch
  agents. Blocked upstream by Cloudflare until you do §1.
- IndexNow auto-ping on deploy; clean single sitemap with `lastmod`.

---

## 9. Honest note on llms.txt / llms-full.txt

I built `llms-full.txt` for you, and then checked whether the evidence supports it. It mostly
does not, so here is the straight version rather than the sales pitch:

- An Ahrefs study of 137,210 live domains (May 2026) found **97% of llms.txt files received
  zero requests from any bot.**
- GPTBot fetches it only rarely; OpenAI's own guidance points to `robots.txt`, not `llms.txt`.
- PerplexityBot effectively does not fetch it. Claude does not use it for search or training.
- There is **no measurable evidence** that having one improves citation odds in ChatGPT,
  Claude, Gemini or Perplexity.

Where it genuinely is used: **IDE agents and MCP integrations** (Cursor, Continue, Cline) and
developer-platform docs (Stripe, Vercel, Cloudflare, Anthropic). For a developer-adjacent tool
site that is a real, if modest, audience.

**Verdict:** keep it — it is generated automatically on every build, costs nothing to
maintain, and is correctly served. But do not count it as a GEO strategy. It is a cheap
option on a standard that may or may not matter later.

**The thing that actually determines AI citation is ordinary crawlability plus authority** —
which is exactly why §1 (unblock the Cloudflare AI crawler block) and §3/§4 (entity + real
mentions) are where the effort belongs. An answer engine cannot cite a page it is forbidden
to fetch, no matter how well marked up it is.

---

## 10. Markdown for agents

An audit flagged "Site does not support Markdown for Agents" and recommended `Accept: text/markdown`
content negotiation. I checked the measured evidence first, and it pointed somewhere else.

### What the server-log studies actually show

Three independent log studies agree, and they disagree with the obvious reading:

| Agent | Sends `Accept: text/markdown`? | Fetches `.md` files? |
|---|---|---|
| Claude Code, Cursor, OpenCode | **Yes**, on nearly every request | via the header |
| GPTBot | No | **Yes** — ~35% of its fetches in one study |
| ClaudeBot | No | **Yes** — roughly 4 `.md` per 10 HTML |
| PerplexityBot | No | Essentially never |
| Googlebot | No | No |
| ChatGPT-User, Claude-User, Perplexity-User | No | **No** — one study logged *one* Markdown fetch in two weeks against 13,000+ HTML fetches |

Two conclusions follow:

1. **Content negotiation serves coding agents, not answer engines.** The header is a coding-tool
   convention. The engines Nexvert wants citations from fetch the HTML a human would see.
2. **`.md` URLs are what the crawlers that matter actually take**, by following links — not by
   negotiating.

### What I implemented, and why

Every page now has a Markdown twin at `<url>index.md`, generated at build time by
`scripts/prerender.js` from the same data as the HTML, and announced in each page's `<head>`:

```html
<link rel="alternate" type="text/markdown" href="https://nexvert.online/pdf-merge/index.md" />
```

They are also advertised in `llms.txt`, and `netlify.toml` serves `/*.md` as
`text/markdown; charset=utf-8` with CORS open.

I deliberately did **not** build `Accept` negotiation. Netlify redirects cannot branch on a
request header, so it would need an edge function in front of every request — a runtime cost and
a new failure mode on all traffic, aimed at the audience least likely to use it. Static files
cost nothing per request and reach the crawlers that do fetch Markdown.

### If you want true content negotiation anyway

Cloudflare's **Markdown for Agents** does it at the edge with no code: dashboard → your zone →
**AI Crawl Control** → enable **Markdown for Agents**. It needs a **Pro or Business plan**; it is
free within those plans. I verified it is currently **off** for nexvert.online — `Accept:
text/markdown` returns HTML with no `x-markdown-tokens` header and no `vary: accept`.

If you enable it, note it sets `Content-Signal: ai-train=yes, search=yes, ai-input=yes` by
default on converted responses — which already matches the policy in `robots.txt`.

### Do not do this

**Never serve Markdown based on User-Agent sniffing.** Detecting GPTBot and handing it different
content from what a browser gets is [cloaking](https://developers.google.com/search/docs/essentials/spam-policies#cloaking)
and Google penalises it. Content negotiation is safe precisely because the *client asks*; a
`.md` URL is safe because it is a separate, publicly linked document. UA-based switching is
neither.

### Honest expectation

This is cheap and evidence-backed, but keep it in proportion: it mainly helps **training
crawlers** ingest the content more cleanly, and helps developers whose coding agents hit the
site. It will **not** directly produce citations in ChatGPT or Perplexity answers, because those
fetch the HTML. The levers for citations remain authority and entity signals (§3, §4, §6).

---

## 11. The isitagentready.com scan — what to chase and what to ignore

Running their own validator against the **live** site returned 13 fails, 3 passes, 6 neutral.
Two things matter about that result.

### The two fails you were chasing are already fixed — they just aren't deployed

| Check | Live | In this repo |
|---|---|---|
| `botAccessControl.contentSignals` | 0 `Content-Signal` lines | **31** |
| `contentAccessibility.markdownNegotiation` | no `.md` | **213 Markdown twins** |

The live `robots.txt` is 3,351 bytes; this repo's is 6,839. **Deploying is the fix.** Re-scan
after deploy rather than implementing anything further for these two.

Already passing live: `robotsTxt` (valid, 200, `text/plain; charset=utf-8`), `sitemap`, and
`robotsTxtAiRules` (it detected rules for gptbot, chatgpt-user, oai-searchbot, google-extended,
ccbot, anthropic-ai, bytespider, perplexitybot, cohere-ai, applebot-extended).

### Most of the remaining fails do not apply to this site

The scanner grades against a generic "agentic web" checklist. Nexvert is a static, account-less,
API-less, client-side tool site, so several checks fail because the underlying thing does not
exist — and inventing it would be worse than failing:

| Check | Why it fails | Verdict |
|---|---|---|
| `oauthDiscovery`, `oauthProtectedResource` | no authentication anywhere | **Do not add.** Advertising OAuth metadata for auth that does not exist is false advertising |
| `authMd` | no accounts | Not applicable |
| `apiCatalog` | no server API — everything runs in the browser | **Do not add** — see §14 |
| `mcpServerCard` | no MCP server | Only if you ever build one |
| `a2aAgentCard` | Nexvert is a tool, not an agent | Not applicable |
| `ard`, `dnsAid` | nascent, low-adoption specs | Ignore for now |
| `agentSkills` | early, largely single-vendor convention | Revisit if adoption grows |
| `webMcp` | emerging browser API for exposing page capabilities | Genuinely interesting for a tool site later; too early now |
| `linkHeaders` | no `Link:` header was served | **Fixed** — see below |
| `commerce.*` (6 checks) | not a commerce site | Correctly marked neutral by the scanner |

### What was worth taking from it

`linkHeaders` was a fair catch, so `netlify.toml` now serves an RFC 8288 header on every
response advertising both summaries:

```
Link: </llms.txt>; rel="alternate"; type="text/plain"; title="LLM summary",
      </llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM full content"
```

That lets an agent discover them from a `HEAD` request without parsing HTML.

### The general rule

**A perfect score on this scanner is not the goal.** It measures conformance to a checklist of
emerging protocols, most of which presuppose a site that authenticates users, exposes an API or
acts as an agent. Nexvert does none of those, deliberately — that is the product. Chase the
checks that describe something true about the site; ignore the ones that would require
fabricating infrastructure to satisfy a validator.

---

## 12. sitemap.xml — already passing, with one real caveat

The scanner reports `discoverability.sitemap: "pass"`. Validated independently against the
[Sitemaps protocol](https://www.sitemaps.org/protocol.html) on the live site:

| Check | Result |
|---|---|
| HTTP status / type | 200, `application/xml; charset=utf-8` |
| Well-formed XML, correct `urlset` namespace | yes |
| `<url>` entries | 213 — matches the route count exactly |
| Duplicate `<loc>` | 0 |
| Non-HTTPS or off-domain URLs | 0 |
| URLs missing a trailing slash | 0 |
| Entries with `<lastmod>` | 213 of 213 |
| Protocol limits (50,000 URLs / 50 MB) | 22 KB, well under |
| Referenced from robots.txt | yes, one `Sitemap:` directive |

Canonical consistency was separately verified by fetching all 213 live pages: **0 canonical
mismatches**, so every `<loc>` is the canonical URL of the page it points at.

### The caveat: one shared `lastmod`

All 213 entries carry the same date, `SITE_LAST_UPDATED`, bumped by hand in
`src/config/site.config.ts`.

That is not invalid, and it is honest while it is true — but it is fragile. Google only uses
`lastmod` while it trusts it, and the failure mode is silent: change page copy, forget to bump
the constant, and every entry now asserts a date that is wrong.

**Deliberately not "fixed" by automation.** Setting `lastmod` to the build date would claim all
213 pages changed on every deploy, which is worse: it is false, and it is exactly the pattern
that makes Google discard the signal.

Instead, `npm run seo:audit` now fingerprints the config files that hold page copy
(`routes.config`, `converters.config`, `conversions.config`, `guides.config`, `home-content`,
`unique-*`) into `scripts/.content-stamp.json`. If that fingerprint moves while
`SITE_LAST_UPDATED` stays put, the build warns:

```
⚠️ Page content changed since the last build but SITE_LAST_UPDATED is still 2026-09-22.
   Bump it in src/config/site.config.ts so <lastmod> stays truthful.
```

Verified by editing a content file and re-running: the warning fires, and clears once the date
is bumped. Commit `scripts/.content-stamp.json` so the comparison survives CI builds.

**So: bump `SITE_LAST_UPDATED` when you next deploy content changes** — the 66 rewritten
descriptions and the new Markdown twins are exactly the kind of change it should reflect.

---

## 13. AI crawler rules — the check that already passes, and the gap it missed

`botAccessControl.robotsTxtAiRules` reports **pass**: *"Found rules for AI bots: gptbot,
chatgpt-user, oai-searchbot, google-extended, ccbot, anthropic-ai, bytespider, perplexitybot,
cohere-ai, applebot-extended, amazonbot, meta-externalagent."* That sentence is the scanner's
success message, not a defect — its "Fix" paragraph is boilerplate shown regardless of status.

Its suggestion was also partly out of date. It named **Claude-Web**, which Anthropic
**deprecated** — and it did not mention the one that actually matters.

### The real gap: Claude-SearchBot

Anthropic documents three current crawlers, each separately controllable:

| Crawler | Purpose | Was it in robots.txt? |
|---|---|---|
| `ClaudeBot` | training data | yes |
| `Claude-User` | fetches a page when a user asks Claude about it | yes |
| `Claude-SearchBot` | **indexes content for Claude's web search** | **no — now added** |

`Claude-SearchBot` is the Claude equivalent of `OAI-SearchBot`, which was already listed.
Anthropic's own documentation says blocking it *"prevents our system from indexing your content
for search optimization, which may reduce your site's visibility."* Leaving it undeclared meant
the site had an explicit policy for ChatGPT's search index but none for Claude's.

`Claude-Web` and `anthropic-ai` are both retired. Both are now present anyway, clearly commented
as a deprecated compatibility layer — harmless to keep, and it satisfies the checker's literal
suggestion.

Coverage now spans every documented crawler for OpenAI (GPTBot, OAI-SearchBot, ChatGPT-User),
Anthropic (ClaudeBot, Claude-User, Claude-SearchBot), Perplexity (PerplexityBot,
Perplexity-User) and Google (Googlebot, Google-Extended) — **33 groups, 33 Content-Signal
lines.**

### Worth remembering

This lineup changes: OpenAI added OAI-SearchBot in 2024, Anthropic split out Claude-SearchBot in
2025. A scanner that grades against a fixed list will not tell you when a vendor ships a new
agent. Re-check the vendor docs roughly quarterly — they are the authority, not the checker.

---

## 14. API Catalog (RFC 9727) — deliberately not implemented

The scanner reports `discovery.apiCatalog` as a fail and suggests publishing
`/.well-known/api-catalog`. **This should stay failing.**

### Nexvert has no API. Verified, not assumed:

| Looked for | Found |
|---|---|
| `netlify/functions/` | does not exist |
| `netlify/edge-functions/` | does not exist |
| `functions` / `edge_functions` in `netlify.toml` | none |
| Same-origin `fetch()` calls for data in `src/` | none |
| OpenAPI / Swagger spec anywhere in the repo | none |

The only thing under `netlify/` is the IndexNow **build plugin**, which runs during deploy and
is not a public endpoint. Every tool runs in the visitor's browser via WebAssembly — that is the
product, not an implementation detail.

### What the RFC actually says

RFC 9727 is scoped to *"HTTPS servers that publish APIs"*, and the catalogue is *"a document
providing information about, and links to, the Publisher's APIs."* Each entry requires an
`anchor` URL plus `service-desc` (an OpenAPI spec) and `service-doc` (documentation).

With no APIs, satisfying the check would mean inventing all three: an anchor for an endpoint
that does not exist, an OpenAPI document describing operations that do not exist, and docs for
functionality that does not exist. That is publishing false metadata to make a validator go
green — the same category as the `oauthDiscovery` checks, and the reason those are refused too.

An empty `linkset` would be honest but pointless, and would not pass the check anyway.

### If you ever genuinely want this to pass

Build a real API first — for example a documented endpoint that performs a conversion
server-side. That is a **product decision** with real cost (servers, abuse handling, and it
contradicts the "nothing is uploaded" promise the whole site is built on). The catalogue is then
trivial and, more importantly, true. Do not do it the other way round.

---

## 15. auth.md / OAuth metadata (RFC 9728 family) — deliberately not implemented

The scanner reports `authMd`, `oauthDiscovery` and `oauthProtectedResource` as fails. All three
should stay failing, for the same reason as §14.

### Nexvert has no authentication. Verified, not assumed:

| Looked for | Found |
|---|---|
| OAuth / OIDC anywhere in `src/` | none |
| Sign-in, sign-up, sessions, accounts | none |
| API keys, bearer tokens, auth headers | none |
| `/auth.md`, `/.well-known/oauth-*` live | 404, 404, 404 |

The only JWT references in the codebase belong to the **JWT Decoder tool** — a client-side
utility that decodes a token the visitor pastes in. It authenticates nothing.

### Why implementing it would be actively wrong

The spec asks for OAuth Protected Resource Metadata naming an `authorization_servers` entry,
Authorization Server metadata with a matching `issuer`, and an `agent_auth` block with a
`register_uri` and working registration methods.

None of those exist. Publishing them means pointing agents at an authorization server that is
not there and a registration endpoint that cannot respond. An agent that trusts the document
does not get a degraded experience — it gets a broken one. That is worse than a failed check.

It also contradicts the product outright: the homepage promises *"no sign-up"*, and the site's
whole premise is that nothing needs an account.

### The honest fallback exists, and is still not recommended

The standard allows a self-contained `/auth.md` when no OAuth metadata is available. For Nexvert
that document would read: no agent audience, no registration endpoint, no methods, no
credentials — four "none"s. It would be truthful and would likely pass the check, but it tells
an agent nothing it cannot already infer, and there is no API to authenticate *to* even if it
did. Available on request; not worth shipping by default.

### The distinction that matters

`public/.well-known/security.txt` **is** published here, and should be — there is a real
security contact behind it (`support@nexvert.online`, valid to 2027-09-20, served as
`text/plain`, 200). That is the test for any well-known file:

> Publish it when it describes something true about the site. Refuse it when the file would
> have to invent the thing it describes.

`security.txt` passes that test. `auth.md`, the OAuth documents and `api-catalog` do not.

---

## 16. Post-deploy scan results (confirmed)

After deploying, two checks flipped on their own, exactly as expected:

| Check | Before | After |
|---|---|---|
| `botAccessControl.contentSignals` | fail | **pass** |
| `discoverability.linkHeaders` | fail | **pass** |

Current tally: **5 pass, 11 fail, 6 neutral.**

### Why `markdownNegotiation` still fails — and what it would take

The 213 Markdown twins are live and serving. The check still fails, and its own evidence shows
why:

```
GET https://nexvert.online  (Accept: text/markdown)
-> 200, content-type: text/html; charset=UTF-8
-> negative: "Response content-type is text/html, not text/markdown"
```

It sends one `Accept: text/markdown` request to the homepage and requires the *response
content-type* to be `text/markdown`. **It never looks for `.md` files.** So the twins cannot
satisfy it, by the design of the check rather than any flaw in them.

Only two things would pass it:

1. **Cloudflare Markdown for Agents** — dashboard → zone → AI Crawl Control → enable. Needs a
   Pro or Business plan, free within them, zero code. This is the sane option.
2. A Netlify edge function converting HTML on the fly — runtime cost on every request, already
   rejected in §10 for that reason.

Worth keeping straight: passing this check serves **coding agents** (Claude Code, Cursor), which
is a different audience from the `.md` files, which serve the **training crawlers** that
measurably fetch them. They are complementary, not alternatives. Enable the Cloudflare toggle if
you are on Pro; do not build the edge function.

### The 11 remaining failures, honestly sorted

| Count | Category | Action |
|---|---|---|
| 1 | `markdownNegotiation` | one Cloudflare toggle, if on Pro |
| 4 | `apiCatalog`, `oauthDiscovery`, `oauthProtectedResource`, `authMd` | **refuse** — would require publishing false metadata (§14, §15) |
| 6 | `dnsAid`, `ard`, `agentSkills`, `webMcp`, `mcpServerCard`, `a2aAgentCard` | nascent specs, or presuppose a server/agent this site does not have |

That is the end state. **5 pass / 11 fail is the correct score for this site**, and the scanner
has no way to express "not applicable".

---

## 17. Agent Skills — implemented, and why this one differs

Unlike `api-catalog`, the OAuth documents and `a2a-agent-card`, this standard **fits a static
site**. An Agent Skill is a `SKILL.md` instruction document an agent loads when a task matches
its description — no server, no auth, no endpoint. Publishing it requires nothing Nexvert lacks,
so it passes the test in §15: *it describes something true*.

### What is published

Six skills at `/.well-known/agent-skills/`, with an index at `index.json`
(`$schema` = `https://schemas.agentskills.io/discovery/0.2.0/schema.json`):

| Skill | Covers |
|---|---|
| `convert-image-formats` | choosing between JPG/PNG/WEBP/AVIF/HEIC/SVG, and the conversions that lose data |
| `compress-and-resize-images` | resize-then-compress, quality targets, hitting upload limits |
| `strip-image-metadata` | EXIF/GPS removal, what platforms do and do not strip, redaction caveats |
| `work-with-pdf-files` | merge, split, extract, rotate, crop, watermark, flatten |
| `convert-audio-and-video` | container vs codec, lossless trimming, GIF size traps |
| `convert-structured-data` | JSON/CSV/XML/YAML conversion, nesting and CSV encoding problems |

Generated at build time by `scripts/generate-agent-skills.cjs`, with each entry's SHA-256
digest computed from the bytes actually served. Verified: 6/6 digests match.

### The honesty rules these follow

A `SKILL.md` is loaded straight into an agent's context, so a wrong one wastes a real person's
time. Each skill therefore:

1. **Carries genuine domain knowledge**, not an advert. If the guidance would be useless without
   the Nexvert link, it does not belong in a skill.
2. **States plainly that there is no API** — the tools are interactive pages, so an agent is told
   to direct a human or drive a browser, never to POST a file and wait.
3. **Claims only what the site actually does.**

Point 3 caught two real errors during implementation, both of which would have shipped
misinformation into agent context:

- Four of the tool URLs I first wrote were **404s** (`/heic-to-jpg/`, `/image-converter/`,
  `/compress-image/`, `/compress-pdf/`). Every referenced path is now checked against
  `sitemap.xml` — currently 26 referenced, 0 broken.
- The PDF skill originally described **compressing PDFs**. Nexvert has no PDF compressor. That
  section now explains why PDFs get large and says so explicitly, rather than implying a tool
  that does not exist.

**Re-run the link check whenever a skill is edited.** A dead link in a skill is worse than a
dead link on a page, because nobody sees it fail.

### Expectation setting

Same caveat as llms.txt: this is a **draft v0.2.0, single-vendor RFC**, and there is no
published evidence yet of agents consuming these at scale. It is cheap, auto-generated and
honest, so it is worth having — but it is an option on a standard that may or may not take hold,
not a mechanism that will move rankings or citations.

---

## 18. WebMCP — implemented, with the ranking actually tested

WebMCP exposes page capabilities to an AI agent running **in the browser**. Like Agent Skills
and unlike an MCP Server Card, it needs no server — the tool runs in the page, which is exactly
where Nexvert's work already happens. So it passes the §15 test and is implemented.

### Correction to the published guidance

The audit text says to call `navigator.modelContext.registerTool()`. The current spec
(W3C Community Group Draft) defines it on **`Document`**:

```
partial interface Document {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
}
```

`navigator.modelContext` appears **zero** times in the spec; `document.modelContext` appears 16.
`src/webmcp.ts` probes `document` first and falls back to `navigator`, since Chrome's early
preview used the older placement.

### What is exposed, and what deliberately is not

One tool: **`find_nexvert_tool`** — searches the ~190-tool catalogue and returns matching tools
with URLs, formats and size limits.

The conversions themselves are **not** registered. They need a real file chosen by a human in a
file input; a tool accepting a path or URL would fail in ways the agent could not see. The
response states plainly that these are pages, not endpoints.

### The ranking needed four rounds of fixing

The first implementation was embarrassing, and only testing against the real catalogue showed it:

| Query | First attempt | Now |
|---|---|---|
| `merge PDFs` | **Audio Joiner** | Free PDF Merger |
| `remove gps from photo` | **Colour Picker** | Remove EXIF Metadata |
| `make a video smaller` | **GIF Maker** | Free Video Compressor |
| `pdf to word` | **DOCX→PDF** (reverse!) | warns the conversion is unsupported |

What fixed it:

1. **Field weighting** — a format token is near-decisive, the title is strong, the description is
   weak. Naive word-matching over one concatenated string ranked coincidences first.
2. **Coverage penalty** — matching 1 of 4 query words is usually a coincidence, so the score is
   multiplied by the matched fraction.
3. **Literal over synonym** — the user's own word outweighs a mapped one. Without this, "EXIF
   Metadata *Viewer*" tied with "*Remove* EXIF" for "remove gps from photo".
4. **Direction awareness with format aliases** — people say "pdf to word", not "pdf to docx", so
   `word→docx` etc. are mapped before checking input/output formats. Reverse converters are
   demoted, and when no tool supports the direction at all the response carries an explicit
   `warning` telling the agent not to present the near-matches as if they work.

**If you add tools or change titles, re-run this check.** A plausible-but-wrong answer inside an
agent's context is worse than no answer, because nobody sees it fail.

### Expectation setting

W3C **Community Group Draft** behind a Chrome origin trial — `modelContext` is absent in
virtually every browser today. The module is feature-detected and dynamically imported, so the
catalogue it reads never enters the critical path for an ordinary visitor, and the page is
unaffected where the API does not exist. Worth having, cheap, honest — but speculative.

---

## 19. DNS-AID — not implemented (no agent endpoint to point at)

DNS-AID publishes `SVCB`/`HTTPS` records under an `_agents` namespace so agents can find your
**agent endpoints** through DNS. The suggested record is:

```dns
_a2a._agents.nexvert.online. 3600 IN SVCB 1 agent.nexvert.online. alpn="a2a" port=443
```

That advertises `agent.nexvert.online` as a live A2A endpoint. Verified over DoH against the
same resolver the scanner uses:

| Name | Result |
|---|---|
| `_index._agents.nexvert.online` | NXDOMAIN |
| `_a2a._agents.nexvert.online` | NXDOMAIN |
| `_mcp._agents.nexvert.online` | NXDOMAIN |
| `agent.nexvert.online` | NXDOMAIN |
| `nexvert.online` (control) | resolves, 2 answers |

The control proves the method works — those names genuinely do not exist, because there is no
agent to host. Publishing the record would point resolvers at a hostname that does not resolve,
for a protocol nothing here speaks. Same category as §14 (`api-catalog`) and the A2A and MCP
cards: it advertises a service that is not there.

It is also DNS configuration rather than anything in this repo — it would live in Cloudflare's
DNS panel, not in a build.

### How this differs from the two that were implemented

The line has been consistent throughout:

| Standard | What it publishes | Needs a running service? | Verdict |
|---|---|---|---|
| Agent Skills (§17) | static `SKILL.md` documents | no | **implemented** |
| WebMCP (§18) | a tool registered in the page | no | **implemented** |
| DNS-AID | a DNS pointer to an agent endpoint | **yes** | refused |
| MCP Server Card | a pointer to an MCP endpoint | **yes** | refused |
| A2A Agent Card | a pointer to an agent service | **yes** | refused |
| api-catalog, OAuth, auth.md | pointers to APIs and auth servers | **yes** | refused |

If Nexvert ever gains a real agent endpoint, DNS-AID becomes trivial *and true*. Until then it
is a record pointing at nothing.

---

## 20. GitHub entity link — added, and the three settings that make it count

`SOCIAL_PROFILES` now contains the verified GitHub URLs, so `sameAs` is emitted on all 213 pages:

```
https://github.com/sagar007-mindset
https://github.com/sagar007-mindset/Nexvert2.0
```

Verified 2026-10-01 via the GitHub API: both public, not a fork, not archived, repo description
matches the site, last push 2026-09-30, and the owner account's display name is "Nexvert".

### The link currently only points one way

This is the part that decides whether the signal is worth anything. `sameAs` is a *claim* — "this
GitHub account is me". Search and answer engines corroborate it by checking the profile points
back. Right now nothing on GitHub mentions nexvert.online:

| Field | Current | Should be |
|---|---|---|
| Repo **Website** (`homepage`) | empty | `https://nexvert.online` |
| Profile **Website** (`blog`) | empty | `https://nexvert.online` |
| README | 2 lines, no mention of the site | links to the site, says what it is |

Those are three fields in the GitHub UI and take about two minutes. Until they are set, the
`sameAs` entries are an unverified assertion rather than a mutual link, and that is most of
their value.

### The repo content is a weak signal

The repository currently holds **`README.md` (2 lines) and `nexvert-netlify-fixed-v6.zip`**.

A zip and a two-line README does not read as a real project to a human evaluating whether
Nexvert is legitimate, and the same is true of a model doing entity resolution. Two options,
either of which is a large improvement:

1. **Push the actual source.** It is already a clean, self-contained Vite project, and a public
   repo is strong corroboration for a privacy-first tool — people can check the "nothing is
   uploaded" claim is true. That claim is the whole product, and a verifiable one is worth more
   than a stated one.
2. **If you would rather not open-source it**, replace the zip with a proper README: what Nexvert
   is, the browser-based architecture, the tool categories, and a link to the site. A deliberate
   landing README beats a stray build artefact.

Shipping a `.zip` of the site to a public repo also has a practical risk worth noting: build
artefacts can carry things you did not mean to publish. Worth a look before leaving it there.

### Identity — now resolved

`SITE_OPERATOR.name` is set to **Ayaan**, with the Organization remaining **Nexvert**. The
schema now models this correctly: Nexvert is the Organization, Ayaan is its `founder`.

```json
"name": "Nexvert",
"founder": { "@type": "Person", "name": "Ayaan" },
"sameAs": ["https://github.com/sagar007-mindset", "https://github.com/sagar007-mindset/Nexvert2.0"]
```

The About page was updated to match, because **schema without visible corroboration is a weak
signal** — Google and answer engines read the page itself to judge whether a site is a real
operation. It also replaced a claim that was not true: the page previously said Nexvert was
"maintained by open-source software enthusiasts", plural, implying a team that does not exist.

Two optional strengtheners, both your call:

- **A surname.** "Ayaan" alone is hard for an engine to resolve to one specific person; a full
  name is a markedly stronger entity signal.
- **A country code** in `SITE_OPERATOR.country` (e.g. `'PK'`), which adds `address.addressCountry`
  to the Organization. Omitted while blank, so nothing breaks without it.

---

## 21. The three remaining items — status and what is blocked

### 1. Deploy — blocked on you

This working copy is **not a git repository** and there is no `gh` CLI or GitHub credential
available here, so nothing can be pushed or deployed from this session. Deploying is yours.

### 2. GitHub fields — mostly blocked, but less work than it looked

The README is **already written**. `README.md` in this project is 55 lines and already opens
with `Free online file converter — https://nexvert.online`, describes the browser-based
architecture, and documents the build. It simply never reached GitHub, which currently holds a
two-line README plus `nexvert-netlify-fixed-v6.zip`.

So there is nothing to draft. Either:

- **push the source**, and this README becomes the GitHub one automatically, or
- **copy its contents** into the GitHub README editor if you would rather not publish the source.

The two remaining fields cannot be set from here — they need GitHub write access:

| Where | Field | Set to |
|---|---|---|
| Repo → About (gear icon) | Website | `https://nexvert.online` |
| github.com/settings/profile | Website | `https://nexvert.online` |

Those two fields are what turn `sameAs` from a one-way claim into a mutual link, which is where
its value is. About two minutes.

### 3. Comparison content — done for iLovePDF

`/guides/nexvert-vs-ilovepdf/` — 1,170 words, 7 sections, 5 FAQs, architecture-led as chosen.

**Accuracy approach.** Every claim about iLovePDF is drawn from its own published privacy policy
(February 2026 revision), read directly rather than from secondary sources: that it operates as a
data processor under GDPR from Barcelona, deletes uploaded content within two hours of
processing, does not use customer content to train AI models, has an appointed DPO, and uses
standard contractual clauses for transfers outside the EEA.

**The page is deliberately generous to iLovePDF.** It states plainly that iLovePDF is the better
choice for large files, high-fidelity PDF-to-Word, desktop and mobile apps, API access and older
devices — six cases, listed in their own section rather than buried. It also carries a closing
note disclosing that Nexvert publishes the page.

That is not politeness. A comparison that reads as fair is the kind answer engines quote; one
that reads as marketing gets discounted, and one caught overstating does real damage. The
framing — *"iLovePDF promises to delete your file; Nexvert has nothing to delete"* — is the
honest version of the difference and does not require disparaging anyone.

**Maintenance:** the page avoids pricing and task limits by design, so it should not go stale.
The one dated claim is the two-hour deletion window, attributed and dated in the text.

### Two pre-existing bugs the new guide exposed

Adding the comparison page surfaced two defects that had been silently affecting **all** guides,
not just the new one. Both are now fixed.

**1. No guide produced FAQPage schema.** Every guide in `GUIDES_DATA` carries FAQs, and they
were rendered visibly on the page — but none reached the JSON-LD. The cause: `getPageContent()`
returns `null` for any `guides/` path by design (guides render their own components), and the
schema builder was fed `content?.faqs`, which was therefore always undefined. Ten guides had
been publishing FAQ content with no corresponding markup.

Fixed by resolving a guide's FAQs inside `buildPageSchemas` from `GUIDES_DATA`, the same pattern
already used for `datePublished`. Resolving it centrally rather than at the call sites matters:
guides render through a generic `SEOHead` that carries no per-guide data, so a fix applied only
in `prerender.js` would have been undone the moment the client hydrated and replaced the schema.

**2. `llms-full.txt` omitted every guide.** The generator used the same `getPageContent()`, so
all ten guides — the longest-form, most quotable content on the site — were missing from the
export built specifically for answer engines. It contained 193 tool pages and zero guides.

Fixed by reading guides from `GUIDES_DATA` directly, including their sections, bullets,
publication date and FAQs.

**Worth noting as a pattern:** both bugs came from a single helper returning `null` for a whole
class of pages, and neither was visible on the page itself — the FAQs rendered fine, the guides
looked complete. They only showed up when something was checked against the *built output*
rather than the source. The verification habit found them; reading the code would not have.

### A third find: an orphaned guide, and a content-quality problem

**`pdf-vs-jpg` was written but never published.** It existed in `GUIDES_DATA` with a full article
and an FAQ, but had no entry in `PUBLIC_ROUTES` — so it was never routed, never pre-rendered,
never in the sitemap, and invisible to everyone. Now published.

Guide routes are added to `PUBLIC_ROUTES` by hand, which is how this happened. Worth a glance
whenever a guide is added; the build does not currently catch the mismatch.

**The more useful finding is the word counts:**

| Guide | Words | FAQs |
|---|---|---|
| nexvert-vs-ilovepdf (new) | 914 | 5 |
| heic-vs-jpg | 280 | 2 |
| png-to-webp-speed | 155 | 1 |
| how-to-convert-files-on-android | 131 | 1 |
| pdf-vs-jpg | 118 | 1 |
| how-to-convert-files-on-iphone | 118 | 1 |
| client-side-privacy | 116 | **0** |
| how-to-convert-jpg-to-pdf | 112 | 1 |
| jpg-vs-png | 112 | 1 |
| how-to-convert-png-to-jpg | 102 | 1 |
| how-to-convert-pdf-without-installing-software | 101 | 1 |

Nine of eleven guides are **under 160 words**. These are the pages meant to earn citations and
rank for informational queries, and at ~110 words they cannot do either — there is not enough
substance for an answer engine to quote or for Google to treat as a useful result. They are
closer to stub pages than articles.

`client-side-privacy` is the one to fix first: the privacy argument *is* Nexvert's entire
differentiator, and the page making it is 116 words with no FAQs. It should be the strongest
page on the site.

This matters more than any remaining scanner check. Expanding these to 600-900 words each, in
the style of the comparison page, would do more for citations than every `.well-known` file
combined.

### A false positive in the lastmod guard, fixed

The guard added in §12 fired on a build where nothing was wrong: content had been edited today
and `SITE_LAST_UPDATED` already read today's date. There was nothing to bump.

Left alone it would have warned on **every** subsequent build of the same day — and a warning
that fires when nothing is wrong is worse than no warning, because it trains everyone to skip
reading them. The guard now warns only when the stamped date is genuinely in the past:

```ts
SITE_LAST_UPDATED < today
```

Verified both ways: silent when the date is current, and still fires when the date is actually
stale.

---

## 22. OAI-AdsBot — added from OpenAI's own current crawler docs

The user pasted OpenAI's live crawler documentation page. Checked against it directly:

| OpenAI agent | Purpose | Was it declared? |
|---|---|---|
| `OAI-SearchBot` | ChatGPT search indexing | yes |
| `GPTBot` | model training | yes |
| `ChatGPT-User` | user-initiated fetch | yes |
| `OAI-AdsBot` | validates landing pages submitted as ChatGPT ads | **no — now added** |

`OAI-AdsBot` is a genuine gap, but a different kind from `Claude-SearchBot` (§13): Nexvert does
not currently run ChatGPT ads (no ad-conversion tracking anywhere in the codebase, and GA4's
`ad_storage` defaults to `denied`), so this entry is a **no-op today**. It only does anything if
an ad pointing at nexvert.online is ever submitted to ChatGPT, at which point OpenAI crawls the
landing page to check it against their ad policies.

Worth being precise about why this was added when the OAuth/API endpoints were refused: those
would have **asserted infrastructure that doesn't exist** — an authorization server, a
registration endpoint. A robots.txt entry asserts nothing of the kind; it only states a policy
for an agent *if* it ever visits. Allowing a crawler that currently has nothing to crawl carries
no false claim, so there is no honesty problem here, unlike the fabricated-metadata refusals.

Now 34 user-agent groups, 34 Content-Signal lines. Verified: `npm run seo:audit` passes with the
new routes/converters counts logged (220 routes, 192 converter configs, 215 indexable pages).

Two details from OpenAI's docs that need no action: they add a `robots.txt` marker to their own
user-agent string specifically when fetching this file (for log disambiguation on their side,
not ours), and they publish their crawler IP ranges at `openai.com/*.json` for anyone who wants
to verify traffic at the network level rather than trusting the User-Agent header alone.

---

## 23. Netlify → Vercel migration

`vercel.json` now mirrors `netlify.toml`: **18 redirects, 2 rewrites, 14 header rules** (the two
`/*` Netlify blocks are merged into one, since Vercel takes a list of headers per source).

`netlify.toml` is intentionally left in place — it is inert on Vercel and lets you roll back.

### Three things that do not port, and what was done about each

**1. The contact form was broken by the move — now fixed.**

`TrustPage.tsx` used Netlify Forms (`data-netlify="true"`) and POSTed to `/`, which Netlify
intercepted and stored. Vercel has no equivalent. The dangerous part was the failure mode: a
static host answering that POST with a 200 would make the form show **"Message sent"** for a
message nobody receives — silent data loss, which is worse than a visible error.

Now driven by `CONTACT_FORM_ENDPOINT` in `site.config.ts`:

- **Empty (current default)** — the form opens the visitor's email client with the message
  pre-filled, addressed to `support@nexvert.online`. Not elegant, but it cannot lose a message.
- **Set to a backend** (Formspree, Web3Forms, or your own `/api/contact` function) — the original
  POST-and-confirm flow returns.

The Netlify-only attributes were removed, since they are inert on Vercel and misleading to leave.

**2. The IndexNow build plugin.** `netlify/plugins/indexnow` used the `onSuccess` hook, which
Vercel has no equivalent for. Ported to `scripts/indexnow-submit.js`, runnable as
`npm run indexnow`.

One behavioural difference worth knowing: the plugin fired *after* the deploy was live. Run from
a build step it fires *before*. That is usually fine — IndexNow is a "please recrawl" notice and
the crawler arrives later — but for the old guarantee, run it from a post-deploy GitHub Action
instead. It skips automatically unless `VERCEL_ENV=production`.

**3. Trailing slashes.** Every canonical URL on this site ends in `/`, so `vercel.json` sets
`"trailingSlash": true`. Getting this wrong would break all 215 canonicals at once. A redirect
for `/:path*/index.html` was also added, mirroring Netlify's `/index.html` rule, so the raw
`index.html` of each route cannot be indexed as a duplicate.

### Verify after the first Vercel deploy

Routing cannot be tested locally, so check these on a preview URL before switching DNS:

```bash
curl -sI https://<preview>/pdf-merge/        # 200
curl -sI https://<preview>/pdf-merge         # 308 -> /pdf-merge/
curl -sI https://<preview>/pdf-merge/index.html   # 301 -> /pdf-merge/
curl -sI https://<preview>/ocr/              # 301 -> /image-to-text/
curl -sI https://<preview>/pdf-merge.md      # 200, text/markdown
curl -sI https://<preview>/robots.txt        # 200, text/plain
curl -sI https://<preview>/nope-not-a-page/  # 404 (not 200 — a soft 404 would be worse)
```

The last one matters most: Netlify served `dist/404.html` with a real 404 automatically. Vercel
should do the same for a static output, but confirm it rather than assume — a soft 404 returning
200 would let Google index unlimited junk URLs.

---

## 24. GitHub entity link switched to Nexvert2.0

`sameAs` and the visible footer/About links now point at
**`https://github.com/sagar007-mindset/Nexvert2.0`**, replacing the older
`sagar007-mindset/Nexvert`.

Both repos exist, which is easy to trip over:

| Repo | Contents | Deploys? |
|---|---|---|
| `Nexvert` | a zip and a one-line README | no |
| `Nexvert2.0` | the actual source | yes, to Vercel from `main` |

Linking the repo that genuinely holds the source is the more defensible entity signal — anyone
following the link can verify the "nothing is uploaded" claim by reading the code, which is the
entire point of corroborating an entity rather than merely asserting it.

Only `src/config/site.config.ts` changed: `SOCIAL_PROFILES` (the `sameAs` array) and
`SOCIAL_LINKS.github` (the visible links). The footer, the About page and the pre-render
fallback all read from those, so one edit propagates everywhere.

The owner profile URL `https://github.com/sagar007-mindset` is unchanged — it still resolves to
the same account and remains a valid second corroboration.

**Still outstanding:** `Nexvert2.0` has no **Website** field set. The old repo did, which is what
made that link mutual. Until it is set on the new repo, `sameAs` points at a repo that does not
point back — set it to `https://nexvert.online` in the repo's About panel.
