# magick-pwa — agent notes

Installable web app companion to the `magick` CLI. See [`README.md`](README.md) for user-facing docs.

## Sibling project

There's a Python CLI sibling at `~/magick/` (same author, separate repo). It does the same ritual from the terminal and logs to `~/.magick/logofcasts`. The PWA and CLI are **independent**: separate repos, separate data stores, no sync. If you're asked to "look at magick," check whether the user means the CLI or this PWA.

## Shared invariant (loose coupling)

The PWA's IndexedDB record shape mirrors the CLI's log line format **on purpose**, so a future export-to-`logofcasts` feature stays trivial:

- **Timestamp:** `YYYY-MM-DDTHH:MM:SSZ` (second-precision UTC, ISO 8601).
- **Record:** `{ timestamp, intent }` → maps to `"{timestamp} | {intent}\n"`.
- **Confirmation string:** verbatim `the spell is cast for "X". Godspeed.` (same as CLI's `perform_cast`).

If you change any of these, that compatibility goes away. The CLI doesn't import this — they're parallel implementations of the same shape.

## Stack & deploy

- Vanilla HTML/CSS/JS, no build step.
- Storage: IndexedDB (object store `casts`, keyPath `id` autoIncrement).
- Hosted: GitHub Pages at <https://andysebastian.github.io/magick-pwa/>.
- Local dev: `python3 -m http.server 8000`.

## Things to be careful with

- Service worker needs HTTPS or `localhost` — `file://` won't register it.
- `apple-touch-icon` (180×180) is a separate file from the manifest icons; iOS reads that one, not the manifest, for home-screen install.
- Don't switch the timestamp to millisecond precision (`new Date().toISOString()` raw) without also changing the CLI — it breaks the shared invariant above.
