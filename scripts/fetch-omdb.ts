import "dotenv/config";
import type { TitleType } from "../lib/types";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com/";

export interface OmdbResult {
  imdbId: string | null;
  title: string;
  type: TitleType;
  year: number | null;
  genres: string[];
  runtimeMinutes: number | null;
  imdbRating: number | null;
  plot: string | null;
  posterUrl: string | null;
  releasedDate: string | null;
}

interface OmdbApiResponse {
  Response: "True" | "False";
  Error?: string;
  imdbID?: string;
  Title?: string;
  Type?: string;
  Year?: string;
  Genre?: string;
  Runtime?: string;
  imdbRating?: string;
  Plot?: string;
  Poster?: string;
  Released?: string;
}

function parseRuntime(runtime?: string): number | null {
  if (!runtime) return null;
  const match = runtime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function parseRating(rating?: string): number | null {
  if (!rating || rating === "N/A") return null;
  const value = parseFloat(rating);
  return Number.isNaN(value) ? null : value;
}

function parseReleased(released?: string): string | null {
  if (!released || released === "N/A") return null;
  const date = new Date(released);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export async function fetchOmdbByTitle(
  title: string,
  year: number | null,
  type: TitleType
): Promise<OmdbResult | null> {
  if (!OMDB_API_KEY) {
    throw new Error("OMDB_API_KEY is not set. Copy .env.local.example to .env.local and fill it in.");
  }

  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    t: title,
    type: type === "movie" ? "movie" : "series",
  });
  if (year) params.set("y", String(year));

  const res = await fetch(`${OMDB_BASE_URL}?${params.toString()}`);
  const data = (await res.json()) as OmdbApiResponse;

  if (data.Response === "False") {
    console.warn(`OMDb: no match for "${title}" (${year ?? "?"}): ${data.Error}`);
    return null;
  }

  return {
    imdbId: data.imdbID ?? null,
    title: data.Title ?? title,
    type: data.Type === "series" ? "series" : "movie",
    year: data.Year ? parseInt(data.Year, 10) : year,
    genres: data.Genre ? data.Genre.split(",").map((g) => g.trim()) : [],
    runtimeMinutes: parseRuntime(data.Runtime),
    imdbRating: parseRating(data.imdbRating),
    plot: data.Plot ?? null,
    posterUrl: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
    releasedDate: parseReleased(data.Released),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
