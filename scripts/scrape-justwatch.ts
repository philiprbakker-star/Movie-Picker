import * as cheerio from "cheerio";
import type { Platform, TitleType } from "../lib/types";

const JUSTWATCH_PROVIDER_SLUGS: Record<Platform, string> = {
  hbo_max: "hbo-max",
  videoland: "videoland",
  netflix: "netflix",
  prime_video: "amazon-prime-video",
  disney_plus: "disney-plus",
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MoviePickerPersonalUse/1.0 (contact: philiprbakker@gmail.com)";

export interface JustWatchEntry {
  title: string;
  year: number | null;
  platform: Platform;
  type: TitleType;
}

function buildUrl(platform: Platform, type: TitleType): string {
  const slug = JUSTWATCH_PROVIDER_SLUGS[platform];
  const category = type === "movie" ? "movies" : "tv-shows";
  return `https://www.justwatch.com/nl/aanbod/${slug}/${category}?sort_by=release_year`;
}

// NOTE: JustWatch does not offer a public API. This scrapes their public,
// server-rendered listing pages. The CSS selectors below match the site's
// markup as of writing but WILL break if JustWatch changes their frontend —
// that's expected and acceptable for personal use; if a scrape returns 0
// results, the pipeline should keep the last-known-good cached data rather
// than wiping it.
export async function scrapeJustWatchProvider(
  platform: Platform,
  type: TitleType
): Promise<JustWatchEntry[]> {
  const url = buildUrl(platform, type);
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "nl-NL,nl;q=0.9" },
  });

  if (!res.ok) {
    console.warn(`JustWatch: failed to fetch ${url} (status ${res.status})`);
    return [];
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const entries: JustWatchEntry[] = [];

  $("[data-testid='title-poster'], .title-list-row__row").each((_, el) => {
    const titleAttr =
      $(el).find("img").attr("alt")?.trim() ??
      $(el).find(".title-list-row__column-header a").text().trim();
    if (!titleAttr) return;

    const yearText = $(el).find(".title-list-row__year, [data-testid='title-release-year']").first().text();
    const yearMatch = yearText.match(/(\d{4})/);

    entries.push({
      title: titleAttr,
      year: yearMatch ? parseInt(yearMatch[1], 10) : null,
      platform,
      type,
    });
  });

  return entries;
}

export async function scrapeAllProviders(
  platforms: Platform[],
  types: TitleType[]
): Promise<JustWatchEntry[]> {
  const results: JustWatchEntry[] = [];
  for (const type of types) {
    for (const platform of platforms) {
      try {
        const entries = await scrapeJustWatchProvider(platform, type);
        results.push(...entries);
      } catch (err) {
        console.warn(`JustWatch: error scraping ${platform}/${type}`, err);
      }
      // Rate-limit: be polite, ~1 request/sec.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return results;
}
