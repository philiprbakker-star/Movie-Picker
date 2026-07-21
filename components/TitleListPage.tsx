"use client";

import { useEffect, useState } from "react";
import { TitleCard } from "./TitleCard";
import { FilterBar, type Filters } from "./FilterBar";
import type { Platform, Title, TitleType } from "@/lib/types";

export function TitleListPage({ type, heading }: { type: TitleType; heading: string }) {
  const [titles, setTitles] = useState<Title[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({ platform: "", genre: "", maxRuntime: "" });
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
    const params = new URLSearchParams({ type, limit: "10" });
    if (filters.platform) params.set("platform", filters.platform);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.maxRuntime) params.set("maxRuntime", filters.maxRuntime);

    fetch(`/api/titles?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setTitles(d.titles))
      .finally(() => setLoading(false));
  }, [type, filters]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{heading}</h1>
      <FilterBar filters={filters} onChange={setFilters} platforms={platforms} genres={genres} />
      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : titles.length === 0 ? (
        <p className="text-neutral-500">
          No titles found. Run <code>npm run scrape</code> first to populate the catalog.
        </p>
      ) : (
        <div className="grid gap-3">
          {titles.map((t) => (
            <TitleCard key={t.id} title={t} />
          ))}
        </div>
      )}
    </div>
  );
}
