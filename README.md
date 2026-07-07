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
  - **Whisper** — a gentle *dirty-talk coach for the hesitant partner*. It hands you
    one small, sayable line at a time on a **boldness dial** (capped at your comfort
    ceiling), and gives shy people every out: **hear it first** in the guided voice
    and just repeat it, tap **"softer"** to dial a line down, use **fill-in-the-blank**
    starters when a blank page is scarier than finishing a sentence, or — if saying it
    out loud is still too much — **send it as a private note** instead. A personal,
    on-device **confidence meter** turns every attempt into a little win, so talking
    dirty gets easier one whisper at a time.
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
  empty). In synced mode the toy box and shopping list are **shared between both
  phones**. A **"To buy" tab** suggests toys to add — ranking the ones the couple
  *both* said yes to (in Yes/No/Maybe) first — and keeps a shared shopping list.
- **Love Notes** — each partner has an inbox; leave sweet, flirty, or bold notes for
  each other. Switch profiles with the button in the top-right.
- **The Climax Guide** — a warm, communication-first playbook focused on her pleasure
  and finishing feeling amazing.
- **Safe word bar** — on every game screen, either partner can tap to pause instantly.
- **App lock** — optionally require a 4-digit PIN to open Kindle on this device
  (Settings → App lock). It re-locks after ~2 minutes in the background, and
  guards the whole app before anything else loads or initializes — nothing in the
  app is reachable without the PIN once it's set. "Forgot your PIN?" on the lock
  screen offers a confirmed local reset (cloud-mode accounts are unaffected; it
  only clears this device).

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

## Live deployment (GitHub Pages)

Every push to `claude/couples-intimacy-games-app-gbzfzo` auto-builds and deploys via
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) to:

**https://<your-github-username>.github.io/Couples-app/**

**One-time setup** (do this once in the repo, on GitHub.com): **Settings → Pages →
Build and deployment → Source → select "GitHub Actions"**. After that, every push
deploys automatically — check progress under the repo's **Actions** tab.

Open the URL on each phone → **Add to Home Screen** to install it. To enable
cross-device sync on the deployed site too, add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as **repository secrets** (Settings → Secrets and variables →
Actions) — leave them unset and the deployed app runs in local-only mode.

## Regenerating the app icon

```bash
node scripts/gen-icons.mjs   # writes public/icon-192.png and public/icon-512.png
```

## Turning on cross-device sync (Supabase)

This lets each partner install on their **own phone** with their **own account** and
have notes + votes sync live. One-time setup (~5 min):

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and the **anon / publishable
   key**.
3. Copy `.env.example` to `.env.local` and paste them in:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...        # (or eyJhbGciOi... on older projects)
   ```
4. Apply the database schema. **Automatic (recommended):** also set `SUPABASE_DB_URL`
   in `.env.local` to your database connection string (Supabase → **Connect** →
   **Session pooler**, with your DB password filled in). Then `npm run dev` /
   `npm run preview` runs [`scripts/db-push.mjs`](scripts/db-push.mjs) automatically,
   which applies [`supabase/schema.sql`](supabase/schema.sql) on startup (idempotent, so
   it's safe every time). You can also run it once with `npm run db:push`.
   **Manual alternative:** paste `supabase/schema.sql` into the Supabase **SQL Editor**
   and run it. (`SUPABASE_DB_URL` is a secret — it holds your DB password — but it is
   not prefixed with `VITE_`, so it never reaches the browser bundle.)
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
