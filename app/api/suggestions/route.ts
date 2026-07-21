import { NextRequest, NextResponse } from "next/server";
import { getTitles } from "@/lib/db";
import { getSuggestions } from "@/lib/claude";
import type { SuggestionRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SuggestionRequest;

  if (!body.mood || !body.genrePreference || !body.timeAvailable || !body.watchingWith) {
    return NextResponse.json({ error: "Missing quiz answers" }, { status: 400 });
  }

  const catalog = [
    ...getTitles({ type: "movie", limit: 50 }),
    ...getTitles({ type: "series", limit: 50 }),
  ];

  if (catalog.length === 0) {
    return NextResponse.json(
      { error: "No catalog available. Run the scrape pipeline first." },
      { status: 400 }
    );
  }

  try {
    const suggestions = await getSuggestions(body, catalog);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Claude suggestion error:", err);
    return NextResponse.json({ error: "Failed to get suggestions." }, { status: 500 });
  }
}
