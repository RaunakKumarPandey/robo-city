import { NextRequest, NextResponse } from "next/server";
import { getSiteVisitCount, recordSiteVisit, setSiteVisitCount } from "@/lib/visitors";

export const dynamic = "force-dynamic";

/**
 * Check if the request is from an automated bot, crawler, or preview generator.
 */
function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botRegex = /bot|crawl|spider|slurp|facebookexternalhit|lighthouse|vercel|pingdom|uptime|ptst|headless|phantom|postman|insomnia/i;
  return botRegex.test(userAgent);
}

/**
 * GET /api/visitors
 * Optional query: ?inc=1 to increment visit count (only for real human sessions).
 * Without query: returns current real visit count.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldIncrement = searchParams.get("inc") === "1" || searchParams.get("increment") === "true";
    const userAgent = request.headers.get("user-agent");

    // If bot/spider, do NOT increment, only return current count
    if (shouldIncrement && !isBotUserAgent(userAgent)) {
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
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      count: 0,
      source: "error-fallback",
      error: error?.message,
    });
  }
}

/**
 * POST /api/visitors
 * Set or reset real visit count.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.resetTo === "number" || typeof body.count === "number") {
      const target = typeof body.resetTo === "number" ? body.resetTo : body.count;
      const res = await setSiteVisitCount(target);
      return NextResponse.json({ success: res.success, count: res.count });
    }

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
      success: false,
      count: 0,
      error: error?.message,
    });
  }
}

