import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import type { Platform, Title, TitleFilters, TitleType } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "movies.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS titles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imdb_id TEXT UNIQUE,
      title TEXT NOT NULL,
      type TEXT CHECK(type IN ('movie','series')) NOT NULL,
      year INTEGER,
      genres TEXT,
      runtime_minutes INTEGER,
      imdb_rating REAL,
      plot TEXT,
      poster_url TEXT,
      released_date TEXT,
      added_to_platform_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS title_platforms (
      title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
      platform TEXT CHECK(platform IN ('hbo_max','videoland','netflix','prime_video','disney_plus')) NOT NULL,
      PRIMARY KEY (title_id, platform)
    );

    CREATE TABLE IF NOT EXISTS scrape_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT,
      finished_at TEXT,
      status TEXT,
      titles_found INTEGER,
      error TEXT
    );
  `);
  return db;
}

function rowToTitle(row: Record<string, unknown>, platforms: Platform[]): Title {
  return {
    id: row.id as number,
    imdbId: (row.imdb_id as string) ?? null,
    title: row.title as string,
    type: row.type as TitleType,
    year: (row.year as number) ?? null,
    genres: row.genres ? (row.genres as string).split(",").map((g) => g.trim()) : [],
    runtimeMinutes: (row.runtime_minutes as number) ?? null,
    imdbRating: (row.imdb_rating as number) ?? null,
    plot: (row.plot as string) ?? null,
    posterUrl: (row.poster_url as string) ?? null,
    releasedDate: (row.released_date as string) ?? null,
    addedToPlatformDate: (row.added_to_platform_date as string) ?? null,
    platforms,
  };
}

export function getTitles(filters: TitleFilters): Title[] {
  const database = getDb();
  const limit = filters.limit ?? 10;

  let query = `
    SELECT DISTINCT t.* FROM titles t
    JOIN title_platforms tp ON tp.title_id = t.id
    WHERE t.type = ?
  `;
  const params: (string | number)[] = [filters.type];

  if (filters.platform) {
    query += ` AND tp.platform = ?`;
    params.push(filters.platform);
  }
  if (filters.genre) {
    query += ` AND t.genres LIKE ?`;
    params.push(`%${filters.genre}%`);
  }
  if (filters.maxRuntime) {
    query += ` AND (t.runtime_minutes IS NULL OR t.runtime_minutes <= ?)`;
    params.push(filters.maxRuntime);
  }

  query += ` ORDER BY t.imdb_rating DESC LIMIT ?`;
  params.push(limit);

  const rows = database.prepare(query).all(...params) as Record<string, unknown>[];

  const platformStmt = database.prepare(
    `SELECT platform FROM title_platforms WHERE title_id = ?`
  );

  return rows.map((row) => {
    const platformRows = platformStmt.all(row.id as number) as { platform: Platform }[];
    return rowToTitle(row, platformRows.map((p) => p.platform));
  });
}

export function getDistinctPlatforms(): Platform[] {
  const database = getDb();
  const rows = database
    .prepare(`SELECT DISTINCT platform FROM title_platforms ORDER BY platform`)
    .all() as { platform: Platform }[];
  return rows.map((r) => r.platform);
}

export function getDistinctGenres(): string[] {
  const database = getDb();
  const rows = database.prepare(`SELECT genres FROM titles WHERE genres IS NOT NULL`).all() as {
    genres: string;
  }[];
  const genreSet = new Set<string>();
  for (const row of rows) {
    row.genres.split(",").forEach((g) => genreSet.add(g.trim()));
  }
  return Array.from(genreSet).sort();
}

export function getLastScrapeRun() {
  const database = getDb();
  return database
    .prepare(`SELECT * FROM scrape_runs ORDER BY id DESC LIMIT 1`)
    .get() as Record<string, unknown> | undefined;
}

export interface UpsertTitleInput {
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
  addedToPlatformDate: string | null;
  platforms: Platform[];
}

export function upsertTitle(input: UpsertTitleInput): number {
  const database = getDb();

  const existing = input.imdbId
    ? (database.prepare(`SELECT id FROM titles WHERE imdb_id = ?`).get(input.imdbId) as
        | { id: number }
        | undefined)
    : undefined;

  const genresStr = input.genres.join(",");
  let titleId: number;

  if (existing) {
    database
      .prepare(
        `UPDATE titles SET title=?, type=?, year=?, genres=?, runtime_minutes=?, imdb_rating=?,
         plot=?, poster_url=?, released_date=?, added_to_platform_date=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=?`
      )
      .run(
        input.title,
        input.type,
        input.year,
        genresStr,
        input.runtimeMinutes,
        input.imdbRating,
        input.plot,
        input.posterUrl,
        input.releasedDate,
        input.addedToPlatformDate,
        existing.id
      );
    titleId = existing.id;
  } else {
    const result = database
      .prepare(
        `INSERT INTO titles (imdb_id, title, type, year, genres, runtime_minutes, imdb_rating,
         plot, poster_url, released_date, added_to_platform_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.imdbId,
        input.title,
        input.type,
        input.year,
        genresStr,
        input.runtimeMinutes,
        input.imdbRating,
        input.plot,
        input.posterUrl,
        input.releasedDate,
        input.addedToPlatformDate
      );
    titleId = result.lastInsertRowid as number;
  }

  database.prepare(`DELETE FROM title_platforms WHERE title_id = ?`).run(titleId);
  const insertPlatform = database.prepare(
    `INSERT OR IGNORE INTO title_platforms (title_id, platform) VALUES (?, ?)`
  );
  for (const platform of input.platforms) {
    insertPlatform.run(titleId, platform);
  }

  return titleId;
}

export function recordScrapeRun(status: string, titlesFound: number, error?: string) {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO scrape_runs (started_at, finished_at, status, titles_found, error)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(new Date().toISOString(), new Date().toISOString(), status, titlesFound, error ?? null);
}
