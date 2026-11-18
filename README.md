# Personal-Website

My personal website, [maxrosoff.com](https://maxrosoff.com): a terminal you can type into, an ice cream shop, a Polaroid frame friends can send photos to, and a few games.

## Getting Started

```bash
nvm use
npm install
npm start
```

That opens the site locally. A few other commands:

| Command               | What it does                                               |
| --------------------- | ---------------------------------------------------------- |
| `npm test`            | Runs the unit tests, then the smoke tests on seven devices |
| `npm run start-email` | Previews the email templates                               |
| `npm run types`       | Type checks everything                                     |
| `npm run lint`        | Lints everything                                           |
| `npm run format`      | Formats everything                                         |

The smoke tests need browsers the first time: `npx playwright install chromium webkit`.

Pushing to `main` deploys. GitHub Actions runs the checks and tests, then deploys the API. Cloudflare Pages builds and deploys the site.

## How It Works

**The site** is a React app served by Cloudflare Pages. It boots into a terminal, and the shop, Polaroid and other pages sit alongside it.

**The API** is a set of AWS Lambdas behind API Gateway, deployed with CDK. It handles the shop, the mailing list, friend invites and passkeys, and the Polaroid frame's photos.

**The edge** is a small Cloudflare Pages function. It gives each shared link its own preview image, and answers `curl -L maxrosoff.com` with a terminal card instead of the site.

**Link previews** are rendered by the API on demand: one card for the home page, the shop, the mailing list, friend invites and subscription links.

**The theme** keeps colors and fonts in one place for the site, the emails and the preview cards.

**Tests** come in two kinds. Unit tests cover everything with fakes for AWS, Stripe and email. Smoke tests run the real production build in real browsers, on phones, tablets and desktops.
