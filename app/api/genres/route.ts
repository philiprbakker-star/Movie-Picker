import { NextResponse } from "next/server";
import { getDistinctGenres } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ genres: getDistinctGenres() });
}
