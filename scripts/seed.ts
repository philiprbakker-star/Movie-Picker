import { getDb, upsertTitle, recordScrapeRun } from "../lib/db";

// Sample data so the UI (filters, top-10, suggestions) can be exercised
// before OMDB_API_KEY / real JustWatch scraping is set up.
const SEED_TITLES = [
  {
    imdbId: "tt0000001",
    title: "Nachtwacht",
    type: "movie" as const,
    year: 2026,
    genres: ["Thriller", "Drama"],
    runtimeMinutes: 118,
    imdbRating: 8.1,
    plot: "Een rechercheur onderzoekt een reeks verdwijningen in Rotterdam.",
    posterUrl: null,
    releasedDate: "2026-07-01",
    addedToPlatformDate: "2026-07-01",
    platforms: ["netflix" as const],
  },
  {
    imdbId: "tt0000002",
    title: "Zonlicht",
    type: "movie" as const,
    year: 2026,
    genres: ["Comedy", "Romance"],
    runtimeMinutes: 95,
    imdbRating: 7.4,
    plot: "Twee vreemden delen een zomer in Zeeland.",
    posterUrl: null,
    releasedDate: "2026-07-05",
    addedToPlatformDate: "2026-07-05",
    platforms: ["prime_video" as const],
  },
  {
    imdbId: "tt0000003",
    title: "IJzeren Kroon",
    type: "series" as const,
    year: 2026,
    genres: ["Fantasy", "Drama"],
    runtimeMinutes: 55,
    imdbRating: 8.7,
    plot: "Een middeleeuws rijk valt uiteen na de dood van de koning.",
    posterUrl: null,
    releasedDate: "2026-06-25",
    addedToPlatformDate: "2026-06-25",
    platforms: ["hbo_max" as const],
  },
  {
    imdbId: "tt0000004",
    title: "Lachspiegel",
    type: "series" as const,
    year: 2026,
    genres: ["Comedy"],
    runtimeMinutes: 25,
    imdbRating: 7.9,
    plot: "Een sketchshow over het Nederlandse kantoorleven.",
    posterUrl: null,
    releasedDate: "2026-07-10",
    addedToPlatformDate: "2026-07-10",
    platforms: ["videoland" as const],
  },
  {
    imdbId: "tt0000005",
    title: "Sterrenreis: Ontwaken",
    type: "movie" as const,
    year: 2026,
    genres: ["Sci-Fi", "Action"],
    runtimeMinutes: 142,
    imdbRating: 8.3,
    plot: "Een bemanning ontdekt een signaal buiten het zonnestelsel.",
    posterUrl: null,
    releasedDate: "2026-07-08",
    addedToPlatformDate: "2026-07-08",
    platforms: ["disney_plus" as const],
  },
];

function main() {
  getDb();
  for (const t of SEED_TITLES) {
    upsertTitle(t);
  }
  recordScrapeRun("success", SEED_TITLES.length, "seed data");
  console.log(`Seeded ${SEED_TITLES.length} titles.`);
}

main();
