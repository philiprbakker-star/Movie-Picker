import { NextRequest, NextResponse } from "next/server";
import { getTitles } from "@/lib/db";
import type { Platform, SortBy, TitleType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") as TitleType) ?? "movie";
  const platforms = searchParams.getAll("platform") as Platform[];
  const genres = searchParams.getAll("genre");
  const maxRuntimeParam = searchParams.get("maxRuntime");
  const sortBy = (searchParams.get("sortBy") as SortBy | null) ?? undefined;
  const limitParam = searchParams.get("limit");

  const titles = getTitles({
    type,
    platforms: platforms.length > 0 ? platforms : undefined,
    genres: genres.length > 0 ? genres : undefined,
    maxRuntime: maxRuntimeParam ? parseInt(maxRuntimeParam, 10) : undefined,
    sortBy,
    limit: limitParam ? parseInt(limitParam, 10) : 10,
  });

  return NextResponse.json({ titles });
}
