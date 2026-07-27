"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy, Activity, CalendarDays } from "lucide-react"

interface LearningStreakProps {
  currentStreak: number
  longestStreak: number
  avgDailySessions: number
}

export function LearningStreak({
  currentStreak,
  longestStreak,
  avgDailySessions,
}: LearningStreakProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Flame className="h-5 w-5 text-orange-500 animate-pulse" aria-hidden="true" />
          Learning Streak Indicator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <Flame className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-foreground">{currentStreak}</span>
              <span className="text-sm font-semibold text-orange-500">Days Streak</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentStreak > 0
                ? "Keep logging daily study activities to extend your streak!"
                : "Complete a study session today to start your learning streak."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Personal Best</span>
            </div>
            <p className="mt-1 text-xl font-bold text-foreground">{longestStreak} days</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span>Avg Daily Sessions</span>
            </div>
            <p className="mt-1 text-xl font-bold text-foreground">{avgDailySessions} / day</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
