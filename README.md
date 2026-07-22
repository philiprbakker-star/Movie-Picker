# Movie Picker

A local web app that shows the best-rated movies and series of the past
month on HBO Max, Videoland, Netflix, Prime Video and Disney+ (NL), with
filters on platform, genre and length — plus a Suggestions tab that gives
AI-powered suggestions (Claude API) based on a short quiz.

## Tabs
- **Movies** — top 10 movies of the past month, sorted by IMDb rating.
- **Series** — same, for series.
- **Suggestions** — answer a few questions (mood, genre, time, who you're
  watching with) and get targeted suggestions from the current catalog.

## Data source
- **OMDb API** — IMDb rating, genre, runtime, release date per title (free
  API key required, see `.env.local.example`).
- **JustWatch NL** — scraping of public, per-platform "new" listing pages to
  determine what's available where. Fragile by design: if JustWatch changes
  their markup, the scrape returns 0 results and the existing cache is left
  untouched instead of being wiped.

Data is cached in `data/movies.db` (SQLite via Node's built-in
`node:sqlite`) and only refreshed via `npm run scrape`, not on every page
load. This file IS committed to the repo — it's the deployed catalog
snapshot, not a build artifact (see "Deploying" below).

## Updating the deployed catalog
Serverless hosts (e.g. Vercel) have a read-only deployment filesystem, so
the app can't scrape/write at request time in production. The workflow is:
1. Locally, run `npm run scrape` (or `npm run seed`) — this updates
   `data/movies.db` on disk.
2. Commit and push `data/movies.db`.
3. Redeploy (Vercel redeploys automatically on push to `main`).

On Vercel, `lib/db.ts` detects the `VERCEL` env var and copies the bundled
`data/movies.db` into the writable `/tmp` dir on cold start rather than
opening it in place.

## Setup
1. Copy `.env.local.example` to `.env.local` and fill in:
   - `OMDB_API_KEY` — free, via https://www.omdbapi.com/apikey.aspx
   - `ANTHROPIC_API_KEY` — via https://console.anthropic.com
2. `npm install`
3. `npm run seed` (sample data) or `npm run scrape` (fetch real data)
4. `npm run fetch-posters` (optional) — fills in poster images for the seed
   titles from Wikipedia's public API (no key needed); real scraped data
   from OMDb already includes posters, this is only for the seed dataset
5. `npm run dev` and open http://localhost:3000

## Scripts
- `npm run dev` — local dev server
- `npm run scrape` — scrape JustWatch NL + enrich with OMDb, write to SQLite
- `npm run seed` — populates the database with a handful of sample titles (no API keys needed)
- `npm run fetch-posters` — backfills poster images for the seed titles via Wikipedia (no key needed)
- `npm run build` / `npm run start` — production build/start
