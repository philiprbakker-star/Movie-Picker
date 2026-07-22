export type TitleType = "movie" | "series";

export type Platform =
  | "hbo_max"
  | "videoland"
  | "netflix"
  | "prime_video"
  | "disney_plus";

export const PLATFORMS: Platform[] = [
  "hbo_max",
  "videoland",
  "netflix",
  "prime_video",
  "disney_plus",
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  hbo_max: "HBO Max",
  videoland: "Videoland",
  netflix: "Netflix",
  prime_video: "Prime Video",
  disney_plus: "Disney+",
};

export interface Title {
  id: number;
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

export type SortBy = "rating" | "year" | "runtime";

export interface TitleFilters {
  type: TitleType;
  platforms?: Platform[];
  genres?: string[];
  maxRuntime?: number;
  sortBy?: SortBy;
  limit?: number;
}

export interface SuggestionRequest {
  mood: string;
  genrePreference: string;
  timeAvailable: string;
  watchingWith: string;
}

export interface Suggestion {
  title: string;
  type: TitleType;
  platform: string;
  reason: string;
}
