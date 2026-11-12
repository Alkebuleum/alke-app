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

## Data

Screens currently show the design's sample member (Ama Owusu) and figures.
Game progress for ALKE Hex and ALKE Rush is saved on the device
(`localStorage`). Accounts, sessions, allocation, invites and verification
need the ALKÉ Network backend, which is not connected yet.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`; `public/CNAME` sets the domain to `app.alke.network`.
