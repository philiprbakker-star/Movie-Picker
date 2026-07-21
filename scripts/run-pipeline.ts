import "dotenv/config";
import { PLATFORMS } from "../lib/types";
import { getDb, recordScrapeRun, upsertTitle } from "../lib/db";
import { scrapeAllProviders } from "./scrape-justwatch";
import { fetchOmdbByTitle, sleep } from "./fetch-omdb";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

async function main() {
  getDb(); // ensures schema exists
  console.log("Scraping JustWatch NL for new titles per platform...");

  const entries = await scrapeAllProviders(PLATFORMS, ["movie", "series"]);
  console.log(`Found ${entries.length} raw listings from JustWatch.`);

  if (entries.length === 0) {
    recordScrapeRun("failed", 0, "JustWatch scrape returned 0 results — keeping existing cached data");
    console.warn("No entries scraped. Leaving existing database untouched.");
    return;
  }

  let enriched = 0;
  const now = new Date().toISOString();

  for (const entry of entries) {
    try {
      const omdb = await fetchOmdbByTitle(entry.title, entry.year, entry.type);
      if (!omdb) continue;

      // Only keep titles released within roughly the last month, since the
      // "top 10 of the last month" view relies on this filter.
      const releasedAt = omdb.releasedDate ? new Date(omdb.releasedDate).getTime() : null;
      const isRecent = releasedAt ? Date.now() - releasedAt <= ONE_MONTH_MS : true;
      if (!isRecent) continue;

      upsertTitle({
        imdbId: omdb.imdbId,
        title: omdb.title,
        type: omdb.type,
        year: omdb.year,
        genres: omdb.genres,
        runtimeMinutes: omdb.runtimeMinutes,
        imdbRating: omdb.imdbRating,
        plot: omdb.plot,
        posterUrl: omdb.posterUrl,
        releasedDate: omdb.releasedDate,
        addedToPlatformDate: now,
        platforms: [entry.platform],
      });
      enriched += 1;
    } catch (err) {
      console.warn(`Pipeline: failed to enrich "${entry.title}"`, err);
    }
    // OMDb free tier: be conservative with request rate.
    await sleep(250);
  }

  recordScrapeRun("success", enriched);
  console.log(`Pipeline complete. Upserted ${enriched} titles.`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  recordScrapeRun("failed", 0, String(err));
  process.exit(1);
});
