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
    const timeframeParam = (searchParams.get("timeframe") || "all") as TimeframeFilter
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 50)

    const stats = await fetchDashboardStats(user.id, timeframeParam)
    const activities = stats.recentSessions.slice(0, limit)

    return NextResponse.json({ activities })
  } catch (err) {
    console.error("[api/dashboard/activity] Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch study activity history" },
      { status: 500 }
    )
  }
}
