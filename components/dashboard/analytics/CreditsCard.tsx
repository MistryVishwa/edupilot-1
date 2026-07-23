"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RemainingCredits, ConsumedCredits } from "@/lib/dashboard-analytics"
import { Brain, Sparkles, Layers, Calendar, Trophy } from "lucide-react"

interface CreditsCardProps {
  remaining: RemainingCredits
  consumed: ConsumedCredits
  isTrial: boolean
}

export function CreditsCard({ remaining, consumed, isTrial }: CreditsCardProps) {
  const items = [
    {
      name: "AI Tutor Chats",
      icon: Brain,
      rem: remaining.ai_chat,
      used: consumed.ai_chat,
      max: 5,
      color: "bg-primary",
      textColor: "text-primary",
    },
    {
      name: "Flashcard Sets",
      icon: Layers,
      rem: remaining.flashcards,
      used: consumed.flashcards,
      max: 3,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
    },
    {
      name: "Study Plans",
      icon: Calendar,
      rem: remaining.study_plan,
      used: consumed.study_plan,
      max: 2,
      color: "bg-sky-500",
      textColor: "text-sky-500",
    },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
          AI Credits Overview
        </CardTitle>
        {isTrial && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
            <Trophy className="h-3.5 w-3.5" />
            Trial Active (Unlimited)
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isTrial ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
            <Trophy className="h-8 w-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-semibold text-foreground text-sm">Unlimited Trial Access</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All AI features are available without credit restrictions during your trial.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map((item) => {
              const totalAllocated = item.rem + item.used || item.max
              const pct = Math.min(100, Math.round((item.rem / totalAllocated) * 100))

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <item.icon className={`h-3.5 w-3.5 ${item.textColor}`} />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{item.rem}</strong> left ({item.used} used)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2 bg-secondary" />
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>Total Credits Consumed</span>
          <span className="font-bold text-foreground">{consumed.total} credits</span>
        </div>
      </CardContent>
    </Card>
  )
}
