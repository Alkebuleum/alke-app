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

`src/screens/*.jsx` are generated one-to-one from the design export
(`../ALKE Network App.html`). Each design board's markup becomes JSX and its
logic class (state, timers, game rules) becomes the component's base class,
built on the tiny `DCLogic` adapter in `src/dc.js`.

To regenerate after a new design export, unpack the export's screens to a
folder of `.html` templates and run:

```
npm run convert -- <templatesDir> src/screens tools/map.json
```

`tools/map.json` names each board and maps the design's links
(`Home.dc.html`, `MineActive.dc.html`, ...) to app routes.

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
- **Data** (`src/lib/member.js`): name and avatar tint on `nuru_people`;
  `alke_members/{nuruId}` (username, rules, sessions) and
  `alke_usernames/{name}`. Session times are server timestamps and the rules
  allow one session per 24 hours.
- **Rules**: `firestore.alke.rules` is pasted into the live ruleset in the
  console (the project is shared; never deploy a rules file). Test them:
  `cd rules-tests && npm install && npm test` (needs Java; builds Nuru's rules
  + ours and runs them in the emulator).

Home, Mine and the games still show the design's sample figures; game progress
is saved on the device.

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
