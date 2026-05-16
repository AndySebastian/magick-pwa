# magick PWA

An installable web app version of the [magick](../magick) CLI. Same ritual, on your phone.

Two views:
- **cast** — type an intent, get the confirmation: *the spell is cast for "X". Godspeed.*
- **history** — every past cast, newest first, with timestamps.

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
