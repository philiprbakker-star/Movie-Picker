"use client";

import { PLATFORM_LABELS, type Platform } from "@/lib/types";

export interface Filters {
  platform: Platform | "";
  genre: string;
  maxRuntime: string;
}

export function FilterBar({
  filters,
  onChange,
  platforms,
  genres,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  platforms: Platform[];
  genres: string[];
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        className="border rounded px-3 py-1.5 text-sm bg-transparent"
        value={filters.platform}
        onChange={(e) => onChange({ ...filters, platform: e.target.value as Platform | "" })}
      >
        <option value="">Alle platformen</option>
        {platforms.map((p) => (
          <option key={p} value={p}>
            {PLATFORM_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        className="border rounded px-3 py-1.5 text-sm bg-transparent"
        value={filters.genre}
        onChange={(e) => onChange({ ...filters, genre: e.target.value })}
      >
        <option value="">Alle genres</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select
        className="border rounded px-3 py-1.5 text-sm bg-transparent"
        value={filters.maxRuntime}
        onChange={(e) => onChange({ ...filters, maxRuntime: e.target.value })}
      >
        <option value="">Elke lengte</option>
        <option value="30">Tot 30 min</option>
        <option value="60">Tot 1 uur</option>
        <option value="90">Tot 1,5 uur</option>
        <option value="120">Tot 2 uur</option>
        <option value="180">Tot 3 uur</option>
      </select>
    </div>
  );
}
