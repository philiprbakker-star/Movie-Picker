"use client";

import { useEffect, useState } from "react";
import { TitleCard } from "./TitleCard";
import { Sidebar, type Filters } from "./Sidebar";
import type { Platform, SortBy, Title, TitleType } from "@/lib/types";

export function TitleListPage({ type, heading }: { type: TitleType; heading: string }) {
  const [titles, setTitles] = useState<Title[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({ platforms: [], genres: [], maxRuntime: 200 });
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platforms")
      .then((r) => r.json())
      .then((d) => setPlatforms(d.platforms));
    fetch("/api/genres")
      .then((r) => r.json())
      .then((d) => setGenres(d.genres));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type, limit: "10", sortBy });
    filters.platforms.forEach((p) => params.append("platform", p));
    filters.genres.forEach((g) => params.append("genre", g));
    if (filters.maxRuntime < 200) params.set("maxRuntime", String(filters.maxRuntime));

    fetch(`/api/titles?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setTitles(d.titles))
      .finally(() => setLoading(false));
  }, [type, filters, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <Sidebar
        filters={filters}
        onChange={setFilters}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        platforms={platforms}
        genres={genres}
      />

      <div className="flex-1 min-w-0 w-full">
        <h1 className="text-2xl font-bold mb-4">{heading}</h1>
        {loading ? (
          <p className="text-neutral-500">Loading...</p>
        ) : titles.length === 0 ? (
          <p className="text-neutral-500">
            No titles found. Run <code>npm run scrape</code> first to populate the catalog.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {titles.map((t) => (
              <TitleCard key={t.id} title={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
