"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  subtext?: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  color?: string
  bgColor?: string
}

export function StatCard({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  trend,
  trendUp,
  color = "text-primary",
  bgColor = "bg-primary/10",
}: StatCardProps) {
  return (
    <Card className="border-border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {value}
              </span>
              {unit && (
                <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>

          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              bgColor
            )}
          >
            <Icon className={cn("h-5 w-5", color)} aria-hidden="true" />
          </div>
        </div>

        {(subtext || trend) && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs">
            {subtext && (
              <span className="text-muted-foreground truncate">{subtext}</span>
            )}
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold shrink-0 rounded-full px-2 py-0.5",
                  trendUp === false
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-emerald-500/10 text-emerald-500"
                )}
              >
                {trendUp === false ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {trend}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
