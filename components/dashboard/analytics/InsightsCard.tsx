"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AIInsightItem } from "@/lib/dashboard-analytics"
import { Sparkles, RefreshCw, Lightbulb, CheckCircle2, Flame, AlertCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface InsightsCardProps {
  initialInsights: AIInsightItem[]
}

const CATEGORY_STYLE = {
  praise: { icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  suggestion: { icon: Lightbulb, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  streak: { icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  warning: { icon: AlertCircle, color: "text-rose-500", bgColor: "bg-rose-500/10" },
  tip: { icon: HelpCircle, color: "text-primary", bgColor: "bg-primary/10" },
}

export function InsightsCard({ initialInsights }: InsightsCardProps) {
  const [insights, setInsights] = useState<AIInsightItem[]>(initialInsights)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/dashboard/insights")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.insights) && data.insights.length > 0) {
          setInsights(data.insights)
        }
      }
    } catch {
      // silent
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" aria-hidden="true" />
          AI Learning Recommendations & Insights
        </CardTitle>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {insights.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((item) => {
              const style = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.tip
              const Icon = style.icon

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/30 p-3.5 transition-all hover:bg-secondary/50"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5",
                      style.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", style.color)} />
                  </div>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No personalized recommendations generated yet. Complete study sessions to receive tailored insights.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
