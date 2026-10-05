import { NextRequest, NextResponse } from "next/server";
import { getSiteVisitCount, recordSiteVisit } from "@/lib/visitors";

export const dynamic = "force-dynamic";

/**
 * GET /api/visitors
 * Optional query: ?inc=1 to atomically increment visit count.
 * Without query: returns current cached visit count.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldIncrement = searchParams.get("inc") === "1" || searchParams.get("increment") === "true";

    if (shouldIncrement) {
      const result = await recordSiteVisit();
      return NextResponse.json(
        { success: true, count: result.count, source: result.source },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    const result = await getSiteVisitCount();
    return NextResponse.json(
      { success: true, count: result.count, source: result.source },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      count: 1240,
      source: "error-fallback",
      error: error?.message,
    });
  }
}

/**
 * POST /api/visitors
 * Explicitly increment visit count.
 */
export async function POST() {
  try {
    const result = await recordSiteVisit();
    return NextResponse.json(
      { success: true, count: result.count, source: result.source },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      count: 1240,
      source: "error-fallback",
      error: error?.message,
    });
  }
}
