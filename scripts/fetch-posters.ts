import { getDb } from "../lib/db";

// Fetches a poster image per title from Wikipedia's public REST summary API
// (no API key required) and writes it into titles.poster_url. Used because
// we don't have a verified-working OMDb key yet; OMDb remains the intended
// long-term source (see scripts/fetch-omdb.ts / run-pipeline.ts).
//
// Exact Wikipedia article titles are hardcoded per seed title rather than
// relying on fuzzy search — search-based matching produced wrong results
// for common words (e.g. "Reacher" matched the unrelated 2012 "Jack
// Reacher" film poster, "Fallout" matched an unrelated 2021 film).
const WIKI_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

const WIKIPEDIA_TITLES: Record<string, string> = {
  Frankenstein: "Frankenstein (2025 film)",
  "K-Pop Demon Hunters": "KPop Demon Hunters",
  "Thunderbolts*": "Thunderbolts*",
  Sinners: "Sinners (2025 film)",
  "Mickey 17": "Mickey 17",
  "One Battle After Another": "One Battle After Another",
  Weapons: "Weapons (2025 film)",
  "Wicked: Part Two": "Wicked: For Good",
  "How to Train Your Dragon": "How to Train Your Dragon (2025 film)",
  Bugonia: "Bugonia (film)",
  "The Night Agent": "The Night Agent",
  "Devil May Cry": "Devil May Cry (TV series)",
  Reacher: "Reacher (TV series)",
  Fallout: "Fallout (American TV series)",
  Andor: "Andor (TV series)",
  "Daredevil: Born Again": "Daredevil: Born Again",
  // The Last of Us / The White Lotus: no poster/logo image is set as the
  // Wikipedia pageimage for these articles (only unrelated cast photos),
  // so they're intentionally left unmapped — the UI falls back to a
  // placeholder rather than showing an unrelated image.
  Task: "Task (TV series)",
  "Poker Face": "Poker Face (TV series)",
};

interface WikiSummary {
  thumbnail?: { source: string };
  originalimage?: { source: string };
}

async function fetchPosterUrl(wikiTitle: string): Promise<string | null> {
  const res = await fetch(`${WIKI_SUMMARY_URL}${encodeURIComponent(wikiTitle.replace(/ /g, "_"))}`, {
    headers: { "User-Agent": "MoviePickerPersonalUse/1.0 (contact: philiprbakker@gmail.com)" },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as WikiSummary;
  return data.originalimage?.source ?? data.thumbnail?.source ?? null;
}

async function main() {
  const db = getDb();
  const rows = db.prepare(`SELECT id, title FROM titles`).all() as {
    id: number;
    title: string;
  }[];

  const updateStmt = db.prepare(`UPDATE titles SET poster_url = ? WHERE id = ?`);
  let updated = 0;

  for (const row of rows) {
    const wikiTitle = WIKIPEDIA_TITLES[row.title];
    if (!wikiTitle) {
      console.warn(`✗ ${row.title}: no Wikipedia title mapping`);
      continue;
    }
    try {
      const posterUrl = await fetchPosterUrl(wikiTitle);
      if (posterUrl) {
        updateStmt.run(posterUrl, row.id);
        updated += 1;
        console.log(`✓ ${row.title} -> ${posterUrl}`);
      } else {
        console.warn(`✗ ${row.title}: no image on Wikipedia page "${wikiTitle}"`);
      }
    } catch (err) {
      console.warn(`✗ ${row.title}: ${err}`);
    }
    // Be polite to Wikipedia's API.
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\nUpdated ${updated}/${rows.length} posters.`);
}

main();
