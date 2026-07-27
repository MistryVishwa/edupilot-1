import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth-server"
import { fetchDashboardStats, TimeframeFilter } from "@/lib/dashboard-analytics"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const timeframeParam = searchParams.get("timeframe") as TimeframeFilter || "week"
    const validTimeframes: TimeframeFilter[] = ["today", "week", "month", "30days", "all"]
    const timeframe: TimeframeFilter = validTimeframes.includes(timeframeParam)
      ? timeframeParam
      : "week"

    const stats = await fetchDashboardStats(user.id, timeframe)
    return NextResponse.json(stats)
  } catch (err) {
    console.error("[api/dashboard/stats] Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics stats" },
      { status: 500 }
    )
  }
}
