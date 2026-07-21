# Movie Picker

Lokale webapp die per maand de best beoordeelde films en series toont op HBO
Max, Videoland, Netflix, Prime Video en Disney+ (NL), met filters op
platform, genre en lengte — plus een Suggesties-tab die op basis van een
korte quiz AI-suggesties geeft (Claude API).

## Tabs
- **Films** — top 10 films van de afgelopen maand, gesorteerd op IMDb-score.
- **Series** — zelfde, voor series.
- **Suggesties** — beantwoord een paar vragen (stemming, genre, tijd, met wie)
  en krijg gerichte suggesties uit de huidige catalogus.

## Databron
- **OMDb API** — IMDb-score, genre, lengte, releasedatum per titel (gratis
  key nodig, zie `.env.local.example`).
- **JustWatch NL** — scraping van publieke, per-platform "nieuw" pagina's om
  te bepalen wat waar staat. Fragiel per ontwerp: als JustWatch hun markup
  wijzigt, levert de scrape 0 resultaten en blijft de bestaande cache staan
  in plaats van leeggemaakt te worden.

Data wordt lokaal gecached in `data/movies.db` (SQLite via Node's ingebouwde
`node:sqlite`) en alleen ververst via `npm run scrape`, niet bij elke
paginabezoek.

## Setup
1. Kopieer `.env.local.example` naar `.env.local` en vul in:
   - `OMDB_API_KEY` — gratis via https://www.omdbapi.com/apikey.aspx
   - `ANTHROPIC_API_KEY` — via https://console.anthropic.com
2. `npm install`
3. `npm run seed` (voorbeelddata) of `npm run scrape` (echte data ophalen)
4. `npm run dev` en open http://localhost:3000

## Scripts
- `npm run dev` — lokale dev-server
- `npm run scrape` — scrape JustWatch NL + verrijk met OMDb, schrijf naar SQLite
- `npm run seed` — vult de database met een handjevol voorbeeldtitels (geen API-keys nodig)
- `npm run build` / `npm run start` — productie-build/-start
