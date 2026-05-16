# magick PWA

An installable web app version of the [magick](../magick) CLI. Same ritual, on your phone.

Two views:
- **cast** — type an intent, get the confirmation: *the spell is cast for "X". Godspeed.*
- **history** — every past cast, newest first, with timestamps.

**Chaining multiple intents:** separate them with semicolons, e.g. `do laundry; order food; meditate for 5 minutes`. Today they're recorded together as one entry — splitting them into separate history lines is a planned enhancement, but the convention is forward-compatible.

Casts are stored locally in IndexedDB on the device. No backend, no sync with the CLI's `~/.magick/logofcasts` file. The record format matches the CLI's line format (`ISO 8601 UTC | intent`) so a future export feature is straightforward.

## Running locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

The service worker only registers over HTTP(S) on `localhost` or a real domain — opening `index.html` via `file://` won't fully work.

## Deploying

The PWA needs HTTPS for the service worker and the iOS "Add to Home Screen" install flow.

### GitHub Pages
1. Push this folder to a public GitHub repo.
2. Repo Settings → Pages → Source: `main` / `(root)`.
3. App lives at `https://<user>.github.io/<repo>/`.

### Cloudflare Pages
1. Sign in at <https://pages.cloudflare.com>.
2. Drag-drop this folder, or connect the repo. Done.

## Installing on iPhone

1. Open the deployed URL in **Safari** (the iOS install flow doesn't work in Chrome).
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Launch from the home-screen icon — opens fullscreen, no Safari chrome.

## Files

- `index.html` — single page with two views and a tab bar.
- `app.js` — IndexedDB wrapper + view logic.
- `style.css` — dark, minimal, serif-leaning.
- `manifest.webmanifest` — PWA manifest.
- `sw.js` — cache-first service worker for offline use.
- `icons/` — home-screen icons.

## Updating

Edit → test locally (`python3 -m http.server 8000`) → `git push`. GitHub Pages rebuilds in 1–2 minutes; the URL stays the same.

**One non-obvious rule:** if you change any file in the `ASSETS` list inside `sw.js` (the html, css, js, manifest, or icons), bump `CACHE_VERSION` in the same commit:

```js
const CACHE_VERSION = 'magick-v1';  // → 'magick-v2', 'magick-v3', ...
```

Otherwise the installed PWA will keep serving the old cached copy.

On iPhone, "launch" means a **cold start**, not just resuming from the app switcher:

- Resuming a suspended app (tapping the icon while it's still in the switcher carousel) doesn't reload the page or re-check the service worker — you see exactly what you saw last time.
- A cold start happens when the app was swiped away in the switcher, or iOS killed it under memory pressure. Then tapping the icon does a fresh page load and the browser fetches `sw.js`.

To force a cold start: open the app switcher, swipe the magick card up to kill it, then tap the home-screen icon.

The new service worker installs on the first cold start after a deploy and takes effect on the next page load (`skipWaiting` + `clients.claim` in `sw.js` often collapses this to one launch, but iOS is conservative — plan on two cold starts). If it ever feels truly stuck: remove from home screen, reload in Safari, Add to Home Screen again.

**If you change the IndexedDB schema** (new field, new index — uncommon for additive changes to records), bump the version in `app.js`:

```js
indexedDB.open(DB_NAME, 1)  // → 2, 3, ...
```

…and handle the migration in `onupgradeneeded`. Purely additive record fields don't require this.
