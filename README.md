# Personal-Website

My personal website, [maxrosoff.com](https://maxrosoff.com): a terminal you can type into, an ice cream shop, a Polaroid frame friends can send photos to, and a few games.

## How It Fits Together

| Folder            | What lives there                                                                 |
| ----------------- | -------------------------------------------------------------------------------- |
| `site/`           | The React app, built with Vite and served by Cloudflare Pages                    |
| `site/theme.ts`   | Colors, fonts and the MUI theme, shared by the site, the emails and the API      |
| `functions/`      | The Cloudflare Pages middleware                                                  |
| `api/`            | AWS Lambda handlers behind API Gateway, one per file in `api/endpoints/*/`       |
| `infrastructure/` | The CDK stack that deploys the API, tables, bucket and alarms                    |
| `tst/`            | Unit tests mirroring the source folders, plus browser smoke tests in `tst/smoke` |

### Link Previews

Every page shares one static `index.html`, so the Pages middleware gives link previews their per-page card. On pages with their own card it points `og:image` at `api.maxrosoff.com/preview.png`, passing along the page and its query string. The preview Lambda picks a card for the page (home, shop, mailing list, friend invite or subscription link), verifies any token, and renders it with Max's photo. The pages that get a card are listed once in `PREVIEW_CARD_PAGES`, and the build generates the middleware's routes from it.

### curl

`curl https://maxrosoff.com` answers with a terminal card instead of the site.

## Running It

```bash
nvm use
npm install
npm start
```

| Command               | What it does                                               |
| --------------------- | ---------------------------------------------------------- |
| `npm start`           | Runs the site locally                                      |
| `npm run start-email` | Previews the email templates                               |
| `npm test`            | Runs the unit tests, then the smoke tests on seven devices |
| `npm run types`       | Type checks everything                                     |
| `npm run lint`        | Lints everything                                           |
| `npm run format`      | Formats everything                                         |
| `npm run build-cdk`   | Bundles the Lambdas for deploying                          |

## Testing

Unit tests run in Vitest with 100% coverage required. AWS, Stripe and Resend are faked in memory at the boundary, and everything else runs for real.

The smoke tests run the production build in real browsers, on Cloudflare's local Pages runtime so the middleware runs too. They cover every main path on desktop Chrome and Safari, an iPhone, an iPhone SE, an iPad and Google and Samsung phones, with the API, Stripe.js and passkeys faked in the browser. They check behavior and computed styles rather than screenshots. Install the browsers once with `npx playwright install chromium webkit`.

## Deploying

Pushing to `main` deploys. GitHub Actions runs format, lint, types and unit tests alongside the smoke tests, then deploys the API with CDK once both pass. Cloudflare Pages builds and deploys the site on its own.
