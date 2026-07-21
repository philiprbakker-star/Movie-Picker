import { NextRequest, NextResponse } from "next/server";
import { getTitles } from "@/lib/db";
import type { Platform, TitleType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") as TitleType) ?? "movie";
  const platform = (searchParams.get("platform") as Platform | null) ?? undefined;
  const genre = searchParams.get("genre") ?? undefined;
  const maxRuntimeParam = searchParams.get("maxRuntime");
  const limitParam = searchParams.get("limit");

  const titles = getTitles({
    type,
    platform,
    genre,
    maxRuntime: maxRuntimeParam ? parseInt(maxRuntimeParam, 10) : undefined,
    limit: limitParam ? parseInt(limitParam, 10) : 10,
  });

  return NextResponse.json({ titles });
}
