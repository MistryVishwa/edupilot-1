"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentActivityItem } from "@/lib/dashboard-analytics"
import {
  Brain,
  Layers,
  Calendar,
  HelpCircle,
  FileText,
  Clock,
  History,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
  activities: RecentActivityItem[]
}

const TYPE_CONFIG = {
  ai_tutor: { icon: Brain, color: "text-violet-500", bgColor: "bg-violet-500/10", label: "AI Tutor" },
  flashcards: { icon: Layers, color: "text-emerald-500", bgColor: "bg-emerald-500/10", label: "Flashcards" },
  study_plan: { icon: Calendar, color: "text-sky-500", bgColor: "bg-sky-500/10", label: "Study Plan" },
  quiz: { icon: HelpCircle, color: "text-amber-500", bgColor: "bg-amber-500/10", label: "Quiz" },
  note: { icon: FileText, color: "text-rose-500", bgColor: "bg-rose-500/10", label: "Saved Note" },
  time_tracking: { icon: Clock, color: "text-primary", bgColor: "bg-primary/10", label: "Study Session" },
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 60) return "Just now"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const hasItems = activities && activities.length > 0

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          Recent Study Activity Timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        {hasItems ? (
          <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {activities.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.time_tracking
              const Icon = cfg.icon

              return (
                <div key={item.id} className="relative flex items-start gap-3 pl-1">
                  <div
                    className={cn(
                      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-background shadow-xs",
                      cfg.bgColor
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                  </div>

                  <div className="flex-1 min-w-0 rounded-lg border border-border/50 bg-secondary/30 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-primary" />
                        {item.subject}
                      </span>

                      {item.metadata?.score !== undefined && (
                        <span className="font-bold text-emerald-500">
                          Score: {String(item.metadata.score)} ({String(item.metadata.percentage)}%)
                        </span>
                      )}
                      {item.metadata?.count !== undefined && (
                        <span className="font-semibold text-foreground">
                          {String(item.metadata.count)} cards
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-center">
            <div>
              <History className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">No Recent Activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your study timeline will populate as you create flashcards, complete quizzes, or chat with AI Tutor.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
