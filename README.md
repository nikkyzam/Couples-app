# Kindle 🔥

A private, playful space that helps couples — especially reserved ones — open up
and explore intimacy **gently, at their own pace**. Everything is built around
consent, communication, and comfort: nothing is ever pushed on you.

Built as a **mobile-first PWA** (React + TypeScript + Vite + Tailwind). All data
stays **on your device** — nothing is uploaded to a server.

## What's inside

- **Onboarding** — each partner gets their own profile (name + avatar), you set a
  shared **comfort ceiling** (Level 1 Cozy → Level 5 Adventurous) and a **safe word**.
- **Spice-level progression** — content unlocks gradually as you play together, and
  never rises above the comfort ceiling you chose. Raise or lower it anytime.
- **Games**
  - **Truth or Dare** — take turns; pass anytime.
  - **Would You Rather** — point at the same time, discover what you both like.
  - **Desire Deck** — draw a random card from the whole deck.
  - **Yes / No / Maybe** — vote privately; only your *mutual yeses* are ever revealed
    (your "no"s are never shown to your partner). This is the safe, pressure-free way
    to discover shared interests — including toys like vibrators and dildos.
- **Toy Explorer** — friendly, judgment-free intros to toys & props, always leading
  with body-safety and communication. Higher-level toys unlock as you progress.
- **Love Notes** — each partner has an inbox; leave sweet, flirty, or bold notes for
  each other. Switch profiles with the button in the top-right.
- **The Climax Guide** — a warm, communication-first playbook focused on her pleasure
  and finishing feeling amazing.
- **Safe word bar** — on every game screen, either partner can tap to pause instantly.

## Run it locally

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # production build into dist/
npm run preview    # preview the production build
```

Open it on your phone's browser and use **"Add to Home Screen"** — it installs like a
real app (custom icon, full-screen, works offline) thanks to the PWA manifest and
service worker.

## Regenerating the app icon

```bash
node scripts/gen-icons.mjs   # writes public/icon-192.png and public/icon-512.png
```

## Getting it onto the App Store & Google Play

The app installs to any phone **today** as a PWA (Add to Home Screen) — no store
review needed. To publish native builds in the stores, wrap this web app with
[Capacitor](https://capacitorjs.com):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init Kindle app.kindle.couples --web-dir=dist
npm run build
npx cap add ios && npx cap add android
npx cap sync
npx cap open ios       # opens Xcode (needs a Mac + Apple Developer account, $99/yr)
npx cap open android   # opens Android Studio (needs a Google Play account, $25 once)
```

Store submission also requires: developer accounts, app signing, screenshots, a
privacy policy, and passing each store's review (Apple/Google both allow tasteful
"lifestyle" apps but enforce age-gating and content rules). That review is
days-to-weeks and can't be automated from here — the code side, though, is ready.

## Roadmap / next steps

- **Real cross-device accounts + note sync** (so partners on separate phones share an
  inbox) — this needs a backend. A drop-in option is Supabase auth + a `notes` table;
  the current local store is structured to make that swap straightforward.
- Age-gate on first launch and a privacy policy page (required for store submission).

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · PWA (service worker +
web manifest). State lives in a small reducer store persisted to `localStorage`.
