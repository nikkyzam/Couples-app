# Kindle 🔥

A private, playful space that helps couples — especially reserved ones — open up
and explore intimacy **gently, at their own pace**. Everything is built around
consent, communication, and comfort: nothing is ever pushed on you.

Built as a **mobile-first PWA** (React + TypeScript + Vite + Tailwind). It runs in
one of two modes:

- **Local mode (default)** — everything stays on the device. Two profiles share one
  phone; no account needed. This is the mode when no Supabase keys are configured.
- **Synced mode (optional)** — each partner makes their own account on their own
  phone, links to a shared "space" with an invite code, and **notes, votes, comfort
  level, and progress sync live between the two phones** via Supabase.

## What's inside

- **Onboarding** — each partner gets their own profile (name + avatar), you set a
  shared **comfort ceiling** (Level 1 Cozy → Level 5 Adventurous) and a **safe word**.
- **Spice-level progression** — content unlocks gradually as you play together, and
  never rises above the comfort ceiling you chose. Raise or lower it anytime.
- **Date Night** — a guided, candle-lit evening for two. It flows from setting the
  mood → a slow warm-up → *then* gently invites a toy in once you're already in the
  moment (never the headline, always opt-in) → exploring together → afterglow. This is
  how the app leads reserved couples to toys naturally rather than pushing them.
  A **guided voice** (on by default) narrates each step aloud in a soft, warm tone —
  it uses the browser's on-device speech engine (no network, works offline). Toggle it,
  pick a voice, and set the speed under **Settings → Guided voice**.
  At the start you choose **how long the evening should last** (15 / 30 / 45 / 60 min,
  or freeflow). Each step then shows a gentle, pausable suggested-time bar — when a
  step's time is up it simply turns green and the voice softly says "no rush," never
  forcing anyone forward.
- **Games**
  - **Truth or Dare** — take turns; pass anytime.
  - **Would You Rather** — point at the same time, discover what you both like.
  - **Desire Deck** — draw a random card from the whole deck.
  - **Yes / No / Maybe** — vote privately; only your *mutual yeses* are ever revealed
    (your "no"s are never shown to your partner). This is the safe, pressure-free way
    to discover shared interests — including toys like vibrators and dildos.
- **Toy Explorer** — friendly, judgment-free intros to toys & props, always leading
  with body-safety and communication. Higher-level toys unlock as you progress. Couples
  tap **"We have this"** to build **their toy box**, and Date Night then only ever
  suggests toys they actually own (falling back to all unlocked toys if the box is
  empty). The toy box is stored on the device.
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

## Turning on cross-device sync (Supabase)

This lets each partner install on their **own phone** with their **own account** and
have notes + votes sync live. One-time setup (~5 min):

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the tables,
   row-level-security policies, the create/join RPCs, and enables realtime.
3. In **Project Settings → API**, copy the **Project URL** and the **anon public key**.
4. Copy `.env.example` to `.env.local` and paste them in:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. `npm run build && npm run preview` (or `npm run dev`). The app now boots into the
   sign-up screen instead of local mode.

**How linking works:** one partner signs up → **Create a space** → gets a 6-character
invite code. The other partner signs up on their phone → **Join with a code** → enters
it. From then on both share the same synced space. (By default Supabase requires email
confirmation on sign-up; you can turn that off in **Authentication → Providers → Email**
for faster testing, or switch to magic-link auth.)

Row-level security ensures a couple can only ever read/write their own space's data.

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

- Age-gate on first launch and a privacy policy page (required for store submission).
- Push notifications when your partner leaves a note (Supabase + web push).
- Magic-link / passwordless auth as an alternative to email + password.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · PWA (service worker +
web manifest). State lives in a small reducer store persisted to `localStorage`.
