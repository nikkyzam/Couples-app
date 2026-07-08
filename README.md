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
  - **Love Dice** — roll three slot-machine reels — an *action*, a *spot*, and a
    *how/how-long* — that combine into one playful instruction ("Kiss their neck,
    slowly."). Every face is capped at your comfort ceiling, the guided voice can
    read the result aloud, and you can always pass.
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
  each other. Switch profiles with the button in the top-right. In synced mode you can
  opt into a **gentle notification** when your partner leaves you a note (Settings →
  Notifications) — it only tells you a note *arrived*, never the words, so nothing
  steamy lands on your lock screen. On iPhone, add Kindle to your Home Screen first;
  web notifications only fire once it's installed.
- **The Climax Guide** — a warm, communication-first playbook focused on her pleasure
  and finishing feeling amazing.
- **Planner** — plan your time together and follow the rhythm of the month. A shared
  **schedule** lets either partner put date nights and intimate plans on the calendar
  (with an optional time, a note, and quick idea chips), tick them off, and keep a
  history. An optional **cycle tracker** for whichever partner menstruates turns three
  numbers (last period start, cycle length, period length) into a live read on the
  current **phase**, **cycle day**, **next-period countdown**, and an estimated
  **fertile window** — with a one-tap "period started today". In synced mode both the
  schedule and cycle are **shared between phones**. Cycle predictions are estimates for
  awareness and planning — **not** a form of contraception — and stay private to your space.
- **Gifts (Treat Yourselves)** — a curated catalog of intimate gift ideas across toys,
  lingerie, sensory extras, experiences, and romance. Either partner **hearts** the ones
  they want into a **shared list** (synced between phones), and **Shop** opens a neutral
  product search in the browser — purchases happen on that store, never inside Kindle,
  and the saved list stays private to your space.
- **Safe word bar** — on every game screen, either partner can tap to pause instantly.
- **App lock** — optionally require a 4-digit PIN to open Kindle on this device
  (Settings → App lock). It re-locks after ~2 minutes in the background, and
  guards the whole app before anything else loads or initializes — nothing in the
  app is reachable without the PIN once it's set. "Forgot your PIN?" on the lock
  screen offers a confirmed local reset (cloud-mode accounts are unaffected; it
  only clears this device).

## Front-door passphrase (gating a public URL)

GitHub Pages URLs are public — anyone with the link can open the app. If you'd
rather strangers who stumble on it not even reach onboarding or sign-up, set a
single shared passphrase that gates the entire app before anything loads.

This is a separate, outer layer from **App lock** above: App lock is a per-device
PIN for whoever already has access; this passphrase is the front door itself. Same
honest caveat as App lock — it's a static site, so it's a doorbell, not a vault. A
real passphrase (not "1234") comfortably keeps out casual visitors; it isn't meant
to withstand a determined attacker inspecting the bundle.

1. Generate the SHA-256 hash of your passphrase (the app stores the hash, never
   the plaintext):
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "your passphrase here"
   ```
2. Set it as `VITE_SITE_PASSPHRASE_HASH` in `.env.local` (local dev) **and** as a
   GitHub **repository secret** of the same name (Settings → Secrets and variables
   → Actions) so the deployed build includes it. Push/redeploy.
3. Leave it unset and the gate simply doesn't appear — nothing else changes.

Once someone enters it correctly on a device, that device stays unlocked (it isn't
asked again, unlike App lock's re-lock timer) — share the passphrase with your
partner once, each installs it on their own phone.

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
5. **Point confirmation emails at your real site** (otherwise the link goes to
   `localhost`). In Supabase → **Authentication → URL Configuration**:
   - Set **Site URL** to where the app actually lives — your deployed URL for
     production (e.g. `https://YOUR-USERNAME.github.io/Couples-app/`), or
     `http://localhost:5173/` while developing locally.
   - Under **Redirect URLs**, add every origin people sign up from — e.g.
     `https://YOUR-USERNAME.github.io/Couples-app/` **and** `http://localhost:5173/`.
   The app already asks Supabase to send users back to whatever site they signed
   up on (`emailRedirectTo`), but Supabase only honours URLs on this allowlist —
   anything else silently falls back to **Site URL**, which is why an unconfigured
   project mails a `localhost` link. (Prefer no email step at all for testing? Turn
   off confirmation under **Authentication → Providers → Email**.)
6. `npm run build && npm run preview` (or `npm run dev`). The app now boots into the
   sign-up screen instead of local mode.

**How linking works:** one partner signs up → **Create a space** → gets a 6-character
invite code. The other partner signs up on their phone → **Join with a code** → enters
it. From then on both share the same synced space. (By default Supabase requires email
confirmation on sign-up; you can turn that off in **Authentication → Providers → Email**
for faster testing, or switch to magic-link auth.)

**Joined the wrong space?** Under **Settings → Your invite code** there's a
**"Leave and join another"** option: it removes you from your current space and drops
you back on the create / join screen so you can enter a different code. If you were the
last member, that space (and its notes) is cleaned up automatically.

Row-level security ensures a couple can only ever read/write their own space's data.

## Background push (notifications when the app is closed)

By default, the new-note notification only fires while Kindle is open or recently
backgrounded (it's generated on-device from the live sync). To have a note buzz your
partner's phone **even when the app is fully closed**, turn on Web Push. It's optional —
skip this and everything else still works.

**One-time setup:**

1. **Generate a VAPID keypair** (once):
   ```bash
   npx web-push generate-vapid-keys
   ```
   Note the **Public Key** and **Private Key**.

2. **Ship the public key to the app.** Add it as `VITE_VAPID_PUBLIC_KEY` — in
   `.env.local` for local dev, **and** as a GitHub **repository secret** (Settings →
   Secrets and variables → Actions) so the deployed site includes it. Rebuild/redeploy.
   (The public key is safe to expose; the private key never leaves the server.)

3. **Apply the schema** (adds the `push_subscriptions` table) — re-run
   [`supabase/schema.sql`](supabase/schema.sql) or `npm run db:push`.

4. **Deploy the Edge Function** that sends the pushes:
   ```bash
   supabase functions deploy push-on-note --no-verify-jwt
   ```
   Then set its secrets (the `SUPABASE_*` ones are injected automatically):
   ```bash
   supabase secrets set \
     VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... \
     VAPID_SUBJECT=mailto:you@example.com \
     WEBHOOK_SECRET=$(openssl rand -hex 16)
   ```
   Keep that `WEBHOOK_SECRET` value handy for the next step.

5. **Fire it on new notes** with a Database Webhook: Supabase → **Database → Webhooks →
   Create** → table `notes`, event **Insert**, type **HTTP Request**, URL =
   your function's URL (`https://<project-ref>.functions.supabase.co/push-on-note`),
   and add an HTTP header `x-webhook-secret` set to the `WEBHOOK_SECRET` from step 4.

That's it. When someone sends a note, the function looks up the *other* partner's
device subscriptions and delivers a push — the words stay hidden, it just says a note
arrived. Dead subscriptions are pruned automatically. **On iPhone the recipient must
have added Kindle to their Home Screen** (iOS only allows web push for installed PWAs),
and turned Notifications on under **Settings → Notifications** (which is what registers
their device).

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
