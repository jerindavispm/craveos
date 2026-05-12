# CraveOS

A mini AI ERP for independent cafes — local-first, no signup, runs entirely in your browser. Forecast tomorrow's prep, cut waste, never under-prep a rush.

**Live demo:** https://jerindavispm.github.io/craveos/

## What it does

- **AI prep forecast** — blends day-of-week patterns, recent momentum, and weather signal into a plain-English prep brief for tomorrow
- **Waste loop** — log what got tossed at close; the next forecast tightens itself
- **Quick entry** — log a day of sales in ~30 seconds, or upload a CSV from Square/Toast
- **See Demo** — one click loads a seeded 90-day fake cafe so visitors can poke around without typing anything
- **Workspace isolation** — your real data and the demo data live in separate buckets; switching never wipes your work
- **Your data, your device** — everything in `localStorage`. Export to JSON or CSV anytime.

## Stack

- Vite + React 19
- Tailwind CSS v4
- Motion (Framer Motion) for animations
- Recharts for the trend chart
- Zero backend — pure static site

## Forecast engine

The "AI" forecast in this build is a deterministic blend (no API key needed for the public demo):

- Weighted average of same-day-of-week history, last 14 days, and overall average (weights 3 / 2 / 1)
- Weather modifier (rainy → ~20% softer)
- Templated natural-language summary that picks the most interesting framing for the data shape

This is intentional — it keeps the demo fully free, no API key to leak, and the architecture is set up to swap in a real Claude call (via a Cloudflare Worker proxy) without changing the UI layer.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml` which builds and publishes to GitHub Pages at `<user>.github.io/craveos/`.

The Vite config sets `base: '/craveos/'` to match.

## Project layout

```
src/
  App.jsx                  view router (landing ↔ dashboard)
  main.jsx                 entry
  index.css                Tailwind v4 import + base styles
  lib/
    storage.js             localStorage workspace isolation
    seed.js                deterministic demo data generator
    forecast.js            forecast engine + summary builder
    csv.js                 CSV parse + export helpers
  components/
    Landing.jsx            hero + CTAs
    Dashboard.jsx          shell + tabs
    ForecastCard.jsx       tomorrow brief + prep grid
    TrendChart.jsx         14-day revenue area chart
    WasteLog.jsx           waste entries + inline form
    QuickEntry.jsx         daily sales entry form
    CsvUpload.jsx          CSV drop zone + parser
    WorkspaceSwitcher.jsx  workspace dropdown
    StatTile.jsx           top-row stat cards
```

## Roadmap (not in v1)

- "Bring your own Anthropic key" mode that wires the real Claude API to the summary
- Multi-location support
- Real weather API (OpenWeather free tier)
- Optional Supabase sync for cafes that want multi-device
