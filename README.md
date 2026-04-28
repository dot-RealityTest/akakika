# AKAKIKA

[akakika.com](https://akakika.com) — portfolio, blog, and a curated list of interesting open source projects.

What you'll find:

| Page | What's there |
|------|-------------|
| `/` | Home — projects and about |
| `/apps` | App showcase |
| `/undrdr` | UNDRDR — under the radar repos, updated weekly |
| `/blog` | Blog posts |

## Get started

```bash
npm install
npm run dev
```

Then open [localhost:3000](http://localhost:3000) in your browser.

## Publish

```bash
npm run build
```

The finished site ends up in the `dist` folder. Vercel handles hosting.

## UNDRDR data

The repo list lives in `public/assets/data/undrdr.json`. Older weeks are saved as `undrdr-week-{week}-{year}.json`. A script updates these weekly.
