"use client";

import { useState } from "react";
import { PLATFORM_LABELS, type Platform, type SortBy } from "@/lib/types";

export interface Filters {
  platforms: Platform[];
  genres: string[];
  maxRuntime: number;
}

const MAX_RUNTIME_CEILING = 200;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "rating", label: "IMDb rating" },
  { value: "year", label: "Newest" },
  { value: "runtime", label: "Runtime" },
];

export function Sidebar({
  filters,
  onChange,
  sortBy,
  onSortByChange,
  platforms,
  genres,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  sortBy: SortBy;
  onSortByChange: (sortBy: SortBy) => void;
  platforms: Platform[];
  genres: string[];
}) {
  const [genreSearch, setGenreSearch] = useState("");

  function togglePlatform(p: Platform) {
    const next = filters.platforms.includes(p)
      ? filters.platforms.filter((x) => x !== p)
      : [...filters.platforms, p];
    onChange({ ...filters, platforms: next });
  }

  function toggleGenre(g: string) {
    const next = filters.genres.includes(g)
      ? filters.genres.filter((x) => x !== g)
      : [...filters.genres, g];
    onChange({ ...filters, genres: next });
  }

  const visibleGenres = genres.filter((g) =>
    g.toLowerCase().includes(genreSearch.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-2">
            Sort by
          </label>
          <select
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-3">
            Max runtime
          </label>
          <input
            type="range"
            min={20}
            max={MAX_RUNTIME_CEILING}
            step={10}
            value={filters.maxRuntime}
            onChange={(e) => onChange({ ...filters, maxRuntime: Number(e.target.value) })}
            className="w-full accent-[#4f46e5]"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>20 min</span>
            <span className="font-medium text-neutral-800">
              {filters.maxRuntime >= MAX_RUNTIME_CEILING ? "No limit" : `${filters.maxRuntime} min`}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-3">
            Platform
          </label>
          <div className="flex flex-col gap-2">
            {platforms.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#4f46e5]"
                  checked={filters.platforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                />
                {PLATFORM_LABELS[p]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400 mb-3">
            Genre
          </label>
          <input
            type="text"
            placeholder="Search genre..."
            value={genreSearch}
            onChange={(e) => setGenreSearch(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm mb-3"
          />
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {visibleGenres.map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#4f46e5]"
                  checked={filters.genres.includes(g)}
                  onChange={() => toggleGenre(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
