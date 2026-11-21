# ALKÉ Network App (app.alke.network)

The member app: onboarding, the daily mining session, allocation and history,
ALKE Hex and ALKE Rush, invitations, profile, notifications and settings.

Built with Vite + React. On phones each screen fills the display; on larger
screens the app sits in a phone-sized frame.

```
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## How the screens are made

Onboarding (`src/pages/onboarding/`: splash, welcome, how it works, sign up /
sign in, verify email, profile, rules, first session) is hand-built on the
onboarding kit in `src/ui/ob.jsx` + `ob.css`: every screen is a fixed top
bar, a scrolling content area and a pinned footer, so nothing overlaps on
short phones. In dev, `/__preview/<screen>` (welcome, how, signup, signin,
verify, profile, rules, first, first?started=1, problem, splash, loading)
shows any of them with a stand-in account.

The member screens (`src/pages/app/`: home, mine, allocation, history, games,
network, profile, notifications, settings) use the shell in `src/ui/shell.jsx`
(app bar, tab bar, stat tiles, list rows) on the same tokens. They preview at
`/__preview/home` etc.; add `?started=1` for a running session. The game
screens in `src/screens/` (Hex and Rush) are still generated from the design.


The game screens in `src/screens/` (ALKE Hex and ALKE Rush: hubs, play,
results) started as the design export: each keeps its game logic class, with
the hub and result layouts now built on the shell and the play screens laid
out as a top-to-bottom stack (the board scales down on short phones; see
`.gp-board` in `src/index.css`). Leaderboards for both games are
`src/pages/app/Leaderboard.jsx`. They preview at `/__preview/hexhub`,
`hexplay`, `rushhub`, `rushplay`, `rushbanked`, `rushlost`, `rushboard`.

## Accounts and data

ALKÉ members are Nuru people: the app uses Nuru's Firebase project
(`amid-7592b`) and the shared `nuru_people` listing.

- **Sign-in**: email + password (verified by email link), Google or Apple
  (`src/lib/account.js`). After Firebase sign-in, Nuru's `nuruAuth` function
  finds or creates the person and puts their Nuru ID on the session (`nid`).
- **Inside the Nuru app**: Nuru can hand over its session as a one-time token
  (`#nuru_token=` in the URL, or the `nuru_appSession` bridge request), so
  members never sign in twice.
- **First run** (`src/pages/onboarding/`): account → verify email → profile
  (username, name, avatar colour, invite code) → Participation Rules → first
  session → Home. `src/auth/AuthProvider.jsx` works out the current step;
  the router only shows that step.
- **Arriving from alke.network** (`src/lib/handoff.js`): on the web, the
  website is the welcome page. It sends people to
  `/#email=…&invite=…` (the root, so GitHub Pages' 404 redirect never sees it; the app moves it to /sign-up); the fragment is read once at startup, removed
  from the address bar, and fills the email (and the invite at the profile
  step). Signed-out web visitors to `/welcome` and old `/join/CODE` links go
  to alke.network (production builds only); the in-app welcome stays for
  native apps and Nuru. Invite links are now `alke.network/join/<Nuru ID>`.
  `VITE_SITE_URL` overrides the site address.
- **Data** (`src/lib/member.js`): name and avatar tint on `nuru_people`;
  `alke_members/{nuruId}` (username, rules, sessions) and
  `alke_usernames/{name}`. Session times are server timestamps and the rules
  allow one session per 24 hours.
- **Rules**: `firestore.alke.rules` is pasted into the live ruleset in the
  console (the project is shared; never deploy a rules file). Test them:
  `cd rules-tests && npm install && npm test` (needs Java; builds Nuru's rules
  + ours and runs them in the emulator).

Home, Mine, History, Allocation, Network and Profile show the member's live
data. Game results and progress go to the server (`alkeGameSync`), which
checks each result and writes the leaderboards; progress follows the member
to any device.

## Server features (functions/, codebase "alke")

- **Games** (`games.js`): `alkeGameSync` checks finished results (no repeats,
  in-range XP, 5 scored Rush runs a day) and writes `alke_scores`.
- **Notifications** (`notify.js`): feed in `alke_members/{id}/notifications`,
  pushed to the web app (FCM, needs `VITE_FCM_VAPID_KEY`) and to the Nuru
  app's tokens. `alkeReminders` (every 15 min: next session ready) and
  `alkeGameAlerts` (17:00 UTC, opt-in).
- **Personhood check** (`verification.js`): Stripe Identity (ID + live selfie
  + ID number) for the countries in `STRIPE_COUNTRIES` (override in
  `alke_config/verification.stripeCountries`); elsewhere photos to private
  Storage for a manual review by the team (`/team/reviews`, members listed
  in `alke_admins/{nuruId}`). Stripe webhook: `alkeStripeIdentity`.
- **Account** (`account.js`): `alkeDeleteAccount` deletes the ALKE
  membership (the Nuru account stays).

Secrets (`firebase functions:secrets:set NAME`): `STRIPE_SECRET_KEY`,
`STRIPE_IDENTITY_WEBHOOK_SECRET`, `ALKE_ID_HASH_SECRET`.
Rules: `firestore.alke.rules` and `storage.alke.rules` are pasted into the
live rulesets by hand (the project is shared).

## Local testing with emulators

Runs the whole sign-up flow without touching production. Start the Auth,
Firestore and Functions emulators from the Nuru repo (project `demo-alke-e2e`,
rules = `rules-tests/combined.rules`), then:

```
VITE_EMULATORS=1 VITE_FIREBASE_PROJECT=demo-alke-e2e npm run dev
```

Verification emails appear in the Auth emulator
(`http://127.0.0.1:9099/emulator/v1/projects/demo-alke-e2e/oobCodes`).

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`; `public/CNAME` sets the domain to `app.alke.network`.
