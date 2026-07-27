import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth-server"
import { fetchDashboardStats, generatePersonalizedInsights } from "@/lib/dashboard-analytics"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await fetchDashboardStats(user.id, "all")
    const insights = await generatePersonalizedInsights(user.id, stats)

    return NextResponse.json({ insights })
  } catch (err) {
    console.error("[api/dashboard/insights] Error:", err)
    return NextResponse.json(
      { error: "Failed to generate personalized AI study insights" },
      { status: 500 }
    )
  }
}
