# Where To? — Deployment Guide

## Quick Deploy to Netlify

### Option 1: Git-based deploy (recommended)
1. Push this folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`
5. Click "Deploy"

### Option 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## How it works

- `public/index.html` — The game (static HTML, self-contained)
- `netlify/functions/flights.mjs` — Serverless function that:
  1. Picks 3 hub airports (date-seeded, deterministic)
  2. Fetches live flights from AirLabs API
  3. Returns flight pools for each hub
  4. **CDN-cached until midnight** — every player gets the same flights all day
- The AirLabs API key lives in the serverless function (never exposed to clients)
- Weather data (Open-Meteo) is fetched client-side (free, no key needed)
- If the API fails, the game falls back to a static route database (460 routes)

## Architecture

```
Player loads game
  → GET /api/flights (hits Netlify CDN)
  → CDN cache hit? → return cached flights (same for everyone)
  → CDN cache miss? → serverless function runs:
      → Calls AirLabs /flights for 3 hubs
      → Returns flight pools
      → CDN caches response until midnight UTC
  → Client picks flights from pools (date-seeded = deterministic)
  → Client fetches weather from Open-Meteo
  → Game renders
```

## API Usage
- AirLabs: ~3 calls/day (one per hub, CDN-cached)
- Free tier: 1,000 calls/month → ~333 days of runway
- Open-Meteo: unlimited, no key needed
