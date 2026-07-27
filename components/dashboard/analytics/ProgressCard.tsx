"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle2, Calendar } from "lucide-react"

interface ProgressCardProps {
  completedStudyPlans: number
  totalStudyPlans: number
  totalTasks: number
  completedTasks: number
  percentage: number
}

export function ProgressCard({
  completedStudyPlans,
  totalStudyPlans,
  totalTasks,
  completedTasks,
  percentage,
}: ProgressCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Target className="h-5 w-5 text-primary" aria-hidden="true" />
          Goal & Plan Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Tasks Completed</span>
            <span className="font-bold text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2.5 bg-secondary" />
          <p className="text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} study tasks accomplished across your plans
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4 text-violet-500" />
              <span>Total Plans</span>
            </div>
            <p className="mt-1 text-xl font-bold text-foreground">{totalStudyPlans}</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Completed Plans</span>
            </div>
            <p className="mt-1 text-xl font-bold text-foreground">{completedStudyPlans}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
