import { NextResponse } from "next/server";
import { getLastScrapeRun } from "@/lib/db";

export async function GET() {
  const run = getLastScrapeRun();
  return NextResponse.json({ lastRun: run ?? null });
}
