import { NextResponse } from "next/server";
import { getDistinctPlatforms } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ platforms: getDistinctPlatforms() });
}
